/* ============================================================
   CSU-Piat Dormitory & Cottage Finder — Guest Browser Controller
   Allows unauthenticated visitors to explore available units,
   view detailed specifications, and prompts login to reserve.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let currentType = params.get("type") === "cottage" ? "cottage" : "dorm";

  const tabDorm = document.getElementById("tab-dorm");
  const tabCottage = document.getElementById("tab-cottage");
  const dormGenderCol = document.getElementById("dorm-gender-col");
  const grid = document.getElementById("guest-grid");

  const statTotalEl = document.getElementById("stat-total-avail");
  const statDormsEl = document.getElementById("stat-dorms-avail");
  const statCottagesEl = document.getElementById("stat-cottages-avail");

  let dormsCache = [];
  let cottagesCache = [];

  function setType(type) {
    currentType = type;
    if (tabDorm) tabDorm.classList.toggle("active", type === "dorm");
    if (tabCottage) tabCottage.classList.toggle("active", type === "cottage");
    if (dormGenderCol) dormGenderCol.style.display = type === "dorm" ? "" : "none";
    render();
  }

  if (tabDorm) tabDorm.addEventListener("click", () => setType("dorm"));
  if (tabCottage) tabCottage.addEventListener("click", () => setType("cottage"));

  ["filter-status", "filter-gender"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", render);
      el.addEventListener("input", render);
    }
  });

  const searchEl = document.getElementById("filter-search");
  if (searchEl) {
    searchEl.addEventListener("input", debounce(render, 250));
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function updateStats() {
    try {
      const availDorms = dormsCache.filter((d) => d.status === "Available").length;
      const availCottages = cottagesCache.filter((c) => c.availability === "Available").length;

      if (statTotalEl) statTotalEl.textContent = availDorms + availCottages;
      if (statDormsEl) statDormsEl.textContent = availDorms;
      if (statCottagesEl) statCottagesEl.textContent = availCottages;
    } catch (e) {
      console.warn("Could not calculate stats:", e);
    }
  }

  async function render() {
    grid.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <div>Loading available units...</div>
      </div>`;
    if (currentType === "dorm") {
      await renderDorms();
    } else {
      await renderCottages();
    }
  }
  window.guestRender = render;

  async function renderDorms() {
    const status = document.getElementById("filter-status")?.value || "";
    const gender = document.getElementById("filter-gender")?.value || "";
    const search = document.getElementById("filter-search")?.value.trim() || "";

    try {
      const data = await DataAPI.getDorms({ status, gender, search });
      dormsCache = (data && data.dorms) ? data.dorms : [];

      if (!status && !gender && !search) {
        updateStats();
      }

      grid.innerHTML = dormsCache.length
        ? dormsCache.map((d) => dormCard(d)).join("")
        : `<div class="col-12 empty-state"><i class="fa-solid fa-door-closed"></i>No dormitory rooms match your search filters.</div>`;

      grid.querySelectorAll("[data-view-dorm]").forEach((btn) => {
        btn.addEventListener("click", () => viewDorm(btn.dataset.viewDorm));
      });
      grid.querySelectorAll("[data-reserve-unit]").forEach((btn) => {
        btn.addEventListener("click", () => promptReserve(btn.dataset.reserveUnit, btn.dataset.unitType, btn.dataset.unitName));
      });
    } catch (err) {
      console.error("renderDorms error:", err);
      const isFileProtocol = window.location.protocol === "file:";
      grid.innerHTML = `
        <div class="col-12 empty-state text-danger">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div class="fw-bold fs-5 mb-1">Failed to load dormitory rooms</div>
          <p class="small text-muted mb-3">${escapeHtml(err.message || String(err))}</p>
          ${
            isFileProtocol
              ? `<div class="alert alert-warning text-dark text-start small mb-3">
                   <strong><i class="fa-solid fa-circle-exclamation me-1"></i> Running from local file:</strong>
                   You opened this file via <code>file:///</code>. Browsers prevent local files from requesting API endpoints.
                   Please open this page via your XAMPP local server:
                   <br><br>
                   👉 <a href="http://localhost/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/guest.html" class="fw-bold">http://localhost/WDACFWRS-.../guest.html</a>
                   <br>
                   or 👉 <a href="http://wdac.local/guest.html" class="fw-bold">http://wdac.local/guest.html</a>
                 </div>`
              : `<button class="btn btn-sm btn-outline-primary" onclick="window.guestRender()"><i class="fa-solid fa-rotate-right me-1"></i>Try Again</button>`
          }
        </div>`;
    }
  }

  async function renderCottages() {
    const status = document.getElementById("filter-status")?.value || "";
    const search = document.getElementById("filter-search")?.value.trim() || "";

    const availability = status === "Occupied" ? "Booked" : (status === "Available" ? "Available" : "");

    try {
      const data = await DataAPI.getCottages({ availability, search });
      cottagesCache = (data && data.cottages) ? data.cottages : [];

      if (!status && !search) {
        updateStats();
      }

      grid.innerHTML = cottagesCache.length
        ? cottagesCache.map((c) => cottageCard(c)).join("")
        : `<div class="col-12 empty-state"><i class="fa-solid fa-house"></i>No cottages match your search filters.</div>`;

      grid.querySelectorAll("[data-view-cottage]").forEach((btn) => {
        btn.addEventListener("click", () => viewCottage(btn.dataset.viewCottage));
      });
      grid.querySelectorAll("[data-reserve-unit]").forEach((btn) => {
        btn.addEventListener("click", () => promptReserve(btn.dataset.reserveUnit, btn.dataset.unitType, btn.dataset.unitName));
      });
    } catch (err) {
      console.error("renderCottages error:", err);
      const isFileProtocol = window.location.protocol === "file:";
      grid.innerHTML = `
        <div class="col-12 empty-state text-danger">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div class="fw-bold fs-5 mb-1">Failed to load cottages</div>
          <p class="small text-muted mb-3">${escapeHtml(err.message || String(err))}</p>
          ${
            isFileProtocol
              ? `<div class="alert alert-warning text-dark text-start small mb-3">
                   <strong><i class="fa-solid fa-circle-exclamation me-1"></i> Running from local file:</strong>
                   You opened this file via <code>file:///</code>. Browsers prevent local files from requesting API endpoints.
                   Please open this page via your XAMPP local server:
                   <br><br>
                   👉 <a href="http://localhost/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/guest.html" class="fw-bold">http://localhost/WDACFWRS-.../guest.html</a>
                   <br>
                   or 👉 <a href="http://wdac.local/guest.html" class="fw-bold">http://wdac.local/guest.html</a>
                 </div>`
              : `<button class="btn btn-sm btn-outline-primary" onclick="window.guestRender()"><i class="fa-solid fa-rotate-right me-1"></i>Try Again</button>`
          }
        </div>`;
    }
  }

  function dormCard(d) {
    const isAvail = d.status === "Available";
    const statusClass = badgeClass(d.status);
    return `
      <div class="col-sm-6 col-lg-4 col-xl-3">
        <div class="room-card h-100 d-flex flex-column">
          <div class="position-relative">
            <img src="${resolveAsset(d.image)}" alt="${escapeHtml(d.roomNumber)}" class="w-100" style="height: 180px; object-fit: cover;">
            <span class="badge ${statusClass} position-absolute top-0 end-0 m-2 shadow-sm">${d.status}</span>
          </div>
          <div class="room-body d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h6 class="fw-bold mb-0 text-truncate" title="${escapeHtml(d.roomNumber)}">${escapeHtml(d.roomNumber)}</h6>
            </div>
            <div class="d-flex gap-2 text-muted small mb-2">
              <span><i class="fa-solid fa-users me-1"></i>${d.capacity} pax</span>
              <span>·</span>
              <span><i class="fa-solid fa-venus-mars me-1"></i>${escapeHtml(d.gender || "Any")}</span>
            </div>
            <p class="small text-muted mb-3 flex-grow-1" style="min-height: 38px;">
              ${escapeHtml(d.description ? d.description.slice(0, 85) + (d.description.length > 85 ? "..." : "") : "No description provided.")}
            </p>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span class="fw-bold text-primary fs-5">₱${Number(d.price || 0).toLocaleString()}</span>
                <span class="text-muted small">/month</span>
              </div>
              <button class="btn btn-sm btn-outline-secondary" data-view-dorm="${d.id}" title="View Details">
                <i class="fa-solid fa-eye me-1"></i>Details
              </button>
            </div>
            ${
              isAvail
                ? `<button class="btn btn-primary w-100" data-reserve-unit="${d.id}" data-unit-type="dorm" data-unit-name="${escapeHtml(d.roomNumber)}">
                     <i class="fa-solid fa-calendar-check me-1"></i>Reserve Room
                   </button>`
                : `<button class="btn btn-secondary w-100" disabled>
                     <i class="fa-solid fa-ban me-1"></i>${d.status}
                   </button>`
            }
          </div>
        </div>
      </div>`;
  }

  function cottageCard(c) {
    const isAvail = c.availability === "Available";
    const statusClass = badgeClass(c.availability);
    return `
      <div class="col-sm-6 col-lg-4 col-xl-3">
        <div class="room-card h-100 d-flex flex-column">
          <div class="position-relative">
            <img src="${resolveAsset(c.image)}" alt="${escapeHtml(c.name)}" class="w-100" style="height: 180px; object-fit: cover;">
            <span class="badge ${statusClass} position-absolute top-0 end-0 m-2 shadow-sm">${c.availability}</span>
          </div>
          <div class="room-body d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h6 class="fw-bold mb-0 text-truncate" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</h6>
            </div>
            <div class="text-muted small mb-2 d-flex align-items-center gap-1">
              ${c.ownerPhoto ? `<img src="${resolveAsset(c.ownerPhoto)}" class="rounded-circle border" style="width:20px;height:20px;object-fit:cover;">` : `<i class="fa-solid fa-user text-primary"></i>`}
              <span class="text-truncate">${escapeHtml(c.owner || "CSU Auxiliary")}</span>
              <span class="ms-auto"><i class="fa-solid fa-bed me-1"></i>${c.rooms} Room(s)</span>
            </div>
            <p class="small text-muted mb-3 flex-grow-1" style="min-height: 38px;">
              ${escapeHtml(c.description ? c.description.slice(0, 85) + (c.description.length > 85 ? "..." : "") : "No description provided.")}
            </p>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span class="fw-bold text-primary fs-5">₱${Number(c.price || 0).toLocaleString()}</span>
                <span class="text-muted small">/rate</span>
              </div>
              <button class="btn btn-sm btn-outline-secondary" data-view-cottage="${c.id}" title="View Details">
                <i class="fa-solid fa-eye me-1"></i>Details
              </button>
            </div>
            ${
              isAvail
                ? `<button class="btn btn-primary w-100" data-reserve-unit="${c.id}" data-unit-type="cottage" data-unit-name="${escapeHtml(c.name)}">
                     <i class="fa-solid fa-calendar-check me-1"></i>Reserve Cottage
                   </button>`
                : `<button class="btn btn-secondary w-100" disabled>
                     <i class="fa-solid fa-ban me-1"></i>${c.availability}
                   </button>`
            }
          </div>
        </div>
      </div>`;
  }

  function viewDorm(id) {
    const d = dormsCache.find((x) => String(x.id) === String(id));
    if (!d) return;

    const isAvail = d.status === "Available";
    const body = document.getElementById("unit-detail-body");
    body.innerHTML = `
      <div class="row g-3">
        <div class="col-md-5">
          <img src="${resolveAsset(d.image)}" class="w-100 rounded shadow-sm" style="max-height: 240px; object-fit: cover;">
        </div>
        <div class="col-md-7">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="fw-bold mb-0">${escapeHtml(d.roomNumber)}</h5>
            <span class="badge ${badgeClass(d.status)}">${d.status}</span>
          </div>
          <p class="text-primary fw-bold fs-5 mb-2">₱${Number(d.price || 0).toLocaleString()} <span class="text-muted small fs-6">/ month</span></p>
          <ul class="list-unstyled small mb-3">
            <li class="mb-1"><i class="fa-solid fa-users text-primary me-2"></i><strong>Capacity:</strong> ${d.capacity} pax</li>
            <li class="mb-1"><i class="fa-solid fa-venus-mars text-primary me-2"></i><strong>Gender:</strong> ${escapeHtml(d.gender || "Any")}</li>
            <li class="mb-1"><i class="fa-solid fa-building text-primary me-2"></i><strong>Type:</strong> Student Dormitory</li>
          </ul>
          <h6 class="fw-semibold small text-uppercase text-muted">Description &amp; Amenities</h6>
          <p class="small text-secondary mb-0">${escapeHtml(d.description || "No specific details provided.")}</p>
        </div>
      </div>
    `;

    const ctaBtn = document.getElementById("detail-reserve-cta");
    if (ctaBtn) {
      if (isAvail) {
        ctaBtn.className = "btn btn-primary";
        ctaBtn.disabled = false;
        ctaBtn.innerHTML = `<i class="fa-solid fa-calendar-check me-1"></i>Reserve Room`;
        ctaBtn.onclick = () => {
          bootstrap.Modal.getInstance(document.getElementById("unit-detail-modal")).hide();
          promptReserve(d.id, "dorm", d.roomNumber);
        };
      } else {
        ctaBtn.className = "btn btn-secondary";
        ctaBtn.disabled = true;
        ctaBtn.innerHTML = `<i class="fa-solid fa-ban me-1"></i>${d.status}`;
      }
    }

    new bootstrap.Modal(document.getElementById("unit-detail-modal")).show();
  }

  function viewCottage(id) {
    const c = cottagesCache.find((x) => String(x.id) === String(id));
    if (!c) return;

    const isAvail = c.availability === "Available";
    const body = document.getElementById("unit-detail-body");
    const ownerName = c.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    body.innerHTML = `
      <!-- Owner Profile Header -->
      <div class="card border p-3 mb-3 bg-light shadow-sm">
        <div class="d-flex align-items-center gap-3">
          ${c.ownerPhoto
            ? `<img src="${resolveAsset(c.ownerPhoto)}" class="rounded-circle border shadow-sm flex-shrink-0" style="width:52px;height:52px;object-fit:cover;">`
            : `<div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style="width:52px;height:52px;background:var(--brand-gradient, linear-gradient(135deg,#ea580c,#f97316));font-size:1.15rem;">
                ${initials || '<i class="fa-solid fa-user"></i>'}
              </div>`
          }
          <div class="overflow-hidden flex-grow-1">
            <div class="d-flex align-items-center gap-2">
              <h6 class="fw-bold mb-0 text-dark">${escapeHtml(ownerName)}</h6>
              <span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="fa-solid fa-check me-1"></i>Verified Host</span>
            </div>
            <div class="small text-muted mt-1">
              ${c.ownerPhone ? `<span class="me-3"><i class="fa-solid fa-phone me-1 text-primary"></i>${escapeHtml(c.ownerPhone)}</span>` : ""}
              ${c.ownerEmail ? `<span><i class="fa-solid fa-envelope me-1 text-primary"></i>${escapeHtml(c.ownerEmail)}</span>` : ""}
            </div>
            ${c.ownerBio ? `<div class="small text-secondary mt-1 fst-italic">"${escapeHtml(c.ownerBio)}"</div>` : ""}
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-5">
          <img src="${resolveAsset(c.image)}" class="w-100 rounded shadow-sm" style="max-height: 240px; object-fit: cover;">
        </div>
        <div class="col-md-7">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="fw-bold mb-0">${escapeHtml(c.name)}</h5>
            <span class="badge ${badgeClass(c.availability)}">${c.availability}</span>
          </div>
          <p class="text-primary fw-bold fs-5 mb-2">₱${Number(c.price || 0).toLocaleString()} <span class="text-muted small fs-6">/ rate</span></p>
          <ul class="list-unstyled small mb-3">
            <li class="mb-1"><i class="fa-solid fa-bed text-primary me-2"></i><strong>Rooms:</strong> ${c.rooms} room(s)</li>
            <li class="mb-1"><i class="fa-solid fa-user text-primary me-2"></i><strong>Manager / Owner:</strong> ${escapeHtml(c.owner || "CSU Housing")}</li>
            <li class="mb-1"><i class="fa-solid fa-house text-primary me-2"></i><strong>Type:</strong> Campus Cottage</li>
          </ul>
          <h6 class="fw-semibold small text-uppercase text-muted">Description &amp; Amenities</h6>
          <p class="small text-secondary mb-0">${escapeHtml(c.description || "No specific details provided.")}</p>
        </div>
      </div>
    `;

    const ctaBtn = document.getElementById("detail-reserve-cta");
    if (ctaBtn) {
      if (isAvail) {
        ctaBtn.className = "btn btn-primary";
        ctaBtn.disabled = false;
        ctaBtn.innerHTML = `<i class="fa-solid fa-calendar-check me-1"></i>Reserve Cottage`;
        ctaBtn.onclick = () => {
          bootstrap.Modal.getInstance(document.getElementById("unit-detail-modal")).hide();
          promptReserve(c.id, "cottage", c.name);
        };
      } else {
        ctaBtn.className = "btn btn-secondary";
        ctaBtn.disabled = true;
        ctaBtn.innerHTML = `<i class="fa-solid fa-ban me-1"></i>${c.availability}`;
      }
    }

    new bootstrap.Modal(document.getElementById("unit-detail-modal")).show();
  }

  function promptReserve(id, type, name) {
    const promptNameEl = document.getElementById("prompt-unit-name");
    if (promptNameEl) {
      promptNameEl.textContent = `${type === "dorm" ? "Dormitory: " : "Cottage: "}${name}`;
    }
    const modalEl = document.getElementById("guest-reserve-prompt-modal");
    if (modalEl) {
      new bootstrap.Modal(modalEl).show();
    }
  }

  // Pre-load global stats quietly
  (async function initStats() {
    try {
      const [dRes, cRes] = await Promise.all([DataAPI.getDorms(), DataAPI.getCottages()]);
      const dList = dRes?.dorms || [];
      const cList = cRes?.cottages || [];
      const availD = dList.filter((x) => x.status === "Available").length;
      const availC = cList.filter((x) => x.availability === "Available").length;
      if (statTotalEl) statTotalEl.textContent = availD + availC;
      if (statDormsEl) statDormsEl.textContent = availD;
      if (statCottagesEl) statCottagesEl.textContent = availC;
    } catch (e) {
      /* ignore stats error */
    }
  })();

  // Render current selected type
  setType(currentType);
});
