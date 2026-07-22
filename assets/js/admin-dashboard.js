document.addEventListener("DOMContentLoaded", async () => {
  const stats = await DataAPI.getAdminStats();

  document.getElementById("stat-total-users").textContent = stats.totalUsers;
  document.getElementById("stat-total-dorms").textContent = stats.totalDorms;
  document.getElementById("stat-total-cottages").textContent = stats.totalCottages;
  document.getElementById("stat-pending-reservations").textContent = stats.pendingReservations;
  document.getElementById("stat-approved-reservations").textContent = stats.approvedReservations;
  document.getElementById("stat-available-rooms").textContent = stats.availableRooms;
  document.getElementById("stat-occupied-rooms").textContent = stats.occupiedRooms;
  document.getElementById("stat-revenue").textContent = `₱${stats.revenue.toLocaleString()}`;

  const chartColors = {
    coral: "#FF5A5A",
    orange: "#FF8B5A",
    amber: "#FFA95A",
    gold: "#FFD45A",
    green: "#16a34a",
    gray: "#94a3b8",
  };

  // Reservation Statistics: approval status breakdown
  new Chart(document.getElementById("chart-reservation-stats"), {
    type: "doughnut",
    data: {
      labels: Object.keys(stats.statusCounts),
      datasets: [{
        data: Object.values(stats.statusCounts),
        backgroundColor: [chartColors.amber, chartColors.green, chartColors.coral, chartColors.gray],
      }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Dormitory Occupancy
  new Chart(document.getElementById("chart-dorm-occupancy"), {
    type: "pie",
    data: {
      labels: Object.keys(stats.dormStatusCounts),
      datasets: [{ data: Object.values(stats.dormStatusCounts), backgroundColor: [chartColors.green, chartColors.amber, chartColors.gray] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Cottage Occupancy
  new Chart(document.getElementById("chart-cottage-occupancy"), {
    type: "pie",
    data: {
      labels: Object.keys(stats.cottageStatusCounts),
      datasets: [{ data: Object.values(stats.cottageStatusCounts), backgroundColor: [chartColors.green, chartColors.amber] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Monthly Reservations (last 6 months)
  new Chart(document.getElementById("chart-monthly"), {
    type: "bar",
    data: {
      labels: stats.monthly.map((m) => m.label),
      datasets: [{ label: "Reservations", data: stats.monthly.map((m) => m.count), backgroundColor: chartColors.coral, borderRadius: 6 }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
});
