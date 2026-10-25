document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("cottages-table-body");
  const cottageModal = new bootstrap.Modal(document.getElementById("cottage-modal"));
  const cottageViewModal = new bootstrap.Modal(document.getElementById("cottage-view-modal"));
  let uploadedFiles = [null, null, null, null, null];
  let uploadedPhoto = null;
  let uploadedQrFile = null;
  let cottages = [];

  restrictToPhoneDigits(document.getElementById("cottage-owner-phone"), 11);

  const photoInputs = [
    { input: document.getElementById("cottage-image-input"), preview: document.getElementById("cottage-image-preview"), slot: 0 },
    { input: document.getElementById("cottage-image-1"), preview: document.getElementById("cottage-image-preview-1"), slot: 1 },
    { input: document.getElementById("cottage-image-2"), preview: document.getElementById("cottage-image-preview-2"), slot: 2 },
    { input: document.getElementById("cottage-image-3"), preview: document.getElementById("cottage-image-preview-3"), slot: 3 },
    { input: document.getElementById("cottage-image-4"), preview: document.getElementById("cottage-image-preview-4"), slot: 4 },
  ];

  photoInputs.forEach(({ input, preview, slot }) => {
    if (!input || !preview) return;
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      uploadedFiles[slot] = file;
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  });

  async function render() {
    const data = await DataAPI.getCottages();
    cottages = data.cottages || [];
    tbody.innerHTML = cottages.length
      ? cottages
          .map(
            (c) => `
      <tr>
        <td><img src="${resolveAsset(c.image || (c.images && c.images[0]))}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${c.ownerPhoto ? `<img src="${resolveAsset(c.ownerPhoto)}" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;">` : `<i class="fa-solid fa-circle-user text-muted fs-5"></i>`}
            <div>
              <span class="fw-semibold d-block">${escapeHtml(c.owner || "CSU Auxiliary")}</span>
              ${c.paymentQr ? `<span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="fa-solid fa-qrcode me-1"></i>QR Active</span>` : `<span class="badge bg-secondary-subtle text-muted border small">No QR</span>`}
              ${c.images && c.images.length > 1 ? `<span class="badge bg-light text-dark border small ms-1"><i class="fa-solid fa-images me-1"></i>${c.images.length} photos</span>` : ""}
            </div>
          </div>
        </td>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.rooms}</td>
        <td>₱${c.price.toLocaleString()}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-view="${c.id}" title="View Details"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary" data-edit="${c.id}" title="Edit Cottage"><i class="fa-solid fa-pen"></i></button>
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-house"></i>No cottages added yet.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewCottage(b.dataset.view)));
    tbody.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editCottage(b.dataset.edit)));
  }

  function resetForm() {
    document.getElementById("cottage-form").reset();
    document.getElementById("cottage-id").value = "";
    photoInputs.forEach(({ input, preview }) => {
      if (input) input.value = "";
      if (preview) {
        preview.src = "";
        preview.style.display = "none";
      }
    });
    document.getElementById("cottage-owner-photo-preview").style.display = "none";
    document.getElementById("cottage-qr-preview-container").style.display = "none";
    uploadedFiles = [null, null, null, null, null];
    uploadedPhoto = null;
    uploadedQrFile = null;
  }

  document.getElementById("add-cottage-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("cottage-modal-title").textContent = "Add Cottage";
    cottageModal.show();
  });

  document.getElementById("cottage-owner-photo-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("cottage-owner-photo-preview");
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("cottage-qr-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedQrFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("cottage-qr-preview");
      preview.src = reader.result;
      document.getElementById("cottage-qr-preview-container").style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function editCottage(id) {
    const c = cottages.find((x) => String(x.id) === String(id));
    if (!c) return;
    resetForm();
    document.getElementById("cottage-modal-title").textContent = "Edit Cottage";
    document.getElementById("cottage-id").value = c.id;
    document.getElementById("cottage-name").value = c.name;
    document.getElementById("cottage-owner").value = c.owner || "";
    document.getElementById("cottage-owner-phone").value = (c.ownerPhone || "").replace(/\D/g, "").slice(0, 11);
    document.getElementById("cottage-owner-email").value = c.ownerEmail || "";
    document.getElementById("cottage-owner-bio").value = c.ownerBio || "";
    document.getElementById("cottage-account-name").value = c.paymentAccountName || "";
    document.getElementById("cottage-account-number").value = c.paymentAccountNumber || "";
    document.getElementById("cottage-rooms").value = c.rooms;
    document.getElementById("cottage-price").value = c.price;
    document.getElementById("cottage-description").value = c.description;

    const images = (Array.isArray(c.images) && c.images.length) ? c.images : (c.image ? [c.image] : []);
    photoInputs.forEach(({ preview, slot }) => {
      if (images[slot]) {
        preview.src = resolveAsset(images[slot]);
        preview.style.display = "block";
      }
    });

    const photoPreview = document.getElementById("cottage-owner-photo-preview");
    if (c.ownerPhoto) {
      photoPreview.src = resolveAsset(c.ownerPhoto);
      photoPreview.style.display = "block";
    }

    const qrContainer = document.getElementById("cottage-qr-preview-container");
    const qrPreview = document.getElementById("cottage-qr-preview");
    if (c.paymentQr) {
      qrPreview.src = resolveAsset(c.paymentQr);
      qrContainer.style.display = "block";
    }

    cottageModal.show();
  }

  function viewCottage(id) {
    const c = cottages.find((x) => String(x.id) === String(id));
    if (!c) return;
    const ownerName = c.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    let qrHtml = "";
    if (c.paymentQr) {
      qrHtml = `
        <div class="card border p-3 mt-3 bg-light">
          <div class="row align-items-center g-3">
            <div class="col-auto">
              <img src="${resolveAsset(c.paymentQr)}" class="border rounded shadow-sm bg-white p-1" style="width:100px;height:100px;object-fit:contain;">
            </div>
            <div class="col">
              <h6 class="fw-bold text-primary mb-1"><i class="fa-solid fa-qrcode me-1"></i>Official Owner Payment QR Code</h6>
              <div class="small text-muted"><strong>Payee:</strong> ${escapeHtml(c.paymentAccountName || c.owner || "Owner")}</div>
              ${c.paymentAccountNumber ? `<div class="small text-muted"><strong>Account #:</strong> ${escapeHtml(c.paymentAccountNumber)}</div>` : ""}
              ${c.ownerPhone ? `<div class="small text-muted"><strong>Owner Phone:</strong> ${escapeHtml(c.ownerPhone)}</div>` : ""}
            </div>
          </div>
        </div>`;
    }

    const images = (Array.isArray(c.images) && c.images.length) ? c.images : (c.image ? [c.image] : []);
    let galleryHtml = "";
    if (images.length > 1) {
      const carouselId = `cottage-view-carousel-${c.id}`;
      galleryHtml = `
        <div id="${carouselId}" class="carousel slide mb-3 rounded overflow-hidden shadow-sm" data-bs-ride="carousel">
          <div class="carousel-indicators">
            ${images.map((_, idx) => `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}"></button>`).join('')}
          </div>
          <div class="carousel-inner" style="max-height:260px;background:#000;">
            ${images.map((img, idx) => `
              <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                <img src="${resolveAsset(img)}" class="d-block w-100" style="height:260px;object-fit:cover;">
              </div>`).join('')}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>`;
    } else if (images.length === 1) {
      galleryHtml = `<img src="${resolveAsset(images[0])}" class="w-100 rounded mb-3 shadow-sm" style="max-height:240px;object-fit:cover;">`;
    }

    document.getElementById("cottage-view-body").innerHTML = `
      <!-- Owner Profile Card -->
      <div class="card border p-3 mb-3 bg-light">
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

      ${galleryHtml}
      <h5 class="fw-bold mb-1">${escapeHtml(c.name)}</h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-bed me-1"></i>${c.rooms} rooms · <i class="fa-solid fa-tag me-1"></i>₱${Number(c.price || 0).toLocaleString()} / day · <span class="badge ${badgeClass(c.availability)}">${c.availability}</span></p>
      <p class="mb-0 text-secondary">${escapeHtml(c.description)}</p>
      ${qrHtml}`;
    cottageViewModal.show();
  }

  document.getElementById("cottage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("cottage-id").value;

    const phoneVal = document.getElementById("cottage-owner-phone").value.trim();
    if (phoneVal && !isValidPhone(phoneVal)) {
      showToast("Owner contact number must be an 11-digit mobile number starting with 09 (e.g. 09123456789).", "warning");
      document.getElementById("cottage-owner-phone").focus();
      return;
    }

    const formData = new FormData();
    if (id) formData.append("id", id);
    formData.append("name", document.getElementById("cottage-name").value.trim());
    formData.append("owner", document.getElementById("cottage-owner").value.trim());
    formData.append("ownerPhone", phoneVal);
    formData.append("ownerEmail", document.getElementById("cottage-owner-email").value.trim());
    formData.append("ownerBio", document.getElementById("cottage-owner-bio").value.trim());
    formData.append("paymentAccountName", document.getElementById("cottage-account-name").value.trim());
    formData.append("paymentAccountNumber", document.getElementById("cottage-account-number").value.trim());
    formData.append("rooms", document.getElementById("cottage-rooms").value);
    formData.append("price", document.getElementById("cottage-price").value);
    formData.append("description", document.getElementById("cottage-description").value.trim());

    for (let i = 0; i < 5; i++) {
      if (uploadedFiles[i]) {
        formData.append(i === 0 ? "image" : `image_${i}`, uploadedFiles[i]);
      }
    }
    if (uploadedPhoto) formData.append("ownerPhoto", uploadedPhoto);
    if (uploadedQrFile) formData.append("paymentQr", uploadedQrFile);

    withLoading(async () => {
      try {
        if (id) {
          await DataAPI.updateCottage(formData);
        } else {
          await DataAPI.createCottage(formData);
        }
        cottageModal.hide();
        await render();
        showToast(id ? "Cottage updated." : "Cottage added.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  render();
});
