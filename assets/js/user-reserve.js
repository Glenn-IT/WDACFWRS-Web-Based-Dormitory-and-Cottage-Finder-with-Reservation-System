document.addEventListener("DOMContentLoaded", () => {
  const session = Auth.getSession();
  if (!session) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") === "cottage" ? "cottage" : "dorm";
  const assetId = params.get("id");

  const asset = type === "dorm"
    ? DataAPI.getDorms().find((d) => d.id === assetId)
    : DataAPI.getCottages().find((c) => c.id === assetId);

  if (!asset) {
    document.querySelector("main.app-main").innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Room or cottage not found.<br><a href="rooms.html" class="btn btn-primary mt-2">Back to Rooms</a></div>`;
    return;
  }

  const wizardState = {
    parent: {},
    background: {},
    paymentMethod: null,
  };

  function goToStep(n) {
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`step-${i}`).classList.toggle("d-none", i !== n);
      const ind = document.getElementById(`step-indicator-${i}`);
      ind.classList.toggle("active", i === n);
      ind.classList.toggle("done", i < n);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- Step 1 ----
  const price = asset.price;
  const label = type === "dorm" ? `Room ${asset.roomNumber}` : asset.name;
  document.getElementById("selected-asset-card").innerHTML = `
    <div class="row g-3 align-items-center">
      <div class="col-md-4"><img src="${asset.image}" class="w-100 rounded" style="height:160px;object-fit:cover;"></div>
      <div class="col-md-8">
        <h5 class="fw-bold mb-1">${escapeHtml(label)}</h5>
        <p class="text-muted mb-1">${type === "dorm" ? `${asset.gender} Dormitory · Capacity ${asset.capacity} pax` : `Owner: ${escapeHtml(asset.owner)} · ${asset.rooms} rooms`}</p>
        <h5 class="text-primary fw-bold">₱${price.toLocaleString()} ${type === "dorm" ? "/ month" : "/ day"}</h5>
      </div>
    </div>`;

  document.getElementById("to-step-2-btn").addEventListener("click", () => goToStep(2));
  document.getElementById("to-step-1-btn").addEventListener("click", () => goToStep(1));

  // ---- Step 2 ----
  document.getElementById("parent-form").addEventListener("submit", (e) => {
    e.preventDefault();
    wizardState.parent = {
      fatherName: val("p-father-name"),
      motherName: val("p-mother-name"),
      occupation: val("p-occupation"),
      education: val("p-education"),
      address: val("p-address"),
      phone: val("p-phone"),
      emergencyContact: val("p-emergency-contact"),
      relationship: val("p-relationship"),
      emergencyNumber: val("p-emergency-number"),
    };
    goToStep(3);
  });

  document.getElementById("step3-to-step2-btn").addEventListener("click", () => goToStep(2));

  // ---- Step 3 ----
  document.getElementById("background-form").addEventListener("submit", (e) => {
    e.preventDefault();
    wizardState.background = {
      appliances: val("b-appliances") || "None",
      friendsAtDorm: val("b-friends"),
      relationship: val("b-friends-relationship") || "N/A",
      reason: val("b-reason"),
      medicalConditions: val("b-medical") || "None",
      severeIllness: val("b-illness") || "None",
      hobbies: val("b-hobbies") || "N/A",
      smoking: val("b-smoking"),
      drinking: val("b-drinking"),
      organizations: val("b-organizations") || "None",
      leisure: val("b-leisure") || "N/A",
    };
    goToStep(4);
  });

  document.getElementById("step4-to-step3-btn").addEventListener("click", () => goToStep(3));

  // ---- Step 4 ----
  document.querySelectorAll(".payment-option").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach((o) => o.classList.remove("border-primary", "border-2", "bg-light"));
      el.classList.add("border-primary", "border-2", "bg-light");
      wizardState.paymentMethod = el.dataset.method;
      document.getElementById("qr-section").classList.remove("d-none");
      document.getElementById("qr-caption").textContent =
        wizardState.paymentMethod === "Cash"
          ? "Please pay in cash at the Finance Office upon check-in."
          : `Scan the QR code using your ${wizardState.paymentMethod} app to pay ₱${price.toLocaleString()}.`;
      document.getElementById("to-step-5-btn").disabled = false;
    });
  });

  document.getElementById("to-step-5-btn").addEventListener("click", () => {
    buildReceipt();
    goToStep(5);
  });

  // ---- Step 5 ----
  let reservationRecord = null;

  function buildReceipt() {
    const reservations = DataAPI.getReservations();
    const users = DataAPI.getUsers();
    const user = users.find((u) => u.id === session.id);
    const reservationId = DB.nextId(reservations, "RSV");
    const today = new Date().toISOString().slice(0, 10);

    reservationRecord = {
      id: reservationId,
      studentId: session.id,
      studentName: user ? `${user.firstName} ${user.lastName}` : session.name,
      type: type === "dorm" ? "Dormitory" : "Cottage",
      assetId: asset.id,
      assetLabel: label,
      image: asset.image,
      paymentMethod: wizardState.paymentMethod,
      amount: price,
      reservationDate: today,
      paymentStatus: wizardState.paymentMethod === "Cash" ? "Pending" : "Paid",
      approvalStatus: "Pending",
      parentInfo: wizardState.parent,
      studentBackground: wizardState.background,
    };

    document.getElementById("receipt-card").innerHTML = `
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Reservation No.</span><strong>${reservationRecord.id}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Student Name</span><strong>${escapeHtml(reservationRecord.studentName)}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">${reservationRecord.type}</span><strong>${escapeHtml(reservationRecord.assetLabel)}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Payment Method</span><strong>${reservationRecord.paymentMethod}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Amount</span><strong>₱${reservationRecord.amount.toLocaleString()}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Reservation Date</span><strong>${reservationRecord.reservationDate}</strong>
      </div>
      <div class="d-flex justify-content-between">
        <span class="text-muted">Status</span><span class="badge ${badgeClass(reservationRecord.approvalStatus)}">${reservationRecord.approvalStatus}</span>
      </div>`;
  }

  document.getElementById("save-receipt-btn").addEventListener("click", () => {
    showToast("Receipt saved to your device (simulated).", "info");
  });

  document.getElementById("print-receipt-btn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("submit-reservation-btn").addEventListener("click", () => {
    withLoading(() => {
      const reservations = DataAPI.getReservations();
      reservations.push(reservationRecord);
      DataAPI.saveReservations(reservations);

      const payments = DataAPI.getPayments();
      payments.push({
        id: DB.nextId(payments, "PAY"),
        reservationId: reservationRecord.id,
        method: reservationRecord.paymentMethod,
        amount: reservationRecord.amount,
        status: reservationRecord.paymentStatus,
        date: reservationRecord.reservationDate,
      });
      DataAPI.savePayments(payments);

      // mark asset as occupied/booked
      if (type === "dorm") {
        const dorms = DataAPI.getDorms();
        const d = dorms.find((x) => x.id === asset.id);
        if (d) d.status = "Occupied";
        DataAPI.saveDorms(dorms);
      } else {
        const cottages = DataAPI.getCottages();
        const c = cottages.find((x) => x.id === asset.id);
        if (c) c.availability = "Booked";
        DataAPI.saveCottages(cottages);
      }

      const notifications = DataAPI.getNotifications();
      notifications.push({
        id: DB.nextId(notifications, "NTF"),
        studentId: session.id,
        message: `Your reservation ${reservationRecord.id} has been submitted and is pending approval.`,
        date: reservationRecord.reservationDate,
        read: false,
      });
      DataAPI.saveNotifications(notifications);

      showToast("Reservation submitted successfully!", "success");
      setTimeout(() => (window.location.href = "my-reservations.html"), 900);
    });
  });

  function val(id) {
    return document.getElementById(id).value.trim();
  }
});
