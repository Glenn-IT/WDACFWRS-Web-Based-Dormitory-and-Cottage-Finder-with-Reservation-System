document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  let currentType = params.get("type") === "cottage" ? "cottage" : "dorm";

  const tabDorm = document.getElementById("tab-dorm");
  const tabCottage = document.getElementById("tab-cottage");
  const thead = document.getElementById("rooms-table-head");
  const tbody = document.getElementById("rooms-table-body");
  const searchInput = document.getElementById("filter-search");
  const ownersSection = document.getElementById("cottage-owners-section");
  const sectionHeading = document.getElementById("rooms-section-heading");
  const countLabel = document.getElementById("rooms-count-label");

  let dormsCache = [];
  let cottagesCache = [];
  let selectedOwnerFilter = "";
  let hasApprovedReservation = false;

  // Check if student has an active approved reservation
  try {
    const resData = await DataAPI.getReservations();
    const list = resData.reservations || [];
    hasApprovedReservation = list.some((r) => r.approvalStatus === "Approved");
    const banner = document.getElementById("approved-banner");
    if (banner && hasApprovedReservation) {
      banner.classList.remove("d-none");
    }
  } catch (e) {
    hasApprovedReservation = false;
  }

  function setType(type) {
    currentType = type;
    selectedOwnerFilter = "";
    tabDorm.classList.toggle("active", type === "dorm");
    tabCottage.classList.toggle("active", type === "cottage");
    if (searchInput) {
      searchInput.placeholder = type === "dorm" ? "Search dormitory name..." : "Search cottage name or owner...";
    }
    if (ownersSection) {
      ownersSection.classList.toggle("d-none", type !== "cottage");
    }
    if (sectionHeading) {
      sectionHeading.textContent = type === "dorm" ? "Dormitory Rooms" : "Cottage Unit & Room Details";
    }
    render();
  }

  tabDorm.addEventListener("click", () => setType("dorm"));
  tabCottage.addEventListener("click", () => setType("cottage"));

  ["filter-status", "filter-search"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        selectedOwnerFilter = "";
        render();
      });
      el.addEventListener("change", () => {
        selectedOwnerFilter = "";
        render();
      });
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

    if (countLabel) countLabel.textContent = `${dormsCache.length} room(s) available`;

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

    // Render Owners with Profiles first
    renderCottageOwners(cottagesCache);

    let filteredCottages = cottagesCache;
    if (selectedOwnerFilter) {
      filteredCottages = cottagesCache.filter((c) => (c.owner || "CSU Auxiliary Services") === selectedOwnerFilter);
    }

    if (countLabel) countLabel.textContent = `${filteredCottages.length} cottage(s) shown`;

    tbody.innerHTML = filteredCottages.length
      ? filteredCottages.map((c) => cottageRow(c)).join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-house"></i>No cottages match your filters.</div></td></tr>`;

    tbody.querySelectorAll("[data-reserve-cottage]").forEach((btn) => {
      btn.addEventListener("click", () => goReserve("cottage", btn.dataset.reserveCottage));
    });
    tbody.querySelectorAll("[data-view-cottage]").forEach((btn) => {
      btn.addEventListener("click", () => viewCottage(btn.dataset.viewCottage));
    });
  }

  function renderCottageOwners(cottages) {
    if (!ownersSection) return;

    // Aggregate cottages by owner
    const ownersMap = new Map();
    cottages.forEach((c) => {
      const ownerName = c.owner || "CSU Auxiliary Services";
      if (!ownersMap.has(ownerName)) {
        ownersMap.set(ownerName, {
          name: ownerName,
          photo: c.ownerPhoto || "",
          phone: c.ownerPhone || "",
          email: c.ownerEmail || "",
          bio: c.ownerBio || "",
          cottages: [],
          totalRooms: 0,
          minPrice: c.price || 0,
          maxPrice: c.price || 0,
          availableCount: 0,
        });
      }
      const item = ownersMap.get(ownerName);
      if (!item.photo && c.ownerPhoto) item.photo = c.ownerPhoto;
      if (!item.phone && c.ownerPhone) item.phone = c.ownerPhone;
      if (!item.email && c.ownerEmail) item.email = c.ownerEmail;
      if (!item.bio && c.ownerBio) item.bio = c.ownerBio;
      item.cottages.push(c);
      item.totalRooms += Number(c.rooms || 1);
      if (c.price < item.minPrice) item.minPrice = c.price;
      if (c.price > item.maxPrice) item.maxPrice = c.price;
      if (c.availability === "Available") item.availableCount++;
    });

    const ownersList = Array.from(ownersMap.values());

    if (!ownersList.length) {
      ownersSection.innerHTML = "";
      return;
    }

    ownersSection.innerHTML = `
      <div class="section-card border shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-id-badge text-primary me-2"></i>Cottage Owners &amp; Property Managers</h6>
            <div class="text-muted small">Select an owner profile below to view their units, or browse all units below.</div>
          </div>
          ${selectedOwnerFilter ? `<button class="btn btn-sm btn-outline-secondary" id="clear-owner-filter-btn"><i class="fa-solid fa-xmark me-1"></i>Show All Owners</button>` : ""}
        </div>
        <div class="row g-3">
          ${ownersList.map((o) => {
            const isSelected = selectedOwnerFilter === o.name;
            const initials = o.name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
            return `
              <div class="col-md-4">
                <div class="card h-100 p-3 clickable border ${isSelected ? "border-primary border-2 shadow-sm bg-light" : ""}" data-owner-card="${escapeHtml(o.name)}">
                  <div class="d-flex align-items-center gap-3 mb-2">
                    ${o.photo
                      ? `<img src="${resolveAsset(o.photo)}" class="rounded-circle border shadow-sm flex-shrink-0" style="width:48px;height:48px;object-fit:cover;">`
                      : `<div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width:48px;height:48px;background:var(--brand-gradient, linear-gradient(135deg,#ea580c,#f97316));font-size:1.1rem;">
                          ${initials || '<i class="fa-solid fa-user"></i>'}
                        </div>`
                    }
                    <div class="overflow-hidden">
                      <h6 class="fw-bold mb-0 text-truncate text-dark">${escapeHtml(o.name)}</h6>
                      <span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="fa-solid fa-check-circle me-1"></i>Verified Host</span>
                    </div>
                  </div>
                  ${o.phone || o.email ? `
                    <div class="small text-muted mb-2">
                      ${o.phone ? `<div class="text-truncate"><i class="fa-solid fa-phone me-1 text-primary"></i>${escapeHtml(o.phone)}</div>` : ""}
                      ${o.email ? `<div class="text-truncate"><i class="fa-solid fa-envelope me-1 text-primary"></i>${escapeHtml(o.email)}</div>` : ""}
                    </div>` : ""}
                  ${o.bio ? `<div class="small text-secondary mb-2 fst-italic text-truncate" title="${escapeHtml(o.bio)}">"${escapeHtml(o.bio)}"</div>` : ""}
                  <div class="small text-muted mb-2">
                    <div><i class="fa-solid fa-house-chimney me-1 text-primary"></i>${o.cottages.length} cottage property(ies) · ${o.totalRooms} rooms</div>
                    <div><i class="fa-solid fa-tags me-1 text-primary"></i>₱${Number(o.minPrice).toLocaleString()} - ₱${Number(o.maxPrice).toLocaleString()}/rate</div>
                  </div>
                  <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                    <span class="badge ${o.availableCount > 0 ? "bg-success" : "bg-secondary"}">${o.availableCount > 0 ? `${o.availableCount} Available` : "Fully Booked"}</span>
                    <span class="text-primary small fw-semibold">${isSelected ? "Viewing Units <i class=\"fa-solid fa-chevron-down ms-1\"></i>" : "View Rooms <i class=\"fa-solid fa-arrow-right ms-1\"></i>"}</span>
                  </div>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;

    ownersSection.querySelectorAll("[data-owner-card]").forEach((card) => {
      card.addEventListener("click", () => {
        const ownerName = card.dataset.ownerCard;
        selectedOwnerFilter = selectedOwnerFilter === ownerName ? "" : ownerName;
        renderCottages();
      });
    });

    const clearBtn = document.getElementById("clear-owner-filter-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        selectedOwnerFilter = "";
        renderCottages();
      });
    }
  }

  function dormRow(d) {
    const isLocked = d.reservedByMe || d.status !== "Available" || hasApprovedReservation;
    const disabled = isLocked ? "disabled" : "";
    const badgeLabel = d.reservedByMe ? "Room/Unit Reserved" : d.status;
    const btnLabel = hasApprovedReservation ? "Booking Locked" : (d.reservedByMe ? "Reserved" : "Reserve");
    const btnTitle = hasApprovedReservation ? "You already have an active approved reservation" : "";
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
          <button class="btn btn-sm btn-primary" data-reserve-dorm="${d.id}" ${disabled} title="${btnTitle}"><i class="fa-solid fa-calendar-check me-1"></i>${btnLabel}</button>
        </td>
      </tr>`;
  }

  function cottageRow(c) {
    const isLocked = c.reservedByMe || c.availability !== "Available" || hasApprovedReservation;
    const disabled = isLocked ? "disabled" : "";
    const badgeLabel = c.reservedByMe ? "Room/Unit Reserved" : c.availability;
    const btnLabel = hasApprovedReservation ? "Booking Locked" : (c.reservedByMe ? "Reserved" : "Reserve");
    const btnTitle = hasApprovedReservation ? "You already have an active approved reservation" : "";
    return `
      <tr>
        <td><img src="${resolveAsset(c.image)}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td class="fw-bold">${escapeHtml(c.name)}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${c.ownerPhoto ? `<img src="${resolveAsset(c.ownerPhoto)}" class="rounded-circle border" style="width:26px;height:26px;object-fit:cover;">` : `<i class="fa-solid fa-circle-user text-muted fs-5"></i>`}
            <span class="badge bg-light text-dark border">${escapeHtml(c.owner || "CSU Auxiliary")}</span>
          </div>
        </td>
        <td>${c.rooms} room(s)</td>
        <td>₱${Number(c.price || 0).toLocaleString()} <span class="text-muted small">/rate</span></td>
        <td><span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-secondary me-1" data-view-cottage="${c.id}"><i class="fa-solid fa-eye me-1"></i>View</button>
          <button class="btn btn-sm btn-primary" data-reserve-cottage="${c.id}" ${disabled} title="${btnTitle}"><i class="fa-solid fa-calendar-check me-1"></i>${btnLabel}</button>
        </td>
      </tr>`;
  }

  function goReserve(type, id) {
    if (hasApprovedReservation) {
      showToast("You already have an active approved reservation.", "error");
      return;
    }
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
    reserveBtn.disabled = d.reservedByMe || d.status !== "Available" || hasApprovedReservation;
    reserveBtn.textContent = hasApprovedReservation ? "Booking Locked" : (d.reservedByMe ? "Room/Unit Reserved" : "Reserve Now");
    reserveBtn.onclick = () => goReserve("dorm", d.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  function viewCottage(id) {
    const c = cottagesCache.find((x) => String(x.id) === String(id));
    if (!c) return;
    const badgeLabel = c.reservedByMe ? "Room/Unit Reserved" : c.availability;
    const ownerName = c.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    document.getElementById("room-detail-body").innerHTML = `
      <!-- Owner Profile Section -->
      <div class="card border p-3 mb-3 bg-light shadow-sm">
        <div class="d-flex align-items-start gap-3">
          ${c.ownerPhoto
            ? `<img src="${resolveAsset(c.ownerPhoto)}" class="rounded-circle border shadow-sm flex-shrink-0" style="width:58px;height:58px;object-fit:cover;">`
            : `<div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style="width:58px;height:58px;background:var(--brand-gradient, linear-gradient(135deg,#ea580c,#f97316));font-size:1.25rem;">
                ${initials || '<i class="fa-solid fa-user"></i>'}
              </div>`
          }
          <div class="flex-grow-1 overflow-hidden">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h6 class="fw-bold text-dark fs-6 mb-0">${escapeHtml(ownerName)}</h6>
              <span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="fa-solid fa-circle-check me-1"></i>Verified Host</span>
            </div>
            <div class="text-muted small mt-1">
              ${c.ownerPhone ? `<span class="me-3"><i class="fa-solid fa-phone me-1 text-primary"></i>${escapeHtml(c.ownerPhone)}</span>` : ""}
              ${c.ownerEmail ? `<span><i class="fa-solid fa-envelope me-1 text-primary"></i>${escapeHtml(c.ownerEmail)}</span>` : ""}
            </div>
            ${c.ownerBio ? `<div class="small text-secondary mt-2 fst-italic">"${escapeHtml(c.ownerBio)}"</div>` : `<div class="text-muted small mt-1">CSU-Piat registered cottage property owner / manager.</div>`}
          </div>
        </div>
      </div>

      <!-- Room Details -->
      <img src="${resolveAsset(c.image)}" class="w-100 rounded mb-3" style="max-height:280px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(c.name)} <span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-bed me-1"></i>${c.rooms} rooms total · <i class="fa-solid fa-tag me-1"></i>Daily Rate Accommodation</p>
      <p>${escapeHtml(c.description)}</p>
      <h5 class="text-primary fw-bold">₱${Number(c.price || 0).toLocaleString()} / rate</h5>`;
    const reserveBtn = document.getElementById("room-detail-reserve-btn");
    reserveBtn.disabled = c.reservedByMe || c.availability !== "Available" || hasApprovedReservation;
    reserveBtn.textContent = hasApprovedReservation ? "Booking Locked" : (c.reservedByMe ? "Room/Unit Reserved" : "Reserve Cottage");
    reserveBtn.onclick = () => goReserve("cottage", c.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  setType(currentType);
});
