document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("reservations-table-body");
  const viewModal = new bootstrap.Modal(document.getElementById("reservation-view-modal"));
  const editModal = new bootstrap.Modal(document.getElementById("reservation-edit-modal"));
  let reservations = [];

  ["filter-type", "filter-approval", "filter-payment", "filter-search"].forEach((id) => {
    document.getElementById(id).addEventListener("input", render);
  });

  async function render() {
    const type = document.getElementById("filter-type").value;
    const approvalStatus = document.getElementById("filter-approval").value;
    const paymentStatus = document.getElementById("filter-payment").value;
    const search = document.getElementById("filter-search").value.trim();

    const data = await DataAPI.getReservations({ type, approvalStatus, paymentStatus, search });
    reservations = data.reservations || [];

    tbody.innerHTML = reservations.length
      ? reservations
          .map(
            (r) => `
      <tr>
        <td>${r.id}</td>
        <td>${escapeHtml(r.studentName)}</td>
        <td>${escapeHtml(r.assetLabel)}</td>
        <td>${r.type}</td>
        <td>${r.reservationDate}</td>
        <td><span class="badge ${badgeClass(r.paymentStatus)}">${r.paymentStatus}</span></td>
        <td><span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-view="${r.id}">
            <i class="fa-solid fa-eye me-1"></i>View
          </button>
          <button class="btn btn-sm btn-outline-secondary me-1" data-edit="${r.id}">
            <i class="fa-solid fa-pen-to-square me-1"></i>Edit
          </button>
          ${r.approvalStatus === "Pending" ? `
            <button class="btn btn-sm btn-success me-1" data-approve="${r.id}">
              <i class="fa-solid fa-check me-1"></i>Approve
            </button>
            <button class="btn btn-sm btn-danger" data-decline="${r.id}">
              <i class="fa-solid fa-xmark me-1"></i>Decline
            </button>` : ""}
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-clipboard"></i>No reservations match your filters.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewReservation(b.dataset.view)));
    tbody.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => openEditModal(b.dataset.edit)));
    tbody.querySelectorAll("[data-approve]").forEach((b) => b.addEventListener("click", () => setApproval(b.dataset.approve, "Approved")));
    tbody.querySelectorAll("[data-decline]").forEach((b) => b.addEventListener("click", () => setApproval(b.dataset.decline, "Declined")));
  }

  function viewReservation(id) {
    const r = reservations.find((x) => String(x.id) === String(id));
    if (!r) return;
    document.getElementById("reservation-view-body").innerHTML = `
      <div class="row g-3 mb-3">
        <div class="col-md-5"><img src="${resolveAsset(r.image)}" class="w-100 rounded" style="max-height:200px;object-fit:cover;"></div>
        <div class="col-md-7">
          <h5 class="fw-bold">${escapeHtml(r.assetLabel)} <span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></h5>
          <p class="mb-1"><strong>Reservation #:</strong> ${r.id}</p>
          <p class="mb-1"><strong>Student:</strong> ${escapeHtml(r.studentName)}</p>
          <p class="mb-1"><strong>Date:</strong> ${r.reservationDate}</p>
          <p class="mb-1"><strong>Payment:</strong> ${r.paymentMethod} · ₱${r.amount.toLocaleString()} · <span class="badge ${badgeClass(r.paymentStatus)}">${r.paymentStatus}</span></p>
        </div>
      </div>
      <hr>
      <h6 class="fw-bold">Parent / Guardian Information</h6>
      <div class="row small mb-2">
        <div class="col-md-6">Father: ${escapeHtml(r.parentInfo.fatherName)}</div>
        <div class="col-md-6">Mother: ${escapeHtml(r.parentInfo.motherName)}</div>
        <div class="col-md-6">Occupation: ${escapeHtml(r.parentInfo.occupation)}</div>
        <div class="col-md-6">Education: ${escapeHtml(r.parentInfo.education)}</div>
        <div class="col-12">Address: ${escapeHtml(r.parentInfo.address)}</div>
        <div class="col-md-6">Phone: ${escapeHtml(r.parentInfo.phone)}</div>
        <div class="col-md-6">Emergency: ${escapeHtml(r.parentInfo.emergencyContact)} (${escapeHtml(r.parentInfo.relationship)}) — ${escapeHtml(r.parentInfo.emergencyNumber)}</div>
      </div>
      <hr>
      <h6 class="fw-bold">Student Background</h6>
      <div class="row small">
        <div class="col-md-6">Appliances: ${escapeHtml(r.studentBackground.appliances)}</div>
        <div class="col-md-6">Friends at Dorm: ${escapeHtml(r.studentBackground.friendsAtDorm)}</div>
        <div class="col-md-6">Reason: ${escapeHtml(r.studentBackground.reason)}</div>
        <div class="col-md-6">Medical: ${escapeHtml(r.studentBackground.medicalConditions)}</div>
        <div class="col-md-6">Smoking: ${escapeHtml(r.studentBackground.smoking)}</div>
        <div class="col-md-6">Drinking: ${escapeHtml(r.studentBackground.drinking)}</div>
        <div class="col-md-6">Organizations: ${escapeHtml(r.studentBackground.organizations)}</div>
        <div class="col-md-6">Leisure: ${escapeHtml(r.studentBackground.leisure)}</div>
      </div>`;
    viewModal.show();
  }

  function openEditModal(id) {
    const r = reservations.find((x) => String(x.id) === String(id));
    if (!r) return;
    document.getElementById("edit-res-id").value = r.id;
    document.getElementById("edit-res-student").value = `${r.studentName} (ID: ${r.studentId})`;
    document.getElementById("edit-res-asset").value = `${r.type}: ${r.assetLabel}`;
    document.getElementById("edit-res-date").value = r.reservationDate;
    document.getElementById("edit-res-amount").value = r.amount;
    document.getElementById("edit-res-payment-method").value = r.paymentMethod;
    document.getElementById("edit-res-payment-status").value = r.paymentStatus;
    document.getElementById("edit-res-approval-status").value = r.approvalStatus;
    editModal.show();
  }

  document.getElementById("reservation-edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-res-id").value;
    const payload = {
      id: Number(id),
      reservationDate: document.getElementById("edit-res-date").value,
      amount: parseFloat(document.getElementById("edit-res-amount").value) || 0,
      paymentMethod: document.getElementById("edit-res-payment-method").value,
      paymentStatus: document.getElementById("edit-res-payment-status").value,
      approvalStatus: document.getElementById("edit-res-approval-status").value,
    };

    withLoading(async () => {
      try {
        await DataAPI.updateReservation(payload);
        editModal.hide();
        showToast("Reservation updated successfully.", "success");
        await render();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  document.getElementById("print-reservation-btn").addEventListener("click", () => window.print());

  async function setApproval(id, status) {
    const ok = await confirmDialog({
      title: `${status} Reservation`,
      message: `Are you sure you want to ${status.toLowerCase()} this reservation?`,
      confirmText: status,
      confirmClass: status === "Approved" ? "btn-success" : "btn-danger",
    });
    if (!ok) return;

    await withLoading(async () => {
      try {
        if (status === "Approved") {
          await DataAPI.approveReservation(id);
        } else {
          await DataAPI.declineReservation(id);
        }
        await render();
        showToast(`Reservation ${status.toLowerCase()}.`, status === "Approved" ? "success" : "warning");
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  }

  render();
});
