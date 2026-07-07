document.addEventListener("DOMContentLoaded", () => {
  const users = DataAPI.getUsers();
  const dorms = DataAPI.getDorms();
  const cottages = DataAPI.getCottages();
  const reservations = DataAPI.getReservations();
  const payments = DataAPI.getPayments();

  document.getElementById("stat-total-users").textContent = users.length;
  document.getElementById("stat-total-dorms").textContent = dorms.length;
  document.getElementById("stat-total-cottages").textContent = cottages.length;
  document.getElementById("stat-pending-reservations").textContent = reservations.filter((r) => r.approvalStatus === "Pending").length;
  document.getElementById("stat-approved-reservations").textContent = reservations.filter((r) => r.approvalStatus === "Approved").length;
  document.getElementById("stat-available-rooms").textContent = dorms.filter((d) => d.status === "Available").length;
  document.getElementById("stat-occupied-rooms").textContent = dorms.filter((d) => d.status === "Occupied" || d.status === "Full").length;

  const revenue = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  document.getElementById("stat-revenue").textContent = `₱${revenue.toLocaleString()}`;

  const chartColors = {
    blue: "#1d4ed8",
    lightBlue: "#3b82f6",
    green: "#16a34a",
    amber: "#d97706",
    red: "#dc2626",
    gray: "#94a3b8",
  };

  // Reservation Statistics: approval status breakdown
  const statusCounts = { Pending: 0, Approved: 0, Declined: 0, Cancelled: 0 };
  reservations.forEach((r) => { if (statusCounts[r.approvalStatus] !== undefined) statusCounts[r.approvalStatus]++; });
  new Chart(document.getElementById("chart-reservation-stats"), {
    type: "doughnut",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [chartColors.amber, chartColors.green, chartColors.red, chartColors.gray],
      }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Dormitory Occupancy
  const dormStatusCounts = { Available: 0, Occupied: 0, Full: 0 };
  dorms.forEach((d) => { dormStatusCounts[d.status]++; });
  new Chart(document.getElementById("chart-dorm-occupancy"), {
    type: "pie",
    data: {
      labels: Object.keys(dormStatusCounts),
      datasets: [{ data: Object.values(dormStatusCounts), backgroundColor: [chartColors.green, chartColors.amber, chartColors.gray] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Cottage Occupancy
  const cottageStatusCounts = { Available: 0, Booked: 0 };
  cottages.forEach((c) => { cottageStatusCounts[c.availability]++; });
  new Chart(document.getElementById("chart-cottage-occupancy"), {
    type: "pie",
    data: {
      labels: Object.keys(cottageStatusCounts),
      datasets: [{ data: Object.values(cottageStatusCounts), backgroundColor: [chartColors.green, chartColors.amber] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Monthly Reservations (last 6 months)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString("default", { month: "short", year: "2-digit" }), year: d.getFullYear(), month: d.getMonth() });
  }
  const monthlyCounts = months.map((m) =>
    reservations.filter((r) => {
      const rd = new Date(r.reservationDate);
      return rd.getFullYear() === m.year && rd.getMonth() === m.month;
    }).length
  );
  new Chart(document.getElementById("chart-monthly"), {
    type: "bar",
    data: {
      labels: months.map((m) => m.label),
      datasets: [{ label: "Reservations", data: monthlyCounts, backgroundColor: chartColors.blue, borderRadius: 6 }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
});
