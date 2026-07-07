document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
  if (!session) return;

  const grid = document.getElementById("reservations-grid");
  let reservations = [];

  async function render() {
    const data = await DataAPI.getReservations({ mine: 1 });
    reservations = data.reservations || [];

    grid.innerHTML = reservations.length
      ? reservations.map((r) => card(r)).join("")
      : `<div class="col-12 empty-state"><i class="fa-solid fa-clipboard"></i>You have no reservations yet.<br><a href="rooms.html" class="btn btn-primary mt-2">Browse Rooms</a></div>`;

    grid.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => viewReservation(btn.dataset.view));
    });
    grid.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => cancelReservation(btn.dataset.cancel));
    });
  }

  function card(r) {
    const canCancel = r.approvalStatus === "Pending" || r.approvalStatus === "Approved";
    return `
      <div class="col-sm-6 col-lg-4">
        <div class="room-card">
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
            </p>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-fill" data-view="${r.id}">View</button>
              ${canCancel ? `<button class="btn btn-sm btn-outline-danger flex-fill" data-cancel="${r.id}">Cancel</button>` : ""}
            </div>
          </div>
        </div>
      </div>`;
  }

  function viewReservation(id) {
    const r = reservations.find((x) => String(x.id) === String(id));
    if (!r) return;
    document.getElementById("reservation-detail-body").innerHTML = `
      <div class="row g-3">
        <div class="col-md-5"><img src="${resolveAsset(r.image)}" class="w-100 rounded" style="max-height:220px;object-fit:cover;"></div>
        <div class="col-md-7">
          <h5 class="fw-bold">${escapeHtml(r.assetLabel)} <span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></h5>
          <p class="mb-1"><strong>Reservation #:</strong> ${r.id}</p>
          <p class="mb-1"><strong>Type:</strong> ${r.type}</p>
          <p class="mb-1"><strong>Reservation Date:</strong> ${r.reservationDate}</p>
          <p class="mb-1"><strong>Payment Method:</strong> ${r.paymentMethod}</p>
          <p class="mb-1"><strong>Amount:</strong> ₱${r.amount.toLocaleString()}</p>
          <p class="mb-0"><strong>Payment Status:</strong> <span class="badge ${badgeClass(r.paymentStatus)}">${r.paymentStatus}</span></p>
        </div>
      </div>
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
