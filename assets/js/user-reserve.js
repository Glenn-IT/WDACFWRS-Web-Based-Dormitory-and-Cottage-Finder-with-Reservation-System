document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
  if (!session) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") === "cottage" ? "cottage" : "dorm";
  const assetId = params.get("id");

  let asset = null;
  try {
    const data = type === "dorm" ? await DataAPI.getDorm(assetId) : await DataAPI.getCottage(assetId);
    asset = data.dorm || data.cottage || null;
  } catch (e) {
    asset = null;
  }

  if (!asset) {
    document.querySelector("main.app-main").innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Room or cottage not found.<br><a href="rooms.html" class="btn btn-primary mt-2">Back to Rooms</a></div>`;
    return;
  }

  // Requirement: My Reservation - should not accept new reservation if there is existing approved.
  let hasApprovedReservation = false;
  try {
    const userResData = await DataAPI.getReservations();
    const existingList = userResData.reservations || [];
    hasApprovedReservation = existingList.some((r) => r.approvalStatus === "Approved");
  } catch (e) {
    hasApprovedReservation = false;
  }

  if (hasApprovedReservation) {
    const warningEl = document.getElementById("approved-res-warning");
    if (warningEl) warningEl.classList.remove("d-none");
    const toStep2 = document.getElementById("to-step-2-btn");
    if (toStep2) {
      toStep2.disabled = true;
      toStep2.classList.add("disabled");
      toStep2.title = "You already have an active approved reservation.";
    }
  }

  const wizardState = {
    paymentMethod: null,
  };

  function goToStep(n) {
    for (let i = 1; i <= 3; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      if (stepEl) stepEl.classList.toggle("d-none", i !== n);
      const ind = document.getElementById(`step-indicator-${i}`);
      if (ind) {
        ind.classList.toggle("active", i === n);
        ind.classList.toggle("done", i < n);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- Step 1 ----
  const price = asset.price;
  const label = type === "dorm" ? (asset.dormitoryName || asset.roomNumber) : asset.name;
  document.getElementById("selected-asset-card").innerHTML = `
    <div class="row g-3 align-items-center">
      <div class="col-md-4"><img src="${resolveAsset(asset.image)}" class="w-100 rounded" style="height:160px;object-fit:cover;"></div>
      <div class="col-md-8">
        <h5 class="fw-bold mb-1">${escapeHtml(label)}</h5>
        <p class="text-muted mb-1">${type === "dorm" ? `Dormitory · Capacity ${asset.capacity} pax` : `Owner: ${escapeHtml(asset.owner)} · ${asset.rooms} rooms`}</p>
        <h5 class="text-primary fw-bold">₱${Number(price || 0).toLocaleString()} ${type === "dorm" ? "/ month" : "/ day"}</h5>
      </div>
    </div>`;

  document.getElementById("to-step-2-btn").addEventListener("click", () => {
    if (hasApprovedReservation) {
      showToast("You already have an active approved reservation.", "error");
      return;
    }
    goToStep(2);
  });

  // ---- Step 2: Payment ----
  document.querySelectorAll(".payment-option").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach((o) => o.classList.remove("border-primary", "border-2", "bg-light"));
      el.classList.add("border-primary", "border-2", "bg-light");
      wizardState.paymentMethod = el.dataset.method;
      document.getElementById("qr-section").classList.remove("d-none");
      document.getElementById("qr-caption").textContent =
        wizardState.paymentMethod === "Cash"
          ? "Please pay in cash at the Finance Office upon check-in."
          : `Scan the QR code using your ${wizardState.paymentMethod} app to pay ₱${Number(price || 0).toLocaleString()}.`;
      document.getElementById("to-step-3-btn").disabled = false;
    });
  });

  document.getElementById("step2-to-step1-btn").addEventListener("click", () => goToStep(1));

  document.getElementById("to-step-3-btn").addEventListener("click", () => {
    buildReceipt();
    goToStep(3);
  });

  // ---- Step 3: Receipt ----
  function buildReceipt() {
    const today = new Date().toISOString().slice(0, 10);
    const paymentStatus = wizardState.paymentMethod === "Cash" ? "Pending" : "Paid";

    document.getElementById("receipt-card").innerHTML = `
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">${type === "dorm" ? "Dormitory" : "Cottage"}</span><strong>${escapeHtml(label)}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Payment Method</span><strong>${wizardState.paymentMethod}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Amount</span><strong>₱${Number(price || 0).toLocaleString()}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Reservation Date</span><strong>${today}</strong>
      </div>
      <div class="d-flex justify-content-between">
        <span class="text-muted">Payment Status</span><span class="badge ${badgeClass(paymentStatus)}">${paymentStatus}</span>
      </div>`;
  }

  document.getElementById("step3-to-step2-btn").addEventListener("click", () => goToStep(2));

  document.getElementById("save-receipt-btn").addEventListener("click", () => {
    showToast("Receipt saved to your device.", "info");
  });

  document.getElementById("print-receipt-btn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("submit-reservation-btn").addEventListener("click", () => {
    if (hasApprovedReservation) {
      showToast("You already have an active approved reservation.", "error");
      return;
    }
    withLoading(async () => {
      try {
        await DataAPI.createReservation({
          type: type === "dorm" ? "Dormitory" : "Cottage",
          assetId: asset.id,
          paymentMethod: wizardState.paymentMethod,
        });
        showToast("Reservation submitted successfully!", "success");
        setTimeout(() => (window.location.href = "my-reservations.html"), 900);
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
});
