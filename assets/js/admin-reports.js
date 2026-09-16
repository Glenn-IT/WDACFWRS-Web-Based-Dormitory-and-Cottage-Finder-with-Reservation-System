document.addEventListener("DOMContentLoaded", () => {
  const titleMap = {
    reservations: "Reservations Report",
    "dorm-occupancy": "Dormitory Occupancy Report",
    "cottage-occupancy": "Cottage Occupancy Report",
    revenue: "Revenue Summary Report",
    registrations: "User Registrations Report",
  };

  const reportTypeSelect = document.getElementById("report-type");
  const dateFromInput = document.getElementById("report-date-from");
  const dateToInput = document.getElementById("report-date-to");
  const resTypeSelect = document.getElementById("report-res-type");
  const statusSelect = document.getElementById("report-status");

  document.getElementById("preview-report-btn").addEventListener("click", generateReport);
  reportTypeSelect.addEventListener("change", () => {
    updateFilterVisibility();
    generateReport();
  });
  dateFromInput.addEventListener("change", generateReport);
  dateToInput.addEventListener("change", generateReport);
  resTypeSelect.addEventListener("change", generateReport);
  statusSelect.addEventListener("change", generateReport);
  document.getElementById("print-report-btn").addEventListener("click", () => window.print());
  document.getElementById("export-report-btn").addEventListener("click", async () => {
    const reportArea = document.getElementById("report-printable-area");
    if (!reportArea) return;

    const reportType = reportTypeSelect.value;
    const title = titleMap[reportType] || "Report";
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `CSU-Piat_${title.replace(/\s+/g, "_")}_${dateStr}.pdf`;

    const opt = {
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    if (typeof html2pdf !== "undefined") {
      showToast("Generating and downloading PDF...", "info");
      try {
        await html2pdf().set(opt).from(reportArea).save();
        showToast("PDF downloaded successfully!", "success");
      } catch (err) {
        console.error("PDF Export error:", err);
        showToast("Error downloading PDF, opening print preview instead.", "warning");
        window.print();
      }
    } else {
      window.print();
    }
  });

  function updateFilterVisibility() {
    const type = reportTypeSelect.value;
    const resCol = document.getElementById("filter-res-type-col");
    const statusCol = document.getElementById("filter-status-col");
    if (resCol) resCol.style.display = (type === "reservations") ? "" : "none";
    if (statusCol) statusCol.style.display = (type === "reservations" || type === "revenue") ? "" : "none";
  }

  function formatDateTime(d = new Date()) {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  async function generateReport() {
    const type = reportTypeSelect.value;
    const from = dateFromInput.value;
    const to = dateToInput.value;
    const resType = resTypeSelect.value;
    const status = statusSelect.value;

    document.getElementById("report-heading-title").textContent = titleMap[type] || "Report";
    
    // Set metadata period
    let periodText = "All Time";
    if (from && to) {
      periodText = `${from} to ${to}`;
    } else if (from) {
      periodText = `From ${from}`;
    } else if (to) {
      periodText = `Until ${to}`;
    }
    document.getElementById("report-meta-period").textContent = periodText;
    document.getElementById("report-meta-generated").textContent = formatDateTime();

    const tableEl = document.getElementById("report-table-container");

    const data = await withLoading(() => DataAPI.getReport({ type, from, to, resType, status }));
    const rows = data.rows || [];
    document.getElementById("report-meta-count").textContent = `${rows.length} ${rows.length === 1 ? 'Record' : 'Records'}`;

    if (type === "reservations") {
      tableEl.innerHTML = `
        <table class="table table-hover table-bordered align-middle table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 100px;">Reservation #</th>
              <th>Student Name</th>
              <th>Accommodation Type</th>
              <th>Dorm / Cottage</th>
              <th>Reservation Date</th>
              <th>Payment</th>
              <th>Amount</th>
              <th class="text-center">Approval Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length
              ? rows.map((r) => `
                <tr>
                  <td class="fw-bold">#${r.id}</td>
                  <td>${escapeHtml(r.studentName)}</td>
                  <td><span class="badge bg-light text-dark border">${r.type}</span></td>
                  <td>${escapeHtml(r.assetLabel)}</td>
                  <td>${r.reservationDate}</td>
                  <td>${r.paymentMethod} (<span class="badge ${badgeClass(r.paymentStatus)}">${r.paymentStatus}</span>)</td>
                  <td class="fw-semibold">₱${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-center"><span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></td>
                </tr>`).join("")
              : emptyRow(8)}
          </tbody>
        </table>`;
    } else if (type === "dorm-occupancy") {
      tableEl.innerHTML = `
        <table class="table table-hover table-bordered align-middle table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th>Dormitory / Room Name</th>
              <th>Gender Assignment</th>
              <th>Capacity</th>
              <th>Monthly Rate</th>
              <th class="text-center">Current Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length
              ? rows.map((d) => `
                <tr>
                  <td class="fw-bold">${escapeHtml(d.roomNumber || d.room_no || '')}</td>
                  <td>${escapeHtml(d.gender || 'Any')}</td>
                  <td>${d.capacity} pax</td>
                  <td class="fw-semibold">₱${Number(d.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo</td>
                  <td class="text-center"><span class="badge ${badgeClass(d.status)}">${d.status}</span></td>
                </tr>`).join("")
              : emptyRow(5)}
          </tbody>
        </table>`;
    } else if (type === "cottage-occupancy") {
      tableEl.innerHTML = `
        <table class="table table-hover table-bordered align-middle table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th>Cottage Name</th>
              <th>Managing Owner</th>
              <th>Rooms</th>
              <th>Daily Rate</th>
              <th class="text-center">Availability Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length
              ? rows.map((c) => `
                <tr>
                  <td class="fw-bold">${escapeHtml(c.name)}</td>
                  <td>${escapeHtml(c.owner || 'CSU-Piat')}</td>
                  <td>${c.rooms} room(s)</td>
                  <td class="fw-semibold">₱${Number(c.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / day</td>
                  <td class="text-center"><span class="badge ${badgeClass(c.availability)}">${c.availability}</span></td>
                </tr>`).join("")
              : emptyRow(5)}
          </tbody>
        </table>`;
    } else if (type === "revenue") {
      tableEl.innerHTML = `
        <table class="table table-hover table-bordered align-middle table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 100px;">Payment #</th>
              <th style="width: 120px;">Reservation #</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Transaction Date</th>
              <th class="text-center">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length
              ? rows.map((p) => `
                <tr>
                  <td class="fw-bold">#${p.id}</td>
                  <td>#${p.reservationId}</td>
                  <td>${escapeHtml(p.method)}</td>
                  <td class="fw-bold text-success">₱${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>${p.date}</td>
                  <td class="text-center"><span class="badge ${badgeClass(p.status)}">${p.status}</span></td>
                </tr>`).join("")
              : emptyRow(6)}
          </tbody>
        </table>`;
    } else if (type === "registrations") {
      tableEl.innerHTML = `
        <table class="table table-hover table-bordered align-middle table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th>Student Full Name</th>
              <th>Email Address</th>
              <th>Course / Program</th>
              <th>Registration Date</th>
              <th class="text-center">Account Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length
              ? rows.map((u) => `
                <tr>
                  <td class="fw-bold">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td>
                  <td>${escapeHtml(u.email)}</td>
                  <td>${escapeHtml(u.course || '-')}</td>
                  <td>${u.dateRegistered}</td>
                  <td class="text-center"><span class="badge ${badgeClass(u.status)}">${u.status}</span></td>
                </tr>`).join("")
              : emptyRow(5)}
          </tbody>
        </table>`;
    }
  }

  function emptyRow(colspan) {
    return `<tr><td colspan="${colspan}" class="text-center py-4 text-muted"><i class="fa-solid fa-inbox me-2"></i>No records found matching the specified criteria.</td></tr>`;
  }

  async function initSignatories() {
    try {
      const session = await Auth.getSession();
      if (session?.name) {
        const preparedEl = document.getElementById("sig-prepared-name");
        if (preparedEl) preparedEl.textContent = session.name.toUpperCase();
        const footerAdminEl = document.getElementById("report-footer-admin-name");
        if (footerAdminEl) footerAdminEl.textContent = session.name;
      }
    } catch (e) {
      /* fallback to defaults */
    }
  }

  initSignatories();
  updateFilterVisibility();
  generateReport();
});
