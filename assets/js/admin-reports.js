document.addEventListener("DOMContentLoaded", () => {
  const titleMap = {
    reservations: "Reservations Report",
    "dorm-occupancy": "Dorm Occupancy Report",
    "cottage-occupancy": "Cottage Occupancy Report",
    revenue: "Revenue Summary Report",
    registrations: "User Registrations Report",
  };

  document.getElementById("preview-report-btn").addEventListener("click", generateReport);
  document.getElementById("print-report-btn").addEventListener("click", () => window.print());
  document.getElementById("export-report-btn").addEventListener("click", () => {
    showToast("PDF export is simulated in this prototype (UI only).", "info");
  });

  async function generateReport() {
    const type = document.getElementById("report-type").value;
    const from = document.getElementById("report-date-from").value;
    const to = document.getElementById("report-date-to").value;
    const resType = document.getElementById("report-res-type").value;
    const status = document.getElementById("report-status").value;

    document.getElementById("report-title").textContent = titleMap[type];
    const summaryEl = document.getElementById("report-summary");
    const tableEl = document.getElementById("report-table-container");

    const data = await withLoading(() => DataAPI.getReport({ type, from, to, resType, status }));

    if (type === "reservations") {
      const rows = data.rows;
      summaryEl.innerHTML = summaryCard("Total Reservations", data.total, "#1d4ed8", "fa-clipboard-list");
      tableEl.innerHTML = `<table class="table table-sm align-middle">
        <thead><tr><th>Reservation #</th><th>Student</th><th>Type</th><th>Asset</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${rows.map((r) => `<tr><td>${r.id}</td><td>${escapeHtml(r.studentName)}</td><td>${r.type}</td><td>${escapeHtml(r.assetLabel)}</td><td>${r.reservationDate}</td><td><span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></td></tr>`).join("") || emptyRow(6)}</tbody>
      </table>`;
    }

    if (type === "dorm-occupancy") {
      const rows = data.rows;
      summaryEl.innerHTML =
        summaryCard("Total Rooms", data.total, "#1d4ed8", "fa-door-open") +
        summaryCard("Available", data.available, "#16a34a", "fa-circle-check") +
        summaryCard("Occupied/Full", data.occupiedOrFull, "#d97706", "fa-bed");
      tableEl.innerHTML = `<table class="table table-sm align-middle">
        <thead><tr><th>Room #</th><th>Gender</th><th>Capacity</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>${rows.map((d) => `<tr><td>${escapeHtml(d.roomNumber)}</td><td>${d.gender}</td><td>${d.capacity}</td><td>₱${d.price.toLocaleString()}</td><td><span class="badge ${badgeClass(d.status)}">${d.status}</span></td></tr>`).join("")}</tbody>
      </table>`;
    }

    if (type === "cottage-occupancy") {
      const rows = data.rows;
      summaryEl.innerHTML =
        summaryCard("Total Cottages", data.total, "#1d4ed8", "fa-house-chimney") +
        summaryCard("Available", data.available, "#16a34a", "fa-circle-check") +
        summaryCard("Booked", data.booked, "#d97706", "fa-lock");
      tableEl.innerHTML = `<table class="table table-sm align-middle">
        <thead><tr><th>Cottage</th><th>Owner</th><th>Rooms</th><th>Price</th><th>Availability</th></tr></thead>
        <tbody>${rows.map((c) => `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.owner)}</td><td>${c.rooms}</td><td>₱${c.price.toLocaleString()}</td><td><span class="badge ${badgeClass(c.availability)}">${c.availability}</span></td></tr>`).join("")}</tbody>
      </table>`;
    }

    if (type === "revenue") {
      const rows = data.rows;
      summaryEl.innerHTML =
        summaryCard("Total Revenue", `₱${data.total.toLocaleString()}`, "#16a34a", "fa-sack-dollar") +
        summaryCard("Pending Payments", `₱${data.pending.toLocaleString()}`, "#d97706", "fa-hourglass-half") +
        summaryCard("Transactions", data.transactions, "#1d4ed8", "fa-receipt");
      tableEl.innerHTML = `<table class="table table-sm align-middle">
        <thead><tr><th>Payment #</th><th>Reservation #</th><th>Method</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${rows.map((p) => `<tr><td>${p.id}</td><td>${p.reservationId}</td><td>${p.method}</td><td>₱${p.amount.toLocaleString()}</td><td>${p.date}</td><td><span class="badge ${badgeClass(p.status)}">${p.status}</span></td></tr>`).join("") || emptyRow(6)}</tbody>
      </table>`;
    }

    if (type === "registrations") {
      const rows = data.rows;
      summaryEl.innerHTML = summaryCard("New Registrations", data.total, "#1d4ed8", "fa-user-plus");
      tableEl.innerHTML = `<table class="table table-sm align-middle">
        <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Date Registered</th><th>Status</th></tr></thead>
        <tbody>${rows.map((u) => `<tr><td>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(u.course || "-")}</td><td>${u.dateRegistered}</td><td><span class="badge ${badgeClass(u.status)}">${u.status}</span></td></tr>`).join("") || emptyRow(5)}</tbody>
      </table>`;
    }
  }

  function summaryCard(label, value, color, icon) {
    return `<div class="col-md-4"><div class="stat-card">
      <div class="stat-icon" style="background:${color};"><i class="fa-solid ${icon}"></i></div>
      <div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
    </div></div>`;
  }

  function emptyRow(colspan) {
    return `<tr><td colspan="${colspan}"><div class="empty-state"><i class="fa-solid fa-inbox"></i>No records match this filter.</div></td></tr>`;
  }

  generateReport();
});
