document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let currentType = params.get("type") === "cottage" ? "cottage" : "dorm";

  const tabDorm = document.getElementById("tab-dorm");
  const tabCottage = document.getElementById("tab-cottage");
  const thead = document.getElementById("rooms-table-head");
  const tbody = document.getElementById("rooms-table-body");
  const searchInput = document.getElementById("filter-search");

  let dormsCache = [];
  let cottagesCache = [];

  function setType(type) {
    currentType = type;
    tabDorm.classList.toggle("active", type === "dorm");
    tabCottage.classList.toggle("active", type === "cottage");
    if (searchInput) {
      searchInput.placeholder = type === "dorm" ? "Search dormitory name..." : "Search cottage name or owner...";
    }
    render();
  }

  tabDorm.addEventListener("click", () => setType("dorm"));
  tabCottage.addEventListener("click", () => setType("cottage"));

  ["filter-status", "filter-search"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    }
  });

  async function render() {
    if (currentType === "dorm") await renderDorms();
    else await renderCottages();
  }

  async function renderDorms() {
    thead.innerHTML = `
      <tr>
        <th>Image</th>
        <th>Dormitory Name</th>
        <th>Capacity</th>
        <th>Price</th>
        <th>Status</th>
        <th class="text-end">Actions</th>
      </tr>`;

    const status = document.getElementById("filter-status")?.value || "";
    const search = document.getElementById("filter-search")?.value.trim() || "";

    const data = await DataAPI.getDorms({ status, search });
    dormsCache = data.dorms || [];

    tbody.innerHTML = dormsCache.length
      ? dormsCache.map((d) => dormRow(d)).join("")
      : `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-door-closed"></i>No dormitory rooms match your filters.</div></td></tr>`;

    tbody.querySelectorAll("[data-reserve-dorm]").forEach((btn) => {
      btn.addEventListener("click", () => goReserve("dorm", btn.dataset.reserveDorm));
    });
    tbody.querySelectorAll("[data-view-dorm]").forEach((btn) => {
      btn.addEventListener("click", () => viewDorm(btn.dataset.viewDorm));
    });
  }

  async function renderCottages() {
    thead.innerHTML = `
      <tr>
        <th>Image</th>
        <th>Cottage Name</th>
        <th>Owner</th>
        <th>Rooms</th>
        <th>Price</th>
        <th>Availability</th>
        <th class="text-end">Actions</th>
      </tr>`;

    const status = document.getElementById("filter-status")?.value || "";
    const search = document.getElementById("filter-search")?.value.trim() || "";
    const availability = status === "Occupied" ? "Booked" : (status === "Available" ? "Available" : "");

    const data = await DataAPI.getCottages({ availability, search });
    cottagesCache = data.cottages || [];

    tbody.innerHTML = cottagesCache.length
      ? cottagesCache.map((c) => cottageRow(c)).join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-house"></i>No cottages match your filters.</div></td></tr>`;

    tbody.querySelectorAll("[data-reserve-cottage]").forEach((btn) => {
      btn.addEventListener("click", () => goReserve("cottage", btn.dataset.reserveCottage));
    });
    tbody.querySelectorAll("[data-view-cottage]").forEach((btn) => {
      btn.addEventListener("click", () => viewCottage(btn.dataset.viewCottage));
    });
  }

  function dormRow(d) {
    const disabled = (d.reservedByMe || d.status !== "Available") ? "disabled" : "";
    const badgeLabel = d.reservedByMe ? "Room/Unit Reserved" : d.status;
    const btnLabel = d.reservedByMe ? "Reserved" : "Reserve";
    return `
      <tr>
        <td><img src="${resolveAsset(d.image)}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td>
          <div class="fw-bold">${escapeHtml(d.roomNumber)}</div>
          <div class="text-muted small">${escapeHtml(d.gender || "All")} Gender</div>
        </td>
        <td>${d.capacity} pax</td>
        <td>₱${Number(d.price || 0).toLocaleString()} <span class="text-muted small">/mo</span></td>
        <td><span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-secondary me-1" data-view-dorm="${d.id}"><i class="fa-solid fa-eye me-1"></i>View</button>
          <button class="btn btn-sm btn-primary" data-reserve-dorm="${d.id}" ${disabled}><i class="fa-solid fa-calendar-check me-1"></i>${btnLabel}</button>
        </td>
      </tr>`;
  }

  function cottageRow(c) {
    const disabled = (c.reservedByMe || c.availability !== "Available") ? "disabled" : "";
    const badgeLabel = c.reservedByMe ? "Room/Unit Reserved" : c.availability;
    const btnLabel = c.reservedByMe ? "Reserved" : "Reserve";
    return `
      <tr>
        <td><img src="${resolveAsset(c.image)}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td class="fw-bold">${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.owner || "CSU Auxiliary")}</td>
        <td>${c.rooms} room(s)</td>
        <td>₱${Number(c.price || 0).toLocaleString()} <span class="text-muted small">/rate</span></td>
        <td><span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-secondary me-1" data-view-cottage="${c.id}"><i class="fa-solid fa-eye me-1"></i>View</button>
          <button class="btn btn-sm btn-primary" data-reserve-cottage="${c.id}" ${disabled}><i class="fa-solid fa-calendar-check me-1"></i>${btnLabel}</button>
        </td>
      </tr>`;
  }

  function goReserve(type, id) {
    window.location.href = `reserve.html?type=${type}&id=${id}`;
  }

  function viewDorm(id) {
    const d = dormsCache.find((x) => String(x.id) === String(id));
    if (!d) return;
    const badgeLabel = d.reservedByMe ? "Room/Unit Reserved" : d.status;
    document.getElementById("room-detail-body").innerHTML = `
      <img src="${resolveAsset(d.image)}" class="w-100 rounded mb-3" style="max-height:280px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(d.roomNumber)} <span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-users me-1"></i>Capacity: ${d.capacity} pax · <i class="fa-solid fa-venus-mars me-1"></i>${escapeHtml(d.gender || "All")} Gender</p>
      <p>${escapeHtml(d.description)}</p>
      <h5 class="text-primary fw-bold">₱${Number(d.price || 0).toLocaleString()} / month</h5>`;
    const reserveBtn = document.getElementById("room-detail-reserve-btn");
    reserveBtn.disabled = d.reservedByMe || d.status !== "Available";
    reserveBtn.textContent = d.reservedByMe ? "Room/Unit Reserved" : "Reserve Now";
    reserveBtn.onclick = () => goReserve("dorm", d.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  function viewCottage(id) {
    const c = cottagesCache.find((x) => String(x.id) === String(id));
    if (!c) return;
    const badgeLabel = c.reservedByMe ? "Room/Unit Reserved" : c.availability;
    document.getElementById("room-detail-body").innerHTML = `
      <img src="${resolveAsset(c.image)}" class="w-100 rounded mb-3" style="max-height:280px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(c.name)} <span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-user me-1"></i>Owner: ${escapeHtml(c.owner)} · <i class="fa-solid fa-bed me-1"></i>${c.rooms} rooms</p>
      <p>${escapeHtml(c.description)}</p>
      <h5 class="text-primary fw-bold">₱${Number(c.price || 0).toLocaleString()} / rate</h5>`;
    const reserveBtn = document.getElementById("room-detail-reserve-btn");
    reserveBtn.disabled = c.reservedByMe || c.availability !== "Available";
    reserveBtn.textContent = c.reservedByMe ? "Room/Unit Reserved" : "Reserve Cottage";
    reserveBtn.onclick = () => goReserve("cottage", c.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  setType(currentType);
});
