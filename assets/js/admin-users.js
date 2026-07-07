document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("users-table-body");
  const viewModal = new bootstrap.Modal(document.getElementById("user-view-modal"));

  ["filter-search", "filter-status", "sort-by"].forEach((id) => {
    document.getElementById(id).addEventListener("input", render);
  });

  function render() {
    const search = document.getElementById("filter-search").value.trim().toLowerCase();
    const status = document.getElementById("filter-status").value;
    const sortBy = document.getElementById("sort-by").value;

    let users = DataAPI.getUsers();
    if (search) {
      users = users.filter(
        (u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }
    if (status) users = users.filter((u) => u.status === status);

    users = [...users].sort((a, b) => {
      if (sortBy === "dateRegistered") return new Date(b.dateRegistered) - new Date(a.dateRegistered);
      if (sortBy === "course") return (a.course || "").localeCompare(b.course || "");
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

    tbody.innerHTML = users.length
      ? users
          .map(
            (u) => `
      <tr>
        <td><img src="${u.profilePic}" class="avatar-circle"></td>
        <td>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.course || "-")}</td>
        <td>${u.dateRegistered}</td>
        <td><span class="badge ${badgeClass(u.status)}">${u.status}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-secondary" data-view="${u.id}"><i class="fa-solid fa-eye"></i></button>
          ${u.status === "Active"
            ? `<button class="btn btn-sm btn-outline-danger" data-deactivate="${u.id}"><i class="fa-solid fa-user-slash"></i></button>`
            : `<button class="btn btn-sm btn-outline-success" data-activate="${u.id}"><i class="fa-solid fa-user-check"></i></button>`}
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-users"></i>No users match your search.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewUser(b.dataset.view)));
    tbody.querySelectorAll("[data-deactivate]").forEach((b) => b.addEventListener("click", () => setStatus(b.dataset.deactivate, "Inactive")));
    tbody.querySelectorAll("[data-activate]").forEach((b) => b.addEventListener("click", () => setStatus(b.dataset.activate, "Active")));
  }

  function viewUser(id) {
    const u = DataAPI.getUsers().find((x) => x.id === id);
    if (!u) return;
    document.getElementById("user-view-body").innerHTML = `
      <div class="text-center mb-3">
        <img src="${u.profilePic}" class="rounded-circle mb-2" style="width:96px;height:96px;object-fit:cover;">
        <h5 class="fw-bold mb-0">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</h5>
        <p class="text-muted mb-0">${escapeHtml(u.email)}</p>
        <span class="badge ${badgeClass(u.status)}">${u.status}</span>
      </div>
      <div class="row small">
        <div class="col-6">Student ID: ${u.id}</div>
        <div class="col-6">Phone: ${escapeHtml(u.phone || "-")}</div>
        <div class="col-6">Course: ${escapeHtml(u.course || "-")}</div>
        <div class="col-6">Year Level: ${escapeHtml(u.yearLevel || "-")}</div>
        <div class="col-6">Semester: ${escapeHtml(u.semester || "-")}</div>
        <div class="col-6">Nationality: ${escapeHtml(u.nationality || "-")}</div>
        <div class="col-12">Address: ${escapeHtml(u.address || "-")}</div>
        <div class="col-6">Birthday: ${u.birthday || "-"}</div>
        <div class="col-6">Registered: ${u.dateRegistered}</div>
      </div>`;
    viewModal.show();
  }

  async function setStatus(id, status) {
    const ok = await confirmDialog({
      title: status === "Active" ? "Activate User" : "Deactivate User",
      message: `Are you sure you want to ${status === "Active" ? "activate" : "deactivate"} this account?`,
      confirmText: status === "Active" ? "Activate" : "Deactivate",
      confirmClass: status === "Active" ? "btn-success" : "btn-danger",
    });
    if (!ok) return;

    withLoading(() => {
      const users = DataAPI.getUsers();
      const u = users.find((x) => x.id === id);
      if (u) u.status = status;
      DataAPI.saveUsers(users);
      render();
      showToast(`Account ${status.toLowerCase()}.`, status === "Active" ? "success" : "warning");
    });
  }

  render();
});
