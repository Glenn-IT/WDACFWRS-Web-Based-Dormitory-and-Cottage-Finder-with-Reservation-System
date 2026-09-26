document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
  if (!session) return;

  document.getElementById("welcome-name").textContent = `Welcome back, ${session.name}!`;

  const profStatus = session.profileStatus;
  const warningContainer = document.getElementById("profile-warning-container");
  if (warningContainer && profStatus && !profStatus.parentComplete) {
    warningContainer.innerHTML = `
      <div class="alert alert-warning border-warning d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 shadow-sm">
        <div class="d-flex align-items-center gap-3">
          <i class="fa-solid fa-triangle-exclamation fa-2x text-warning"></i>
          <div>
            <h6 class="fw-bold mb-1 text-dark">Action Required: Mandatory Profile &amp; Parent Background Incomplete</h6>
            <p class="mb-0 text-muted small">Welcome! University housing policy mandates that you complete your Parent / Guardian details and emergency contacts before you can reserve accommodations.</p>
          </div>
        </div>
        <a href="profile.html?required=1" class="btn btn-warning text-dark fw-bold text-nowrap ms-3">
          <i class="fa-solid fa-user-pen me-1"></i>Complete Profile Now
        </a>
      </div>`;
  }

  let reservations = [];
  try {
    const data = await DataAPI.getReservations({ mine: 1 });
    reservations = data.reservations || [];
  } catch (e) {
    /* reservations endpoint lands in Phase 3 */
  }
  let notifications = [];
  try {
    const data = await DataAPI.getNotifications();
    notifications = data.notifications || [];
  } catch (e) {
    /* notifications endpoint lands in Phase 4 */
  }

  // Available rooms preview (mix of dorms + cottages, available only)
  const [dormsData, cottagesData] = await Promise.all([
    DataAPI.getDorms({ status: "Available" }),
    DataAPI.getCottages({ availability: "Available" }),
  ]);
  const dorms = (dormsData.dorms || []).slice(0, 2);
  const cottages = (cottagesData.cottages || []).slice(0, 1);
  const previewHost = document.getElementById("available-rooms-preview");

  const previewItems = [
    ...dorms.map((d) => ({
      image: d.image,
      title: d.dormitoryName || d.roomNumber,
      subtitle: `Dormitory · ${d.capacity} pax`,
      price: d.price,
      status: d.status,
      link: `rooms.html?type=dorm`,
    })),
    ...cottages.map((c) => ({
      image: c.image,
      title: c.name,
      subtitle: `Cottage · ${c.rooms} rooms`,
      price: c.price,
      status: c.availability,
      link: `rooms.html?type=cottage`,
    })),
  ];

  previewHost.innerHTML = previewItems.length
    ? previewItems
        .map(
          (item) => `
      <div class="col-md-4">
        <div class="room-card">
          <img src="${resolveAsset(item.image)}" alt="${escapeHtml(item.title)}">
          <div class="room-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="fw-bold mb-1">${escapeHtml(item.title)}</h6>
              <span class="badge ${badgeClass(item.status)}">${item.status}</span>
            </div>
            <p class="text-muted small mb-2">${escapeHtml(item.subtitle)}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold text-primary">₱${item.price.toLocaleString()}/mo</span>
              <a href="${item.link}" class="btn btn-sm btn-primary">View</a>
            </div>
          </div>
        </div>
      </div>`
        )
        .join("")
    : `<div class="empty-state w-100"><i class="fa-solid fa-door-closed"></i>No rooms available right now.</div>`;

  // Recent reservations
  const recentHost = document.getElementById("recent-reservations-list");
  const recent = [...reservations].sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate)).slice(0, 4);
  recentHost.innerHTML = recent.length
    ? `<div class="table-responsive"><table class="table align-middle">
        <thead><tr><th>Reservation #</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${recent
          .map(
            (r) => `<tr>
              <td>${r.id}</td>
              <td>${r.type} — ${escapeHtml(r.assetLabel)}</td>
              <td>${r.reservationDate}</td>
              <td><span class="badge ${badgeClass(r.approvalStatus)}">${r.approvalStatus}</span></td>
            </tr>`
          )
          .join("")}</tbody>
      </table></div>`
    : `<div class="empty-state"><i class="fa-solid fa-clipboard"></i>You have no reservations yet.<br><a href="rooms.html" class="btn btn-sm btn-primary mt-2">Browse Rooms</a></div>`;

  // Notifications
  const notifHost = document.getElementById("dashboard-notifications-list");
  notifHost.innerHTML = notifications.length
    ? notifications
        .slice(0, 5)
        .map(
          (n) => `<div class="d-flex gap-2 border-bottom py-2">
            <i class="fa-solid fa-circle-info text-primary mt-1"></i>
            <div>
              <div class="small ${n.read ? "" : "fw-semibold"}">${escapeHtml(n.message)}</div>
              <div class="text-muted" style="font-size:0.75rem;">${n.date}</div>
            </div>
          </div>`
        )
        .join("")
    : `<div class="empty-state"><i class="fa-solid fa-bell-slash"></i>No notifications.</div>`;
});
