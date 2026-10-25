document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("dorms-table-body");
  const dormModal = new bootstrap.Modal(document.getElementById("dorm-modal"));
  const dormViewModal = new bootstrap.Modal(document.getElementById("dorm-view-modal"));
  let uploadedFiles = [null, null, null, null, null];
  let uploadedQrFile = null;
  let dorms = [];

  if (typeof restrictToPhoneDigits === "function") {
    restrictToPhoneDigits(document.getElementById("dorm-owner-phone"), 11);
  }

  const photoInputs = [
    { input: document.getElementById("dorm-image-input"), preview: document.getElementById("dorm-image-preview"), slot: 0 },
    { input: document.getElementById("dorm-image-1"), preview: document.getElementById("dorm-image-preview-1"), slot: 1 },
    { input: document.getElementById("dorm-image-2"), preview: document.getElementById("dorm-image-preview-2"), slot: 2 },
    { input: document.getElementById("dorm-image-3"), preview: document.getElementById("dorm-image-preview-3"), slot: 3 },
    { input: document.getElementById("dorm-image-4"), preview: document.getElementById("dorm-image-preview-4"), slot: 4 },
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
    const data = await DataAPI.getDorms();
    dorms = data.dorms || [];
    tbody.innerHTML = dorms.length
      ? dorms
          .map(
            (d) => `
      <tr>
        <td><img src="${resolveAsset(d.image || (d.images && d.images[0]))}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td>
          <div class="fw-semibold">${escapeHtml(d.roomNumber)}</div>
          ${d.paymentQr ? `<span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="fa-solid fa-qrcode me-1"></i>QR Active</span>` : `<span class="badge bg-secondary-subtle text-muted border small">No QR</span>`}
          ${d.images && d.images.length > 1 ? `<span class="badge bg-light text-dark border small ms-1"><i class="fa-solid fa-images me-1"></i>${d.images.length} photos</span>` : ""}
        </td>
        <td>
          <span class="badge ${d.gender === 'Female' ? 'bg-danger-subtle text-danger border border-danger-subtle' : (d.gender === 'Mixed' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle')}">
            <i class="fa-solid fa-${d.gender === 'Female' ? 'venus' : (d.gender === 'Mixed' ? 'venus-mars' : 'mars')} me-1"></i>${d.gender === 'Mixed' ? 'Mixed Gender' : `${escapeHtml(d.gender || 'Male')} Only`}
          </span>
        </td>
        <td>${d.capacity} pax</td>
        <td>₱${Number(d.price || 0).toLocaleString()}</td>
        <td><span class="badge ${badgeClass(d.status)}">${d.status}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-view="${d.id}"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary" data-edit="${d.id}"><i class="fa-solid fa-pen"></i></button>
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-door-closed"></i>No dormitories added yet.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewDorm(b.dataset.view)));
    tbody.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editDorm(b.dataset.edit)));
  }

  function resetForm() {
    document.getElementById("dorm-form").reset();
    document.getElementById("dorm-id").value = "";
    document.getElementById("dorm-gender").value = "Male";
    document.getElementById("dorm-status").value = "Available";
    photoInputs.forEach(({ input, preview }) => {
      if (input) input.value = "";
      if (preview) {
        preview.src = "";
        preview.style.display = "none";
      }
    });
    document.getElementById("dorm-qr-preview-container").style.display = "none";
    uploadedFiles = [null, null, null, null, null];
    uploadedQrFile = null;
  }

  document.getElementById("add-dorm-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("dorm-modal-title").textContent = "Add Dormitory";
    dormModal.show();
  });

  document.getElementById("dorm-qr-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedQrFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("dorm-qr-preview");
      preview.src = reader.result;
      document.getElementById("dorm-qr-preview-container").style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function editDorm(id) {
    const d = dorms.find((x) => String(x.id) === String(id));
    if (!d) return;
    resetForm();
    document.getElementById("dorm-modal-title").textContent = "Edit Dormitory";
    document.getElementById("dorm-id").value = d.id;
    document.getElementById("dorm-room-number").value = d.roomNumber;
    document.getElementById("dorm-gender").value = d.gender || "Male";
    document.getElementById("dorm-capacity").value = d.capacity;
    document.getElementById("dorm-price").value = d.price;
    document.getElementById("dorm-status").value = d.status;
    document.getElementById("dorm-description").value = d.description;

    document.getElementById("dorm-owner-name").value = d.ownerName || "";
    document.getElementById("dorm-owner-phone").value = (d.ownerPhone || "").replace(/\D/g, "").slice(0, 11);
    document.getElementById("dorm-account-name").value = d.paymentAccountName || "";
    document.getElementById("dorm-account-number").value = d.paymentAccountNumber || "";

    const images = (Array.isArray(d.images) && d.images.length) ? d.images : (d.image ? [d.image] : []);
    photoInputs.forEach(({ preview, slot }) => {
      if (images[slot]) {
        preview.src = resolveAsset(images[slot]);
        preview.style.display = "block";
      }
    });

    const qrContainer = document.getElementById("dorm-qr-preview-container");
    const qrPreview = document.getElementById("dorm-qr-preview");
    if (d.paymentQr) {
      qrPreview.src = resolveAsset(d.paymentQr);
      qrContainer.style.display = "block";
    }

    dormModal.show();
  }

  function viewDorm(id) {
    const d = dorms.find((x) => String(x.id) === String(id));
    if (!d) return;
    const isFemale = d.gender === "Female";
    const isMixed = d.gender === "Mixed";
    const genderBadgeClass = isFemale ? 'bg-danger-subtle text-danger border border-danger-subtle' : (isMixed ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle');
    const genderIcon = isFemale ? 'venus' : (isMixed ? 'venus-mars' : 'mars');
    const genderLabel = isMixed ? 'Mixed Gender (Male & Female)' : `${escapeHtml(d.gender || 'Male')} Boarders Only`;

    let qrHtml = "";
    if (d.paymentQr) {
      qrHtml = `
        <div class="card border p-3 mt-3 bg-light">
          <div class="row align-items-center g-3">
            <div class="col-auto">
              <img src="${resolveAsset(d.paymentQr)}" class="border rounded shadow-sm bg-white p-1" style="width:100px;height:100px;object-fit:contain;">
            </div>
            <div class="col">
              <h6 class="fw-bold text-primary mb-1"><i class="fa-solid fa-qrcode me-1"></i>Official Payment QR Code</h6>
              <div class="small text-muted"><strong>Payee:</strong> ${escapeHtml(d.paymentAccountName || d.ownerName || "CSU Auxiliary")}</div>
              ${d.paymentAccountNumber ? `<div class="small text-muted"><strong>Account #:</strong> ${escapeHtml(d.paymentAccountNumber)}</div>` : ""}
              ${d.ownerPhone ? `<div class="small text-muted"><strong>Owner Phone:</strong> ${escapeHtml(d.ownerPhone)}</div>` : ""}
            </div>
          </div>
        </div>`;
    } else {
      qrHtml = `
        <div class="alert alert-light border small mt-3 mb-0 text-muted">
          <i class="fa-solid fa-circle-info me-1"></i>No Online Payment QR Code uploaded yet for this dormitory.
        </div>`;
    }

    const images = (Array.isArray(d.images) && d.images.length) ? d.images : (d.image ? [d.image] : []);
    let galleryHtml = "";
    if (images.length > 1) {
      const carouselId = `dorm-view-carousel-${d.id}`;
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

    document.getElementById("dorm-view-body").innerHTML = `
      ${galleryHtml}
      <h5 class="fw-bold">${escapeHtml(d.roomNumber)} <span class="badge ${badgeClass(d.status)}">${d.status}</span></h5>
      <p class="text-muted mb-2">
        <span class="badge ${genderBadgeClass} me-2">
          <i class="fa-solid fa-${genderIcon} me-1"></i>${genderLabel}
        </span>
        Capacity: ${d.capacity} pax · ₱${Number(d.price || 0).toLocaleString()}/month
      </p>
      ${d.ownerName ? `<p class="small text-secondary mb-1"><strong>Owner / Landlord:</strong> ${escapeHtml(d.ownerName)} ${d.ownerPhone ? `(${escapeHtml(d.ownerPhone)})` : ""}</p>` : ""}
      <p>${escapeHtml(d.description)}</p>
      ${qrHtml}`;
    dormViewModal.show();
  }

  document.getElementById("dorm-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("dorm-id").value;

    const formData = new FormData();
    if (id) formData.append("id", id);
    formData.append("roomNumber", document.getElementById("dorm-room-number").value.trim());
    formData.append("gender", document.getElementById("dorm-gender").value);
    formData.append("capacity", document.getElementById("dorm-capacity").value);
    formData.append("price", document.getElementById("dorm-price").value);
    formData.append("status", document.getElementById("dorm-status").value);
    formData.append("description", document.getElementById("dorm-description").value.trim());

    formData.append("ownerName", document.getElementById("dorm-owner-name").value.trim());
    formData.append("ownerPhone", document.getElementById("dorm-owner-phone").value.trim());
    formData.append("paymentAccountName", document.getElementById("dorm-account-name").value.trim());
    formData.append("paymentAccountNumber", document.getElementById("dorm-account-number").value.trim());

    for (let i = 0; i < 5; i++) {
      if (uploadedFiles[i]) {
        formData.append(i === 0 ? "image" : `image_${i}`, uploadedFiles[i]);
      }
    }
    if (uploadedQrFile) formData.append("paymentQr", uploadedQrFile);

    withLoading(async () => {
      try {
        if (id) {
          await DataAPI.updateDorm(formData);
        } else {
          await DataAPI.createDorm(formData);
        }
        dormModal.hide();
        await render();
        showToast(id ? "Dormitory updated." : "Dormitory added.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  render();
});
