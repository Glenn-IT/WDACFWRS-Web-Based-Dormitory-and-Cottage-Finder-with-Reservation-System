document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("reservations-table-body");
  const viewModal = new bootstrap.Modal(document.getElementById("reservation-view-modal"));
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
          <button class="btn btn-sm btn-outline-secondary" data-view="${r.id}"><i class="fa-solid fa-eye"></i></button>
          ${r.approvalStatus === "Pending" ? `
            <button class="btn btn-sm btn-outline-success" data-approve="${r.id}"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-decline="${r.id}"><i class="fa-solid fa-xmark"></i></button>` : ""}
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-clipboard"></i>No reservations match your filters.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewReservation(b.dataset.view)));
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

  // ---- Add Reservation Modal & Multi-Step Wizard ----
  const addModalEl = document.getElementById("add-reservation-modal");
  const addModal = new bootstrap.Modal(addModalEl);
  let availableDorms = [];
  let availableCottages = [];
  let studentsList = [];

  const adminWizardState = {
    studentId: null,
    studentName: "",
    type: "dorm",
    asset: null,
    parent: {},
    background: {},
    paymentMethod: null,
  };

  function goToAdminStep(n) {
    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`admin-step-${i}`);
      const indEl = document.getElementById(`admin-step-indicator-${i}`);
      if (stepEl) stepEl.classList.toggle("d-none", i !== n);
      if (indEl) {
        indEl.classList.toggle("active", i === n);
        indEl.classList.toggle("done", i < n);
      }
    }
  }

  function adminVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  document.getElementById("open-add-reservation-btn").addEventListener("click", async () => {
    // Reset state & forms
    adminWizardState.studentId = null;
    adminWizardState.studentName = "";
    adminWizardState.type = "dorm";
    adminWizardState.asset = null;
    adminWizardState.parent = {};
    adminWizardState.background = {};
    adminWizardState.paymentMethod = null;

    document.getElementById("admin-parent-form").reset();
    document.getElementById("admin-background-form").reset();
    document.getElementById("admin-res-type").value = "dorm";
    document.querySelectorAll(".admin-payment-option").forEach((o) => o.classList.remove("border-primary", "border-2", "bg-light"));
    document.getElementById("admin-qr-section").classList.add("d-none");
    document.getElementById("admin-to-step-5-btn").disabled = true;

    await withLoading(async () => {
      try {
        const [usersRes, dormsRes, cottagesRes] = await Promise.all([
          DataAPI.getUsers(),
          DataAPI.getDorms({ status: "Available" }),
          DataAPI.getCottages({ availability: "Available" }),
        ]);

        studentsList = usersRes.users || [];
        availableDorms = dormsRes.dorms || [];
        availableCottages = cottagesRes.cottages || [];

        // Populate student dropdown
        const studentSelect = document.getElementById("admin-res-student");
        studentSelect.innerHTML =
          `<option value="">-- Choose a Student --</option>` +
          studentsList.map((s) => `<option value="${s.id}">${escapeHtml(s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim())} (${escapeHtml(s.studentNo || s.email)})</option>`).join("");

        updateAssetOptions();
      } catch (err) {
        showToast("Error loading data: " + err.message, "error");
      }
    });

    goToAdminStep(1);
    addModal.show();
  });

  function updateAssetOptions() {
    const type = document.getElementById("admin-res-type").value;
    adminWizardState.type = type;
    adminWizardState.asset = null;
    document.getElementById("admin-selected-asset-card").innerHTML = "";

    const assetSelect = document.getElementById("admin-res-asset");
    const list = type === "dorm" ? availableDorms : availableCottages;

    assetSelect.innerHTML =
      `<option value="">-- Choose Accommodation --</option>` +
      list.map((a) => {
        const label = type === "dorm" ? (a.dormitoryName || `Room ${a.roomNumber}`) : a.name;
        return `<option value="${a.id}">${escapeHtml(label)} (₱${a.price.toLocaleString()})</option>`;
      }).join("");
  }

  document.getElementById("admin-res-type").addEventListener("change", updateAssetOptions);

  document.getElementById("admin-res-asset").addEventListener("change", (e) => {
    const id = e.target.value;
    const type = adminWizardState.type;
    const list = type === "dorm" ? availableDorms : availableCottages;
    adminWizardState.asset = list.find((a) => String(a.id) === String(id)) || null;

    if (adminWizardState.asset) {
      const a = adminWizardState.asset;
      const label = type === "dorm" ? (a.dormitoryName || `Room ${a.roomNumber}`) : a.name;
      const price = a.price;
      document.getElementById("admin-selected-asset-card").innerHTML = `
        <div class="card p-3 border">
          <div class="row g-3 align-items-center">
            <div class="col-md-4"><img src="${resolveAsset(a.image)}" class="w-100 rounded" style="height:120px;object-fit:cover;"></div>
            <div class="col-md-8">
              <h6 class="fw-bold mb-1">${escapeHtml(label)}</h6>
              <p class="text-muted small mb-1">${type === "dorm" ? `Dormitory · Capacity ${a.capacity} pax` : `Owner: ${escapeHtml(a.owner || "CSU-Piat")} · ${a.rooms} rooms`}</p>
              <h6 class="text-primary fw-bold mb-0">₱${price.toLocaleString()} ${type === "dorm" ? "/ month" : "/ day"}</h6>
            </div>
          </div>
        </div>`;
    } else {
      document.getElementById("admin-selected-asset-card").innerHTML = "";
    }
  });

  // Step 1 -> Step 2
  document.getElementById("admin-to-step-2-btn").addEventListener("click", () => {
    const studentId = document.getElementById("admin-res-student").value;
    if (!studentId) {
      showToast("Please select a student.", "error");
      return;
    }
    if (!adminWizardState.asset) {
      showToast("Please select an accommodation.", "error");
      return;
    }
    const student = studentsList.find((s) => String(s.id) === String(studentId));
    adminWizardState.studentId = studentId;
    adminWizardState.studentName = student ? (student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim()) : "Selected Student";
    goToAdminStep(2);
  });

  document.getElementById("admin-to-step-1-btn").addEventListener("click", () => goToAdminStep(1));

  // Step 2 -> Step 3
  document.getElementById("admin-parent-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = adminVal("admin-p-phone");
    const emergencyNumber = adminVal("admin-p-emergency-number");

    if (!isValidPhone(phone) || !isValidPhone(emergencyNumber)) {
      showToast("Please enter valid PH mobile numbers (e.g. 09123456789).", "error");
      return;
    }

    adminWizardState.parent = {
      fatherName: adminVal("admin-p-father-name"),
      motherName: adminVal("admin-p-mother-name"),
      occupation: adminVal("admin-p-occupation"),
      education: adminVal("admin-p-education"),
      address: adminVal("admin-p-address"),
      phone,
      emergencyContact: adminVal("admin-p-emergency-contact"),
      relationship: adminVal("admin-p-relationship"),
      emergencyNumber,
    };
    goToAdminStep(3);
  });

  document.getElementById("admin-step3-to-step2-btn").addEventListener("click", () => goToAdminStep(2));

  // Step 3 -> Step 4
  document.getElementById("admin-background-form").addEventListener("submit", (e) => {
    e.preventDefault();
    adminWizardState.background = {
      appliances: adminVal("admin-b-appliances") || "None",
      friendsAtDorm: adminVal("admin-b-friends"),
      relationship: adminVal("admin-b-friends-relationship") || "N/A",
      reason: adminVal("admin-b-reason"),
      medicalConditions: adminVal("admin-b-medical") || "None",
      severeIllness: adminVal("admin-b-illness") || "None",
      hobbies: adminVal("admin-b-hobbies") || "N/A",
      smoking: adminVal("admin-b-smoking"),
      drinking: adminVal("admin-b-drinking"),
      organizations: adminVal("admin-b-organizations") || "None",
      leisure: adminVal("admin-b-leisure") || "N/A",
    };
    goToAdminStep(4);
  });

  document.getElementById("admin-step4-to-step3-btn").addEventListener("click", () => goToAdminStep(3));

  // Step 4 payment selection
  document.querySelectorAll(".admin-payment-option").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".admin-payment-option").forEach((o) => o.classList.remove("border-primary", "border-2", "bg-light"));
      el.classList.add("border-primary", "border-2", "bg-light");
      adminWizardState.paymentMethod = el.dataset.method;
      document.getElementById("admin-qr-section").classList.remove("d-none");
      document.getElementById("admin-qr-caption").textContent =
        adminWizardState.paymentMethod === "Cash"
          ? "Payment in cash will be marked as Pending until payment is received."
          : `Scan the QR code using your ${adminWizardState.paymentMethod} app to pay ₱${adminWizardState.asset.price.toLocaleString()}.`;
      document.getElementById("admin-to-step-5-btn").disabled = false;
    });
  });

  document.getElementById("admin-to-step-5-btn").addEventListener("click", () => {
    buildAdminReceipt();
    goToAdminStep(5);
  });

  document.getElementById("admin-step5-to-step4-btn").addEventListener("click", () => goToAdminStep(4));

  function buildAdminReceipt() {
    const today = new Date().toISOString().slice(0, 10);
    const paymentStatus = adminWizardState.paymentMethod === "Cash" ? "Pending" : "Paid";
    const label = adminWizardState.type === "dorm" ? (adminWizardState.asset.dormitoryName || `Room ${adminWizardState.asset.roomNumber}`) : adminWizardState.asset.name;

    document.getElementById("admin-receipt-card").innerHTML = `
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Student</span><strong>${escapeHtml(adminWizardState.studentName)}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">${adminWizardState.type === "dorm" ? "Dormitory" : "Cottage"}</span><strong>${escapeHtml(label)}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Payment Method</span><strong>${adminWizardState.paymentMethod}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Amount</span><strong>₱${adminWizardState.asset.price.toLocaleString()}</strong>
      </div>
      <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
        <span class="text-muted">Reservation Date</span><strong>${today}</strong>
      </div>
      <div class="d-flex justify-content-between">
        <span class="text-muted">Payment Status</span><span class="badge ${badgeClass(paymentStatus)}">${paymentStatus}</span>
      </div>`;
  }

  // Submit Reservation
  document.getElementById("admin-submit-reservation-btn").addEventListener("click", () => {
    withLoading(async () => {
      try {
        await DataAPI.createReservation({
          studentId: adminWizardState.studentId,
          type: adminWizardState.type === "dorm" ? "Dormitory" : "Cottage",
          assetId: adminWizardState.asset.id,
          paymentMethod: adminWizardState.paymentMethod,
          parentInfo: adminWizardState.parent,
          background: adminWizardState.background,
        });
        showToast("Reservation created successfully!", "success");
        addModal.hide();
        await render();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  render();
});
