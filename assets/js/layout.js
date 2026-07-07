/* ============================================================
   Layout injector: fixed sidebar + top navigation
   Usage: <body data-role="student" data-page="dashboard">
   ============================================================ */

async function initLayout() {
  const role = document.body.dataset.role; // "student" | "admin"
  const page = document.body.dataset.page;
  const isAdmin = role === "admin";

  const session = Auth.requireRole(isAdmin ? "admin" : "student");
  if (!session) return;

  const sidebarHost = document.getElementById("app-sidebar");
  const topbarHost = document.getElementById("app-topbar");

  const [sidebarHtml, topbarHtml] = await Promise.all([
    fetch(`../partials/${isAdmin ? "admin" : "user"}-sidebar.html`).then((r) => r.text()),
    fetch(`../partials/${isAdmin ? "admin" : "user"}-topbar.html`).then((r) => r.text()),
  ]);

  sidebarHost.innerHTML = sidebarHtml;
  topbarHost.innerHTML = topbarHtml;

  sidebarHost.querySelectorAll(".nav-link[data-page]").forEach((link) => {
    if (link.dataset.page === page) link.classList.add("active");
  });

  const titleEl = document.getElementById("topbar-page-title");
  if (titleEl) titleEl.textContent = document.title.split("|")[0].trim();

  const usernameEl = document.getElementById("topbar-username");
  if (usernameEl) usernameEl.textContent = session.name;

  if (!isAdmin) {
    const users = DataAPI.getUsers();
    const user = users.find((u) => u.id === session.id);
    const avatarEl = document.getElementById("topbar-avatar");
    if (avatarEl && user?.profilePic) avatarEl.src = user.profilePic;

    const notifications = DataAPI.getNotifications().filter((n) => n.studentId === session.id);
    const unread = notifications.filter((n) => !n.read).length;
    const countEl = document.getElementById("notif-count");
    if (countEl) {
      countEl.textContent = unread;
      countEl.style.display = unread > 0 ? "" : "none";
    }
    const dropdown = document.getElementById("notif-dropdown");
    if (dropdown) {
      dropdown.innerHTML = notifications.length
        ? notifications
            .slice(0, 6)
            .map(
              (n) => `
          <div class="dropdown-item-text small border-bottom py-2 ${n.read ? "" : "fw-semibold"}">
            <div>${escapeHtml(n.message)}</div>
            <div class="text-muted" style="font-size: 0.75rem;">${n.date}</div>
          </div>`
            )
            .join("")
        : `<div class="text-center text-muted small py-3">No notifications</div>`;
    }
  }

  document.querySelectorAll("#sidebar-logout-link, #topbar-logout-link").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const ok = await confirmDialog({
        title: "Confirm Logout",
        message: "Are you sure you want to log out of your account?",
        confirmText: "Logout",
        confirmClass: "btn-danger",
      });
      if (ok) Auth.logout();
    });
  });

  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebarHost.classList.toggle("show");
    });
  }
}

document.addEventListener("DOMContentLoaded", initLayout);
