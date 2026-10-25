document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
  if (!session) return;

  const grid = document.getElementById("reservations-grid");
  const refundModalEl = document.getElementById("request-refund-modal");
  const refundModal = refundModalEl ? new bootstrap.Modal(refundModalEl) : null;
  let reservations = [];

  async function render() {
    const data = await DataAPI.getReservations({ mine: 1 });
    reservations = data.reservations || [];

    const hasApproved = reservations.some((r) => r.approvalStatus === "Approved");
    const bannerEl = document.getElementById("approved-banner");
    if (bannerEl) bannerEl.classList.toggle("d-none", !hasApproved);

    grid.innerHTML = reservations.length
      ? reservations.map((r) => card(r)).join("")
      : `<div class="col-12 empty-state"><i class="fa-solid fa-clipboard"></i>You have no reservations yet.<br><a href="rooms.html" class="btn btn-primary mt-2">Browse Rooms</a></div>`;

    grid.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => viewReservation(btn.dataset.view));
    });
    grid.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => cancelReservation(btn.dataset.cancel));
    });
    grid.querySelectorAll("[data-request-refund]").forEach((btn) => {
      btn.addEventListener("click", () => openRequestRefundModal(btn.dataset.requestRefund));
    });
  }

  function card(r) {
    const isPaid = r.paymentStatus === "Paid";
    const isRefundPending = r.refundStatus === "Pending";
    const isRefunded = r.paymentStatus === "Refunded" || r.refundStatus === "Approved";
    const canCancel = (r.approvalStatus === "Pending" || r.approvalStatus === "Approved") && !isRefundPending && !isRefunded;

    let actionBtn = "";
    if (isRefundPending) {
      actionBtn = `<button class="btn btn-sm btn-outline-warning flex-fill" disabled title="Refund is currently being reviewed by admin"><i class="fa-solid fa-clock me-1"></i>Refund Pending</button>`;
    } else if (isPaid && canCancel) {
      actionBtn = `<button class="btn btn-sm btn-outline-danger flex-fill" data-request-refund="${r.id}"><i class="fa-solid fa-hand-holding-dollar me-1"></i>Request Refund</button>`;
    } else if (canCancel) {
      actionBtn = `<button class="btn btn-sm btn-outline-danger flex-fill" data-cancel="${r.id}">Cancel</button>`;
    }

    return `
      <div class="col-sm-6 col-lg-4">
        <div class="room-card ${isRefundPending ? "border border-warning border-2" : ""}">
          <img src="${resolveAsset(r.image)}" alt="${escapeHtml(r.assetLabel)}">
          <div class="room-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="fw-bold mb-1">${escapeHtml(r.assetLabel)}</h6>
              <span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span>
            </div>
            <p class="text-muted small mb-1">${r.type} · #${r.id}</p>
            <p class="small mb-2">
              <i class="fa-solid fa-calendar-day me-1"></i>${r.reservationDate}
              &nbsp;<span class="badge ${badgeClass(r.paymentStatus)}">${r.paymentStatus}</span>
              ${r.refundStatus && r.refundStatus !== "None" ? `<span class="badge ${r.refundStatus === "Pending" ? "bg-warning text-dark" : (r.refundStatus === "Approved" ? "bg-success" : "bg-danger")} ms-1">Refund: ${r.refundStatus}</span>` : ""}
            </p>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-fill" data-view="${r.id}">View</button>
              ${actionBtn}
            </div>
          </div>
        </div>
      </div>`;
  }

  function viewReservation(id) {
    const r = reservations.find((x) => String(x.id) === String(id));
    if (!r) return;

    let refundCard = "";
    if (r.refundStatus && r.refundStatus !== "None") {
      const isApproved = r.refundStatus === "Approved";
      const isPending = r.refundStatus === "Pending";
      const borderClass = isApproved ? "border-success-subtle bg-success-subtle" : (isPending ? "border-warning-subtle bg-warning-subtle" : "border-danger-subtle bg-danger-subtle");
      const icon = isApproved ? "fa-circle-check text-success" : (isPending ? "fa-clock text-warning" : "fa-circle-xmark text-danger");

      refundCard = `
        <div class="p-3 border rounded mt-3 bg-opacity-10 ${borderClass}">
          <h6 class="fw-bold mb-2"><i class="fa-solid ${icon} me-2"></i>Refund Status: ${r.refundStatus}</h6>
          <div class="row g-2 small">
            <div class="col-sm-6"><strong>Preferred Method:</strong> ${escapeHtml(r.refundMethod || "N/A")}</div>
            <div class="col-sm-6"><strong>Account / Payee Name:</strong> ${escapeHtml(r.refundAccountName || "N/A")}</div>
            <div class="col-sm-6"><strong>Account / Mobile Number:</strong> <span class="font-monospace fw-bold">${escapeHtml(r.refundAccountNumber || "N/A")}</span></div>
            <div class="col-sm-6"><strong>Requested Date:</strong> ${r.refundRequestDate || "N/A"}</div>
            <div class="col-12 mt-1">
              <span class="text-muted d-block">Your Cancellation Reason:</span>
              <div class="p-2 border rounded bg-white mt-1 fst-italic">${escapeHtml(r.refundReason || "None provided")}</div>
            </div>
            ${r.refundProcessedDate ? `
              <div class="col-sm-6 mt-2"><strong>Processed Date:</strong> ${r.refundProcessedDate}</div>
              <div class="col-sm-6 mt-2"><strong>Admin Transfer Ref #:</strong> <span class="badge bg-success-subtle text-dark border font-monospace">${escapeHtml(r.refundReferenceNumber || "N/A")}</span></div>` : ""}
            ${r.refundAdminNotes ? `
              <div class="col-12 mt-2">
                <span class="text-muted d-block">Admin Confirmation Notes / Feedback:</span>
                <div class="p-2 border rounded bg-white mt-1">${escapeHtml(r.refundAdminNotes)}</div>
              </div>` : ""}
            ${r.refundReceiptImage ? `
              <div class="col-12 mt-2 text-center p-2 border rounded bg-white">
                <span class="small fw-semibold d-block text-success mb-1"><i class="fa-solid fa-receipt me-1"></i>Admin Proof of Resent Funds</span>
                <img src="${resolveAsset(r.refundReceiptImage)}" alt="Proof of Resent Funds" class="img-fluid rounded border shadow-sm" style="max-height: 150px; object-fit: contain; cursor: pointer;" onclick="window.open('${resolveAsset(r.refundReceiptImage)}', '_blank')">
              </div>` : ""}
          </div>
        </div>`;
    }

    const isPaid = r.paymentStatus === "Paid";
    const canRequestRefund = isPaid && (r.approvalStatus === "Pending" || r.approvalStatus === "Approved") && r.refundStatus !== "Pending" && r.refundStatus !== "Approved";

    document.getElementById("reservation-detail-body").innerHTML = `
      <div class="row g-3">
        <div class="col-md-5">
          <img src="${resolveAsset(r.image)}" class="w-100 rounded" style="max-height:220px;object-fit:cover;">
          ${r.receiptImage ? `
            <div class="mt-2 text-center p-2 border rounded bg-light">
              <span class="small fw-semibold d-block text-primary mb-1"><i class="fa-solid fa-receipt me-1"></i>Your Payment Proof Slip</span>
              <img src="${resolveAsset(r.receiptImage)}" alt="Payment Receipt" class="img-fluid rounded border bg-white shadow-sm" style="max-height:130px;object-fit:contain;cursor:pointer;" onclick="window.open('${resolveAsset(r.receiptImage)}', '_blank')">
            </div>` : ""}
        </div>
        <div class="col-md-7">
          <h5 class="fw-bold">${escapeHtml(r.assetLabel)} <span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></h5>
          <p class="mb-1"><strong>Reservation #:</strong> ${r.id}</p>
          <p class="mb-1"><strong>Type:</strong> ${r.type}</p>
          <p class="mb-1"><strong>Owner / Payee:</strong> ${escapeHtml(r.assetOwner || "CSU Auxiliary")} ${r.assetOwnerPhone ? `· <i class="fa-solid fa-phone ms-1 me-1 text-primary"></i>${escapeHtml(r.assetOwnerPhone)}` : ""}</p>
          <p class="mb-1"><strong>Reservation Date:</strong> ${r.reservationDate}</p>
          <p class="mb-1"><strong>Payment Method:</strong> ${r.paymentMethod}</p>
          ${r.referenceNumber ? `<p class="mb-1"><strong>Payment Ref #:</strong> <span class="badge bg-secondary-subtle text-dark border font-monospace">${escapeHtml(r.referenceNumber)}</span></p>` : ""}
          <p class="mb-1"><strong>Amount:</strong> ₱${Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p class="mb-0"><strong>Payment Status:</strong> <span class="badge ${badgeClass(r.paymentStatus)}">${r.paymentStatus}</span></p>
          ${canRequestRefund ? `
            <div class="mt-3">
              <button class="btn btn-sm btn-outline-danger" onclick="bootstrap.Modal.getInstance(document.getElementById('reservation-detail-modal')).hide(); openRequestRefundModal('${r.id}');">
                <i class="fa-solid fa-hand-holding-dollar me-1"></i>Request Cancellation &amp; Refund
              </button>
            </div>` : ""}
        </div>
      </div>
      ${refundCard}
      <hr>
      <h6 class="fw-bold">Parent / Guardian Information</h6>
      <div class="row small">
        <div class="col-md-6">Father: ${escapeHtml(r.parentInfo.fatherName)}</div>
        <div class="col-md-6">Mother: ${escapeHtml(r.parentInfo.motherName)}</div>
        <div class="col-md-6">Occupation: ${escapeHtml(r.parentInfo.occupation)}</div>
        <div class="col-md-6">Address: ${escapeHtml(r.parentInfo.address)}</div>
        <div class="col-md-6">Emergency Contact: ${escapeHtml(r.parentInfo.emergencyContact)} (${escapeHtml(r.parentInfo.relationship)})</div>
        <div class="col-md-6">Emergency Number: ${escapeHtml(r.parentInfo.emergencyNumber)}</div>
      </div>
      <hr>
      <h6 class="fw-bold">Student Background</h6>
      <div class="row small">
        <div class="col-md-6">Reason for Staying: ${escapeHtml(r.studentBackground.reason)}</div>
        <div class="col-md-6">Hobbies: ${escapeHtml(r.studentBackground.hobbies)}</div>
        <div class="col-md-6">Smoking: ${escapeHtml(r.studentBackground.smoking)}</div>
        <div class="col-md-6">Drinking: ${escapeHtml(r.studentBackground.drinking)}</div>
      </div>`;
    new bootstrap.Modal(document.getElementById("reservation-detail-modal")).show();
  }

  window.openRequestRefundModal = function(id) {
    const r = reservations.find((x) => String(x.id) === String(id));
    if (!r || !refundModal) return;

    document.getElementById("student-refund-res-id").value = r.id;
    document.getElementById("refund-modal-res-label").textContent = `#${r.id} (${r.type} - ${r.assetLabel})`;
    document.getElementById("refund-modal-amount").textContent = `₱${Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById("student-refund-name").value = session.name || "";
    document.getElementById("student-refund-number").value = session.phone || "";
    document.getElementById("student-refund-reason").value = "";

    refundModal.show();
  };

  const studentRefundForm = document.getElementById("student-refund-form");
  if (studentRefundForm) {
    studentRefundForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("student-refund-res-id").value;
      const refundMethod = document.getElementById("student-refund-method").value;
      const refundAccountName = document.getElementById("student-refund-name").value.trim();
      const refundAccountNumber = document.getElementById("student-refund-number").value.trim();
      const reason = document.getElementById("student-refund-reason").value.trim();

      if (!refundAccountName || !refundAccountNumber || !reason) {
        showToast("Please fill out all required fields.", "warning");
        return;
      }

      const ok = await confirmDialog({
        title: "Submit Refund Request",
        message: "Are you sure you want to cancel this reservation and request a refund? The administrator will review your payout details and send the funds.",
        confirmText: "Submit Request",
        confirmClass: "btn-primary",
      });
      if (!ok) return;

      withLoading(async () => {
        try {
          await DataAPI.requestRefund({
            id: Number(id),
            refundMethod,
            refundAccountName,
            refundAccountNumber,
            reason,
          });
          if (refundModal) refundModal.hide();
          showToast("Refund request submitted successfully! Awaiting admin review.", "success");
          await render();
        } catch (err) {
          showToast(err.message || "Failed to submit refund request", "error");
        }
      });
    });
  }

  async function cancelReservation(id) {
    const ok = await confirmDialog({
      title: "Cancel Reservation",
      message: `Are you sure you want to cancel reservation #${id}? This action cannot be undone.`,
      confirmText: "Yes, Cancel",
      confirmClass: "btn-danger",
    });
    if (!ok) return;

    await withLoading(async () => {
      try {
        await DataAPI.cancelReservation(id);
        showToast("Reservation cancelled.", "warning");
        await render();
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  }

  render();
});
