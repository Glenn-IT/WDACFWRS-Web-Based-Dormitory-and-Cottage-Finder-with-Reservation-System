document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawType = params.get("type");
  let currentType = rawType === "cottage" ? "cottage" : (rawType === "kubotel" ? "kubotel" : "dorm");

  const tabDorm = document.getElementById("tab-dorm");
  const tabCottage = document.getElementById("tab-cottage");
  const tabKubotel = document.getElementById("tab-kubotel");
  const thead = document.getElementById("rooms-table-head");
  const tbody = document.getElementById("rooms-table-body");
  const searchInput = document.getElementById("filter-search");
  const ownersSection = document.getElementById("cottage-owners-section");
  const sectionHeading = document.getElementById("rooms-section-heading");
  const countLabel = document.getElementById("rooms-count-label");

  let dormsCache = [];
  let cottagesCache = [];
  let kubotelsCache = [];
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

  // Check mandatory parent background profile status & student gender
  let profileStatus = null;
  let currentSession = null;
  try {
    currentSession = await Auth.getSession();
    if (currentSession && currentSession.profileStatus) {
      profileStatus = currentSession.profileStatus;
    } else {
      const pData = await DataAPI.getProfile();
      profileStatus = pData.profileStatus || null;
    }
  } catch (e) {
    profileStatus = null;
  }

  const mandatoryBanner = document.getElementById("mandatory-profile-banner");
  if (mandatoryBanner && profileStatus && !profileStatus.parentComplete) {
    mandatoryBanner.classList.remove("d-none");
  }

  function renderGalleryCarousel(images, carouselId, defaultImg) {
    const list = (Array.isArray(images) && images.length) ? images : (defaultImg ? [defaultImg] : []);
    if (list.length > 1) {
      return `
        <div id="${carouselId}" class="carousel slide rounded shadow-sm overflow-hidden mb-3" data-bs-ride="carousel">
          <div class="carousel-indicators">
            ${list.map((_, idx) => `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}"></button>`).join('')}
          </div>
          <div class="carousel-inner" style="height: 280px; background: #000;">
            ${list.map((img, idx) => `
              <div class="carousel-item h-100 ${idx === 0 ? 'active' : ''}">
                <img src="${resolveAsset(img)}" class="d-block w-100 h-100" style="object-fit: cover;" alt="Photo ${idx + 1}">
              </div>`).join('')}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>`;
    }
    return `<img src="${resolveAsset(list[0] || defaultImg)}" class="w-100 rounded mb-3 shadow-sm" style="max-height: 280px; object-fit: cover;">`;
  }

  function setType(type) {
    currentType = type;
    selectedOwnerFilter = "";
    if (tabDorm) tabDorm.classList.toggle("active", type === "dorm");
    if (tabCottage) tabCottage.classList.toggle("active", type === "cottage");
    if (tabKubotel) tabKubotel.classList.toggle("active", type === "kubotel");

    const dormGenderCol = document.getElementById("dorm-gender-col");
    if (dormGenderCol) dormGenderCol.style.display = type === "dorm" ? "" : "none";

    if (searchInput) {
      searchInput.placeholder = type === "dorm"
        ? "Search dormitory name..."
        : (type === "cottage" ? "Search cottage name or owner..." : "Search Kubotel unit or host...");
    }

    if (ownersSection) {
      ownersSection.classList.toggle("d-none", type === "dorm");
    }

    if (sectionHeading) {
      sectionHeading.textContent = type === "dorm"
        ? "Dormitory Rooms"
        : (type === "cottage" ? "Cottage Unit & Room Details" : "Kubotel Units (KUBO-HOTEL)");
    }
    render();
  }

  if (tabDorm) tabDorm.addEventListener("click", () => setType("dorm"));
  if (tabCottage) tabCottage.addEventListener("click", () => setType("cottage"));
  if (tabKubotel) tabKubotel.addEventListener("click", () => setType("kubotel"));

  ["filter-status", "filter-gender", "filter-search"].forEach((id) => {
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
    else if (currentType === "cottage") await renderCottages();
    else await renderKubotels();
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
    const gender = document.getElementById("filter-gender")?.value || "";
    const search = document.getElementById("filter-search")?.value.trim() || "";

    const data = await DataAPI.getDorms({ status, gender, search });
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
        <th>Owner / Host</th>
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
    renderPropertyHosts(cottagesCache, "Cottage");

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

  async function renderKubotels() {
    thead.innerHTML = `
      <tr>
        <th>Image</th>
        <th>Kubotel Unit Name</th>
        <th>Owner / Host</th>
        <th>Rooms</th>
        <th>Price (₱ / day)</th>
        <th>Availability</th>
        <th class="text-end">Actions</th>
      </tr>`;

    const status = document.getElementById("filter-status")?.value || "";
    const search = document.getElementById("filter-search")?.value.trim() || "";
    const availability = status === "Occupied" ? "Booked" : (status === "Available" ? "Available" : "");

    const data = await DataAPI.getKubotels({ availability, search });
    kubotelsCache = data.kubotels || [];

    // Render Hosts with Profiles first
    renderPropertyHosts(kubotelsCache, "Kubotel");

    let filteredKubotels = kubotelsCache;
    if (selectedOwnerFilter) {
      filteredKubotels = kubotelsCache.filter((k) => (k.owner || "CSU Auxiliary Services") === selectedOwnerFilter);
    }

    if (countLabel) countLabel.textContent = `${filteredKubotels.length} Kubotel unit(s) shown`;

    tbody.innerHTML = filteredKubotels.length
      ? filteredKubotels.map((k) => kubotelRow(k)).join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-hotel"></i>No Kubotel units match your filters.</div></td></tr>`;

    tbody.querySelectorAll("[data-reserve-kubotel]").forEach((btn) => {
      btn.addEventListener("click", () => goReserve("kubotel", btn.dataset.reserveKubotel));
    });
    tbody.querySelectorAll("[data-view-kubotel]").forEach((btn) => {
      btn.addEventListener("click", () => viewKubotel(btn.dataset.viewKubotel));
    });
  }

  function renderPropertyHosts(units, categoryLabel) {
    if (!ownersSection) return;

    // Aggregate units by owner
    const ownersMap = new Map();
    units.forEach((u) => {
      const ownerName = u.owner || "CSU Auxiliary Services";
      if (!ownersMap.has(ownerName)) {
        ownersMap.set(ownerName, {
          name: ownerName,
          photo: u.ownerPhoto || "",
          phone: u.ownerPhone || "",
          email: u.ownerEmail || "",
          bio: u.ownerBio || "",
          units: [],
          totalRooms: 0,
          minPrice: u.price || 0,
          maxPrice: u.price || 0,
          availableCount: 0,
        });
      }
      const item = ownersMap.get(ownerName);
      if (!item.photo && u.ownerPhoto) item.photo = u.ownerPhoto;
      if (!item.phone && u.ownerPhone) item.phone = u.ownerPhone;
      if (!item.email && u.ownerEmail) item.email = u.ownerEmail;
      if (!item.bio && u.ownerBio) item.bio = u.ownerBio;
      item.units.push(u);
      item.totalRooms += Number(u.rooms || 1);
      if (u.price < item.minPrice) item.minPrice = u.price;
      if (u.price > item.maxPrice) item.maxPrice = u.price;
      if (u.availability === "Available") item.availableCount++;
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
            <h6 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-id-badge text-primary me-2"></i>${categoryLabel} Owners &amp; Property Managers</h6>
            <div class="text-muted small">Select a host profile below to view their units, or browse all units below.</div>
          </div>
          ${selectedOwnerFilter ? `<button class="btn btn-sm btn-outline-secondary" id="clear-owner-filter-btn"><i class="fa-solid fa-xmark me-1"></i>Show All Hosts</button>` : ""}
        </div>
        <div class="row g-3">
          ${ownersList.map((o) => {
            const isSelected = selectedOwnerFilter === o.name;
            const initials = o.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
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
                    <div><i class="fa-solid fa-house-chimney me-1 text-primary"></i>${o.units.length} unit(s) · ${o.totalRooms} room(s)</div>
                    <div><i class="fa-solid fa-tags me-1 text-primary"></i>₱${Number(o.minPrice).toLocaleString()} - ₱${Number(o.maxPrice).toLocaleString()}/rate</div>
                  </div>
                  <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                    <span class="badge ${o.availableCount > 0 ? "bg-success" : "bg-secondary"}">${o.availableCount > 0 ? `${o.availableCount} Available` : "Fully Booked"}</span>
                    <span class="text-primary small fw-semibold">${isSelected ? "Viewing Units <i class=\"fa-solid fa-chevron-down ms-1\"></i>" : "View Units <i class=\"fa-solid fa-arrow-right ms-1\"></i>"}</span>
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
        if (currentType === "cottage") renderCottages();
        else renderKubotels();
      });
    });

    const clearBtn = document.getElementById("clear-owner-filter-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        selectedOwnerFilter = "";
        if (currentType === "cottage") renderCottages();
        else renderKubotels();
      });
    }
  }

  function dormRow(d) {
    const isParentIncomplete = profileStatus && !profileStatus.parentComplete;
    const studentGender = currentSession?.gender || "";
    const dormGender = d.gender || "Male";
    const isMixed = dormGender === "Mixed";
    const isGenderMismatch = Boolean(!isMixed && studentGender && dormGender && studentGender.toLowerCase() !== dormGender.toLowerCase());
    const isNotAvailable = d.status === "Not Available";
    const isLocked = d.reservedByMe || d.status !== "Available" || hasApprovedReservation || isGenderMismatch;
    const disabled = isLocked ? "disabled" : "";
    const badgeLabel = d.reservedByMe ? "Room/Unit Reserved" : d.status;
    const isFemale = dormGender === "Female";
    const badgeClassStyle = isFemale ? 'bg-danger-subtle text-danger border border-danger-subtle' : (isMixed ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle');
    const badgeIcon = isFemale ? 'venus' : (isMixed ? 'venus-mars' : 'mars');
    const badgeLabelText = isMixed ? 'Mixed Gender (Male & Female)' : `${escapeHtml(dormGender)} Boarders Only`;
    const btnLabel = hasApprovedReservation ? "Booking Locked" : (isNotAvailable ? "Not Available" : (d.reservedByMe ? "Reserved" : (isGenderMismatch ? `${escapeHtml(dormGender)} Only` : (isParentIncomplete ? "Profile Incomplete" : "Reserve"))));
    const btnTitle = hasApprovedReservation ? "You already have an active approved reservation" : (isNotAvailable ? "This dormitory is currently not available for reservation" : (isGenderMismatch ? `This dormitory strictly accepts ${dormGender} boarders only` : (isParentIncomplete ? "You must complete Parent / Guardian details first" : "")));
    const photoCount = (d.images && d.images.length) ? d.images.length : 1;

    return `
      <tr>
        <td>
          <div class="position-relative d-inline-block">
            <img src="${resolveAsset(d.image || (d.images && d.images[0]))}" class="rounded" style="width:64px;height:44px;object-fit:cover;">
            ${photoCount > 1 ? `<span class="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 start-0 small" style="font-size:0.6rem;padding:1px 3px;"><i class="fa-solid fa-images"></i> ${photoCount}</span>` : ""}
          </div>
        </td>
        <td>
          <div class="fw-bold">${escapeHtml(d.roomNumber)}</div>
          <span class="badge ${badgeClassStyle} small mt-1">
            <i class="fa-solid fa-${badgeIcon} me-1"></i>${badgeLabelText}
          </span>
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
    const isParentIncomplete = profileStatus && !profileStatus.parentComplete;
    const isNotAvailable = c.availability === "Not Available";
    const isLocked = c.reservedByMe || c.availability !== "Available" || hasApprovedReservation;
    const disabled = isLocked ? "disabled" : "";
    const badgeLabel = c.reservedByMe ? "Room/Unit Reserved" : c.availability;
    const btnLabel = hasApprovedReservation ? "Booking Locked" : (isNotAvailable ? "Not Available" : (c.reservedByMe ? "Reserved" : (isParentIncomplete ? "Profile Incomplete" : "Reserve")));
    const btnTitle = hasApprovedReservation ? "You already have an active approved reservation" : (isNotAvailable ? "This cottage is currently not available for reservation" : (isParentIncomplete ? "You must complete Parent / Guardian details first" : ""));
    const photoCount = (c.images && c.images.length) ? c.images.length : 1;
    return `
      <tr>
        <td>
          <div class="position-relative d-inline-block">
            <img src="${resolveAsset(c.image || (c.images && c.images[0]))}" class="rounded" style="width:64px;height:44px;object-fit:cover;">
            ${photoCount > 1 ? `<span class="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 start-0 small" style="font-size:0.6rem;padding:1px 3px;"><i class="fa-solid fa-images"></i> ${photoCount}</span>` : ""}
          </div>
        </td>
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

  function kubotelRow(k) {
    const isParentIncomplete = profileStatus && !profileStatus.parentComplete;
    const isNotAvailable = k.availability === "Not Available";
    const isLocked = k.reservedByMe || k.availability !== "Available" || hasApprovedReservation;
    const disabled = isLocked ? "disabled" : "";
    const badgeLabel = k.reservedByMe ? "Room/Unit Reserved" : k.availability;
    const btnLabel = hasApprovedReservation ? "Booking Locked" : (isNotAvailable ? "Not Available" : (k.reservedByMe ? "Reserved" : (isParentIncomplete ? "Profile Incomplete" : "Reserve")));
    const btnTitle = hasApprovedReservation ? "You already have an active approved reservation" : (isNotAvailable ? "This Kubotel unit is currently not available for reservation" : (isParentIncomplete ? "You must complete Parent / Guardian details first" : ""));
    const photoCount = (k.images && k.images.length) ? k.images.length : 1;
    return `
      <tr>
        <td>
          <div class="position-relative d-inline-block">
            <img src="${resolveAsset(k.image || (k.images && k.images[0]))}" class="rounded" style="width:64px;height:44px;object-fit:cover;">
            ${photoCount > 1 ? `<span class="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 start-0 small" style="font-size:0.6rem;padding:1px 3px;"><i class="fa-solid fa-images"></i> ${photoCount}</span>` : ""}
          </div>
        </td>
        <td class="fw-bold">${escapeHtml(k.name)}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${k.ownerPhoto ? `<img src="${resolveAsset(k.ownerPhoto)}" class="rounded-circle border" style="width:26px;height:26px;object-fit:cover;">` : `<i class="fa-solid fa-circle-user text-muted fs-5"></i>`}
            <span class="badge bg-light text-dark border">${escapeHtml(k.owner || "CSU Auxiliary")}</span>
          </div>
        </td>
        <td>${k.rooms} room(s)</td>
        <td>₱${Number(k.price || 0).toLocaleString()} <span class="text-muted small">/day</span></td>
        <td><span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-secondary me-1" data-view-kubotel="${k.id}"><i class="fa-solid fa-eye me-1"></i>View</button>
          <button class="btn btn-sm btn-primary" data-reserve-kubotel="${k.id}" ${disabled} title="${btnTitle}"><i class="fa-solid fa-calendar-check me-1"></i>${btnLabel}</button>
        </td>
      </tr>`;
  }

  function goReserve(type, id) {
    if (hasApprovedReservation) {
      showToast("You already have an active approved reservation.", "error");
      return;
    }
    if (type === "dorm") {
      const d = dormsCache.find((x) => String(x.id) === String(id));
      if (d && d.status === "Not Available") {
        showToast("This dormitory is currently not available for reservation.", "warning");
        return;
      }
      const studentGender = currentSession?.gender || "";
      const dormGender = d?.gender || "Male";
      if (dormGender !== "Mixed" && studentGender && dormGender && studentGender.toLowerCase() !== dormGender.toLowerCase()) {
        showToast(`Cannot Reserve: This dormitory strictly accepts ${dormGender} boarders only.`, "error");
        return;
      }
    }
    if (profileStatus && !profileStatus.parentComplete) {
      showToast("Action Required: Please complete your Parent / Guardian details in your profile first.", "warning");
      setTimeout(() => {
        window.location.href = "profile.html?required=1";
      }, 900);
      return;
    }
    window.location.href = `reserve.html?type=${type}&id=${id}`;
  }

  function viewDorm(id) {
    const d = dormsCache.find((x) => String(x.id) === String(id));
    if (!d) return;
    const badgeLabel = d.reservedByMe ? "Room/Unit Reserved" : d.status;
    const studentGender = currentSession?.gender || "";
    const dormGender = d.gender || "Male";
    const isFemale = dormGender === "Female";
    const isMixed = dormGender === "Mixed";
    const isGenderMismatch = Boolean(!isMixed && studentGender && dormGender && studentGender.toLowerCase() !== dormGender.toLowerCase());
    const isNotAvailable = d.status === "Not Available";
    const isParentIncomplete = profileStatus && !profileStatus.parentComplete;

    let mismatchAlert = "";
    if (isGenderMismatch) {
      mismatchAlert = `
        <div class="alert alert-warning py-2 mb-3">
          <i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>
          <strong>Gender Restriction:</strong> This dormitory strictly accepts <strong>${escapeHtml(dormGender)} boarders only</strong>. Your registered profile gender is <strong>${escapeHtml(studentGender)}</strong>.
        </div>`;
    }

    const badgeClassStyle = isFemale ? 'bg-danger-subtle text-danger border border-danger-subtle' : (isMixed ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle');
    const badgeIcon = isFemale ? 'venus' : (isMixed ? 'venus-mars' : 'mars');
    const badgeLabelText = isMixed ? 'Mixed Gender (Male & Female)' : `${escapeHtml(dormGender)} Boarders Only`;

    document.getElementById("room-detail-body").innerHTML = `
      ${renderGalleryCarousel(d.images, `dorm-detail-carousel-${d.id}`, d.image)}
      <h5 class="fw-bold">${escapeHtml(d.roomNumber)} <span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></h5>
      <p class="text-muted mb-2">
        <span class="badge ${badgeClassStyle} me-2">
          <i class="fa-solid fa-${badgeIcon} me-1"></i>${badgeLabelText}
        </span>
        <i class="fa-solid fa-users me-1"></i>Capacity: ${d.capacity} pax
      </p>
      ${mismatchAlert}
      <p>${escapeHtml(d.description)}</p>
      <h5 class="text-primary fw-bold">₱${Number(d.price || 0).toLocaleString()} / month</h5>`;

    const reserveBtn = document.getElementById("room-detail-reserve-btn");
    reserveBtn.disabled = d.reservedByMe || d.status !== "Available" || hasApprovedReservation || isGenderMismatch;
    reserveBtn.textContent = hasApprovedReservation ? "Booking Locked" : (isNotAvailable ? "Not Available" : (d.reservedByMe ? "Room/Unit Reserved" : (isGenderMismatch ? `${escapeHtml(dormGender)} Boarders Only` : (isParentIncomplete ? "Complete Profile to Reserve" : "Reserve Now"))));
    reserveBtn.onclick = () => goReserve("dorm", d.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  function viewCottage(id) {
    const c = cottagesCache.find((x) => String(x.id) === String(id));
    if (!c) return;
    const badgeLabel = c.reservedByMe ? "Room/Unit Reserved" : c.availability;
    const isNotAvailable = c.availability === "Not Available";
    const ownerName = c.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

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
      ${renderGalleryCarousel(c.images, `cottage-detail-carousel-${c.id}`, c.image)}
      <h5 class="fw-bold">${escapeHtml(c.name)} <span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-bed me-1"></i>${c.rooms} rooms total · <i class="fa-solid fa-tag me-1"></i>Daily Rate Accommodation</p>
      <p>${escapeHtml(c.description)}</p>
      <h5 class="text-primary fw-bold">₱${Number(c.price || 0).toLocaleString()} / rate</h5>`;
    const isParentIncompleteCottage = profileStatus && !profileStatus.parentComplete;
    const reserveCottageBtn = document.getElementById("room-detail-reserve-btn");
    reserveCottageBtn.disabled = c.reservedByMe || c.availability !== "Available" || hasApprovedReservation;
    reserveCottageBtn.textContent = hasApprovedReservation ? "Booking Locked" : (isNotAvailable ? "Not Available" : (c.reservedByMe ? "Room/Unit Reserved" : (isParentIncompleteCottage ? "Complete Profile to Reserve" : "Reserve Cottage")));
    reserveCottageBtn.onclick = () => goReserve("cottage", c.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  function viewKubotel(id) {
    const k = kubotelsCache.find((x) => String(x.id) === String(id));
    if (!k) return;
    const badgeLabel = k.reservedByMe ? "Room/Unit Reserved" : k.availability;
    const isNotAvailable = k.availability === "Not Available";
    const ownerName = k.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    document.getElementById("room-detail-body").innerHTML = `
      <!-- Host Profile Section -->
      <div class="card border p-3 mb-3 bg-light shadow-sm">
        <div class="d-flex align-items-start gap-3">
          ${k.ownerPhoto
            ? `<img src="${resolveAsset(k.ownerPhoto)}" class="rounded-circle border shadow-sm flex-shrink-0" style="width:58px;height:58px;object-fit:cover;">`
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
              ${k.ownerPhone ? `<span class="me-3"><i class="fa-solid fa-phone me-1 text-primary"></i>${escapeHtml(k.ownerPhone)}</span>` : ""}
              ${k.ownerEmail ? `<span><i class="fa-solid fa-envelope me-1 text-primary"></i>${escapeHtml(k.ownerEmail)}</span>` : ""}
            </div>
            ${k.ownerBio ? `<div class="small text-secondary mt-2 fst-italic">"${escapeHtml(k.ownerBio)}"</div>` : `<div class="text-muted small mt-1">CSU-Piat registered Kubotel facility manager.</div>`}
          </div>
        </div>
      </div>

      <!-- Kubotel Details -->
      ${renderGalleryCarousel(k.images, `kubotel-detail-carousel-${k.id}`, k.image)}
      <h5 class="fw-bold">${escapeHtml(k.name)} <span class="badge ${badgeClass(badgeLabel)}">${badgeLabel}</span></h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-bed me-1"></i>${k.rooms} room(s) · <i class="fa-solid fa-tag me-1"></i>Native Kubo-Hotel (₱ / day)</p>
      <p>${escapeHtml(k.description)}</p>
      <h5 class="text-primary fw-bold">₱${Number(k.price || 0).toLocaleString()} / day</h5>`;
    const isParentIncompleteKubotel = profileStatus && !profileStatus.parentComplete;
    const reserveKubotelBtn = document.getElementById("room-detail-reserve-btn");
    reserveKubotelBtn.disabled = k.reservedByMe || k.availability !== "Available" || hasApprovedReservation;
    reserveKubotelBtn.textContent = hasApprovedReservation ? "Booking Locked" : (isNotAvailable ? "Not Available" : (k.reservedByMe ? "Room/Unit Reserved" : (isParentIncompleteKubotel ? "Complete Profile to Reserve" : "Reserve Kubotel")));
    reserveKubotelBtn.onclick = () => goReserve("kubotel", k.id);
    new bootstrap.Modal(document.getElementById("room-detail-modal")).show();
  }

  setType(currentType);
});
