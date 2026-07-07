document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let currentType = params.get("type") === "cottage" ? "cottage" : "dorm";

  const tabDorm = document.getElementById("tab-dorm");
  const tabCottage = document.getElementById("tab-cottage");
  const dormFilters = document.getElementById("dorm-filters");
  const grid = document.getElementById("rooms-grid");

  let dormsCache = [];
  let cottagesCache = [];

  function setType(type) {
    currentType = type;
    tabDorm.classList.toggle("active", type === "dorm");
    tabCottage.classList.toggle("active", type === "cottage");
    dormFilters.style.display = type === "dorm" ? "" : "none";
    render();
  }

  tabDorm.addEventListener("click", () => setType("dorm"));
  tabCottage.addEventListener("click", () => setType("cottage"));

  ["filter-gender", "filter-status", "filter-search"].forEach((id) => {
    document.getElementById(id).addEventListener("input", render);
  });

  async function render() {
    if (currentType === "dorm") await renderDorms();
    else await renderCottages();
  }

  async function renderDorms() {
    const gender = document.getElementById("filter-gender").value;
    const status = document.getElementById("filter-status").value;
    const search = document.getElementById("filter-search").value.trim();

    const data = await DataAPI.getDorms({ gender, status, search });
    dormsCache = data.dorms || [];

    grid.innerHTML = dormsCache.length
      ? dormsCache.map((d) => dormCard(d)).join("")
      : `<div class="col-12 empty-state"><i class="fa-solid fa-door-closed"></i>No rooms match your filters.</div>`;

    grid.querySelectorAll("[data-reserve-dorm]").forEach((btn) => {
      btn.addEventListener("click", () => goReserve("dorm", btn.dataset.reserveDorm));
    });
    grid.querySelectorAll("[data-view-dorm]").forEach((btn) => {
      btn.addEventListener("click", () => viewDorm(btn.dataset.viewDorm));
    });
  }

  async function renderCottages() {
    const search = document.getElementById("filter-search")?.value.trim() || "";
    const data = await DataAPI.getCottages({ search });
    cottagesCache = data.cottages || [];

    grid.innerHTML = cottagesCache.length
      ? cottagesCache.map((c) => cottageCard(c)).join("")
      : `<div class="col-12 empty-state"><i class="fa-solid fa-house"></i>No cottages match your filters.</div>`;

    grid.querySelectorAll("[data-reserve-cottage]").forEach((btn) => {
      btn.addEventListener("click", () => goReserve("cottage", btn.dataset.reserveCottage));
    });
    grid.querySelectorAll("[data-view-cottage]").forEach((btn) => {
      btn.addEventListener("click", () => viewCottage(btn.dataset.viewCottage));
    });
  }

  function dormCard(d) {
    const disabled = d.status !== "Available" ? "disabled" : "";
    return `
      <div class="col-sm-6 col-lg-4 col-xl-3">
        <div class="room-card">
          <img src="${resolveAsset(d.image)}" alt="Room ${d.roomNumber}">
          <div class="room-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="fw-bold mb-1">Room ${d.roomNumber}</h6>
              <span class="badge ${badgeClass(d.status)}">${d.status}</span>
            </div>
            <p class="text-muted small mb-1"><i class="fa-solid fa-venus-mars me-1"></i>${d.gender} · <i class="fa-solid fa-users me-1"></i>${d.capacity} pax</p>
            <p class="small text-muted mb-2" style="min-height:40px;">${escapeHtml(d.description).slice(0, 70)}...</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold text-primary">₱${d.price.toLocaleString()}/mo</span>
              <button class="btn btn-sm btn-outline-secondary" data-view-dorm="${d.id}"><i class="fa-solid fa-eye"></i></button>
            </div>
            <button class="btn btn-primary w-100" data-reserve-dorm="${d.id}" ${disabled}>Reserve Now</button>
          </div>
        </div>
      </div>`;
  }

  function cottageCard(c) {
    const disabled = c.availability !== "Available" ? "disabled" : "";
    return `
      <div class="col-sm-6 col-lg-4 col-xl-3">
        <div class="room-card">
          <img src="${resolveAsset(c.image)}" alt="${escapeHtml(c.name)}">
          <div class="room-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="fw-bold mb-1">${escapeHtml(c.name)}</h6>
              <span class="badge ${badgeClass(c.availability)}">${c.availability}</span>
            </div>
            <p class="text-muted small mb-1"><i class="fa-solid fa-user me-1"></i>${escapeHtml(c.owner)} · <i class="fa-solid fa-door-open me-1"></i>${c.rooms} rooms</p>
            <p class="small text-muted mb-2" style="min-height:40px;">${escapeHtml(c.description).slice(0, 70)}...</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold text-primary">₱${c.price.toLocaleString()}/day</span>
              <button class="btn btn-sm btn-outline-secondary" data-view-cottage="${c.id}"><i class="fa-solid fa-eye"></i></button>
            </div>
            <button class="btn btn-primary w-100" data-reserve-cottage="${c.id}" ${disabled}>Reserve Cottage</button>
          </div>
        </div>
      </div>`;
  }

  function goReserve(type, id) {
    window.location.href = `reserve.html?type=${type}&id=${id}`;
  }

  function viewDorm(id) {
    const d = dormsCache.find((x) => String(x.id) === String(id));
    if (!d) return;
    document.getElementById("room-detail-body").innerHTML = `
      <img src="${resolveAsset(d.image)}" class="w-100 rounded mb-3" style="max-height:280px;object-fit:cover;">
      <h5 class="fw-bold">Room ${d.roomNumber} <span class="badge ${badgeClass(d.status)}">${d.status}</span></h5>
      <p class="text-muted mb-2">${d.gender} Dormitory · Capacity: ${d.capacity} pax</p>
      <p>${escapeHtml(d.description)}</p>
      <h5 class="text-primary fw-bold">₱${d.price.toLocaleString()} / month</h5>`;
    const reserveBtn = document.getElementById("room-detail-reserve-btn");
    reserveBtn.disabled = d.status !== "Available";
    reserveBtn.onclick = () => goReserve("dorm", d.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  function viewCottage(id) {
    const c = cottagesCache.find((x) => String(x.id) === String(id));
    if (!c) return;
    document.getElementById("room-detail-body").innerHTML = `
      <img src="${resolveAsset(c.image)}" class="w-100 rounded mb-3" style="max-height:280px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(c.name)} <span class="badge ${badgeClass(c.availability)}">${c.availability}</span></h5>
      <p class="text-muted mb-2">Owner: ${escapeHtml(c.owner)} · ${c.rooms} rooms</p>
      <p>${escapeHtml(c.description)}</p>
      <h5 class="text-primary fw-bold">₱${c.price.toLocaleString()} / day</h5>`;
    const reserveBtn = document.getElementById("room-detail-reserve-btn");
    reserveBtn.disabled = c.availability !== "Available";
    reserveBtn.onclick = () => goReserve("cottage", c.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  setType(currentType);
});
