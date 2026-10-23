document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("kubotels-table-body");
  const kubotelModal = new bootstrap.Modal(document.getElementById("kubotel-modal"));
  const kubotelViewModal = new bootstrap.Modal(document.getElementById("kubotel-view-modal"));
  let uploadedFile = null;
  let uploadedPhoto = null;
  let uploadedQrFile = null;
  let kubotels = [];

  restrictToPhoneDigits(document.getElementById("kubotel-owner-phone"), 11);

  async function render() {
    const data = await DataAPI.getKubotels();
    kubotels = data.kubotels || [];
    tbody.innerHTML = kubotels.length
      ? kubotels
          .map(
            (k) => `
      <tr>
        <td><img src="${resolveAsset(k.image)}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${k.ownerPhoto ? `<img src="${resolveAsset(k.ownerPhoto)}" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;">` : `<i class="fa-solid fa-circle-user text-muted fs-5"></i>`}
            <div>
              <span class="fw-semibold d-block">${escapeHtml(k.owner || "CSU Auxiliary")}</span>
              ${k.paymentQr ? `<span class="badge bg-success-subtle text-success border border-success-subtle small"><i class="fa-solid fa-qrcode me-1"></i>QR Active</span>` : `<span class="badge bg-secondary-subtle text-muted border small">No QR</span>`}
            </div>
          </div>
        </td>
        <td class="fw-bold">${escapeHtml(k.name)}</td>
        <td>${k.rooms} room(s)</td>
        <td>₱${Number(k.price || 0).toLocaleString()}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-view="${k.id}" title="View Details"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary" data-edit="${k.id}" title="Edit Kubotel"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${k.id}" title="Delete Kubotel"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-hotel"></i>No Kubotel units added yet.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewKubotel(b.dataset.view)));
    tbody.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editKubotel(b.dataset.edit)));
    tbody.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", () => deleteKubotel(b.dataset.delete)));
  }

  function resetForm() {
    document.getElementById("kubotel-form").reset();
    document.getElementById("kubotel-id").value = "";
    document.getElementById("kubotel-image-preview").style.display = "none";
    document.getElementById("kubotel-owner-photo-preview").style.display = "none";
    document.getElementById("kubotel-qr-preview-container").style.display = "none";
    uploadedFile = null;
    uploadedPhoto = null;
    uploadedQrFile = null;
  }

  document.getElementById("add-kubotel-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("kubotel-modal-title").textContent = "Add Kubotel";
    kubotelModal.show();
  });

  document.getElementById("kubotel-image-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("kubotel-image-preview");
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("kubotel-owner-photo-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("kubotel-owner-photo-preview");
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("kubotel-qr-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedQrFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("kubotel-qr-preview");
      preview.src = reader.result;
      document.getElementById("kubotel-qr-preview-container").style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function editKubotel(id) {
    const k = kubotels.find((x) => String(x.id) === String(id));
    if (!k) return;
    resetForm();
    document.getElementById("kubotel-modal-title").textContent = "Edit Kubotel";
    document.getElementById("kubotel-id").value = k.id;
    document.getElementById("kubotel-name").value = k.name;
    document.getElementById("kubotel-owner").value = k.owner || "";
    document.getElementById("kubotel-owner-phone").value = (k.ownerPhone || "").replace(/\D/g, "").slice(0, 11);
    document.getElementById("kubotel-owner-email").value = k.ownerEmail || "";
    document.getElementById("kubotel-owner-bio").value = k.ownerBio || "";
    document.getElementById("kubotel-account-name").value = k.paymentAccountName || "";
    document.getElementById("kubotel-account-number").value = k.paymentAccountNumber || "";
    document.getElementById("kubotel-rooms").value = k.rooms;
    document.getElementById("kubotel-price").value = k.price;
    document.getElementById("kubotel-description").value = k.description;

    const preview = document.getElementById("kubotel-image-preview");
    if (k.image) {
      preview.src = resolveAsset(k.image);
      preview.style.display = "block";
    }

    const photoPreview = document.getElementById("kubotel-owner-photo-preview");
    if (k.ownerPhoto) {
      photoPreview.src = resolveAsset(k.ownerPhoto);
      photoPreview.style.display = "block";
    }

    const qrContainer = document.getElementById("kubotel-qr-preview-container");
    const qrPreview = document.getElementById("kubotel-qr-preview");
    if (k.paymentQr) {
      qrPreview.src = resolveAsset(k.paymentQr);
      qrContainer.style.display = "block";
    }

    kubotelModal.show();
  }

  function viewKubotel(id) {
    const k = kubotels.find((x) => String(x.id) === String(id));
    if (!k) return;
    const ownerName = k.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    let qrHtml = "";
    if (k.paymentQr) {
      qrHtml = `
        <div class="card border p-3 mt-3 bg-light">
          <div class="row align-items-center g-3">
            <div class="col-auto">
              <img src="${resolveAsset(k.paymentQr)}" class="border rounded shadow-sm bg-white p-1" style="width:100px;height:100px;object-fit:contain;">
            </div>
            <div class="col">
              <h6 class="fw-bold text-primary mb-1"><i class="fa-solid fa-qrcode me-1"></i>Official Owner Payment QR Code</h6>
              <div class="small text-muted"><strong>Payee:</strong> ${escapeHtml(k.paymentAccountName || k.owner || "Owner")}</div>
              ${k.paymentAccountNumber ? `<div class="small text-muted"><strong>Account #:</strong> ${escapeHtml(k.paymentAccountNumber)}</div>` : ""}
              ${k.ownerPhone ? `<div class="small text-muted"><strong>Owner Phone:</strong> ${escapeHtml(k.ownerPhone)}</div>` : ""}
            </div>
          </div>
        </div>`;
    }

    document.getElementById("kubotel-view-body").innerHTML = `
      <!-- Owner Profile Card -->
      <div class="card border p-3 mb-3 bg-light">
        <div class="d-flex align-items-center gap-3">
          ${k.ownerPhoto
            ? `<img src="${resolveAsset(k.ownerPhoto)}" class="rounded-circle border shadow-sm flex-shrink-0" style="width:52px;height:52px;object-fit:cover;">`
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
              ${k.ownerPhone ? `<span class="me-3"><i class="fa-solid fa-phone me-1 text-primary"></i>${escapeHtml(k.ownerPhone)}</span>` : ""}
              ${k.ownerEmail ? `<span><i class="fa-solid fa-envelope me-1 text-primary"></i>${escapeHtml(k.ownerEmail)}</span>` : ""}
            </div>
            ${k.ownerBio ? `<div class="small text-secondary mt-1 fst-italic">"${escapeHtml(k.ownerBio)}"</div>` : ""}
          </div>
        </div>
      </div>

      <img src="${resolveAsset(k.image)}" class="w-100 rounded mb-3" style="max-height:240px;object-fit:cover;">
      <h5 class="fw-bold mb-1">${escapeHtml(k.name)}</h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-bed me-1"></i>${k.rooms} room(s) · <i class="fa-solid fa-tag me-1"></i>₱${Number(k.price || 0).toLocaleString()} / day · <span class="badge ${badgeClass(k.availability)}">${k.availability}</span></p>
      <p class="mb-0 text-secondary">${escapeHtml(k.description)}</p>
      ${qrHtml}`;
    kubotelViewModal.show();
  }

  async function deleteKubotel(id) {
    const k = kubotels.find((x) => String(x.id) === String(id));
    const name = k ? k.name : "this Kubotel unit";
    const ok = await confirmDialog({
      title: "Confirm Delete",
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmClass: "btn-danger",
    });
    if (!ok) return;

    withLoading(async () => {
      try {
        await DataAPI.deleteKubotel(id);
        await render();
        showToast("Kubotel unit deleted successfully.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  document.getElementById("kubotel-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("kubotel-id").value;

    const phone = document.getElementById("kubotel-owner-phone").value.trim();
    if (phone && !isValidPhone(phone)) {
      showToast("Please enter a valid 11-digit PH mobile number starting with 09 (e.g. 09123456789).", "error");
      return;
    }

    const formData = new FormData();
    if (id) formData.append("id", id);
    formData.append("name", document.getElementById("kubotel-name").value.trim());
    formData.append("owner", document.getElementById("kubotel-owner").value.trim());
    formData.append("ownerPhone", phone);
    formData.append("ownerEmail", document.getElementById("kubotel-owner-email").value.trim());
    formData.append("ownerBio", document.getElementById("kubotel-owner-bio").value.trim());
    formData.append("paymentAccountName", document.getElementById("kubotel-account-name").value.trim());
    formData.append("paymentAccountNumber", document.getElementById("kubotel-account-number").value.trim());
    formData.append("rooms", document.getElementById("kubotel-rooms").value);
    formData.append("price", document.getElementById("kubotel-price").value);
    formData.append("description", document.getElementById("kubotel-description").value.trim());
    if (uploadedFile) formData.append("image", uploadedFile);
    if (uploadedPhoto) formData.append("ownerPhoto", uploadedPhoto);
    if (uploadedQrFile) formData.append("paymentQr", uploadedQrFile);

    withLoading(async () => {
      try {
        if (id) {
          await DataAPI.updateKubotel(formData);
        } else {
          await DataAPI.createKubotel(formData);
        }
        kubotelModal.hide();
        await render();
        showToast(id ? "Kubotel unit updated successfully." : "Kubotel unit added successfully.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  render();
});
