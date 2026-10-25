/**
 * WDACFWRS - Reusable Interactive Map Location Pin Picker
 * Allows administrators to click/drag a pin to set location coordinates,
 * and allows rendering pinned unit maps for students and guests.
 */

const CSU_PIAT_COORDS = {
  lat: 17.792503,
  lng: 121.510505,
  address: "CSU-Piat, Baung, Piat, Cagayan (QGV6+26H)",
};

function initAdminMapPicker({
  containerId,
  latInputId,
  lngInputId,
  addressInputId,
  modalId,
  previewLinkId,
}) {
  const container = document.getElementById(containerId);
  const latInput = document.getElementById(latInputId);
  const lngInput = document.getElementById(lngInputId);
  const addressInput = document.getElementById(addressInputId);
  const previewLink = previewLinkId ? document.getElementById(previewLinkId) : null;
  const modalEl = modalId ? document.getElementById(modalId) : null;

  if (!container || !latInput || !lngInput) return null;

  let currentLat = parseFloat(latInput.value) || CSU_PIAT_COORDS.lat;
  let currentLng = parseFloat(lngInput.value) || CSU_PIAT_COORDS.lng;

  let map = null;
  let marker = null;

  function updateInputsAndLink(lat, lng) {
    const fixedLat = Number(lat).toFixed(6);
    const fixedLng = Number(lng).toFixed(6);
    latInput.value = fixedLat;
    lngInput.value = fixedLng;

    const badgeEl = container.parentElement.querySelector(".pin-coords-badge");
    if (badgeEl) {
      badgeEl.innerHTML = `<i class="fa-solid fa-location-dot text-danger me-1"></i>Pin: ${fixedLat}, ${fixedLng}`;
    }

    if (previewLink) {
      previewLink.href = `https://www.google.com/maps?q=${fixedLat},${fixedLng}`;
      previewLink.style.display = "inline-block";
    }
  }

  function initLeaflet() {
    if (typeof L === "undefined") {
      container.innerHTML = `
        <div class="alert alert-light border small text-muted p-2 mb-0">
          <i class="fa-solid fa-map-pin text-primary me-1"></i>Interactive Map Pinning available. Enter coordinates or click reset.
        </div>`;
      return;
    }

    if (!map) {
      map = L.map(containerId, {
        center: [currentLat, currentLng],
        zoom: 16,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom warm orange icon or default marker
      marker = L.marker([currentLat, currentLng], {
        draggable: true,
        title: "Drag to pin exact unit location",
      }).addTo(map);

      marker.bindPopup("<strong>Pinned Unit Location</strong><br>Drag me or click map to move").openPopup();

      marker.on("dragend", function (e) {
        const pos = e.target.getLatLng();
        updateInputsAndLink(pos.lat, pos.lng);
      });

      map.on("click", function (e) {
        marker.setLatLng(e.latlng);
        updateInputsAndLink(e.latlng.lat, e.latlng.lng);
        marker.openPopup();
      });
    } else {
      map.setView([currentLat, currentLng], 16);
      if (marker) marker.setLatLng([currentLat, currentLng]);
    }
  }

  if (modalEl) {
    modalEl.addEventListener("shown.bs.modal", () => {
      initLeaflet();
      if (map) {
        setTimeout(() => {
          map.invalidateSize();
          map.setView([currentLat, currentLng], 16);
        }, 150);
      }
    });
  } else {
    initLeaflet();
  }

  // Set position programmatically (e.g. when editing or resetting)
  function setPosition(lat, lng, address) {
    currentLat = parseFloat(lat) || CSU_PIAT_COORDS.lat;
    currentLng = parseFloat(lng) || CSU_PIAT_COORDS.lng;
    updateInputsAndLink(currentLat, currentLng);
    if (addressInput && address !== undefined) {
      addressInput.value = address || "";
    }
    if (map && marker) {
      marker.setLatLng([currentLat, currentLng]);
      map.setView([currentLat, currentLng], 16);
    }
  }

  // Reset button support
  const resetBtn = container.parentElement.querySelector(".reset-pin-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      setPosition(CSU_PIAT_COORDS.lat, CSU_PIAT_COORDS.lng, CSU_PIAT_COORDS.address);
    });
  }

  return {
    setPosition,
    getCoords: () => ({ lat: parseFloat(latInput.value), lng: parseFloat(lngInput.value) }),
  };
}

/**
 * Render a pinned unit map embed card with directions link for students and guests.
 */
function renderUnitMapCard({
  latitude,
  longitude,
  mapAddress,
  unitName,
  height = "220px",
}) {
  const lat = parseFloat(latitude) || CSU_PIAT_COORDS.lat;
  const lng = parseFloat(longitude) || CSU_PIAT_COORDS.lng;
  const addr = mapAddress || CSU_PIAT_COORDS.address;
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return `
    <div class="card border p-3 mt-3 shadow-sm bg-light">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
        <div>
          <h6 class="fw-bold text-primary mb-0">
            <i class="fa-solid fa-map-location-dot me-1"></i>Unit Pinned Location (CSU-Piat)
          </h6>
          <div class="small text-muted text-truncate" style="max-width:320px;" title="${escapeHtml(addr)}">
            ${escapeHtml(addr)}
          </div>
        </div>
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">
          <i class="fa-solid fa-diamond-turn-right me-1"></i>Directions
        </a>
      </div>
      <div class="rounded-3 overflow-hidden border shadow-sm" style="height:${height};background:#eee;">
        <iframe
          src="${embedUrl}"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Pinned Location for ${escapeHtml(unitName || 'Unit')}">
        </iframe>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-2 small text-muted">
        <span><i class="fa-solid fa-crosshairs text-primary me-1"></i>Coords: ${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
        <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none">
          <i class="fa-solid fa-arrow-up-right-from-square me-1"></i>Open Google Maps
        </a>
      </div>
    </div>`;
}
