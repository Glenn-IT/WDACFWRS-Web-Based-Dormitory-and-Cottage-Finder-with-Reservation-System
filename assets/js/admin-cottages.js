document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("cottages-table-body");
  const cottageModal = new bootstrap.Modal(document.getElementById("cottage-modal"));
  const cottageViewModal = new bootstrap.Modal(document.getElementById("cottage-view-modal"));
  let uploadedFile = null;
  let uploadedPhoto = null;
  let cottages = [];

  async function render() {
    const data = await DataAPI.getCottages();
    cottages = data.cottages || [];
    tbody.innerHTML = cottages.length
      ? cottages
          .map(
            (c) => `
      <tr>
        <td><img src="${resolveAsset(c.image)}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${c.ownerPhoto ? `<img src="${resolveAsset(c.ownerPhoto)}" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;">` : `<i class="fa-solid fa-circle-user text-muted fs-5"></i>`}
            <span class="fw-semibold">${escapeHtml(c.owner || "CSU Auxiliary")}</span>
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
    document.getElementById("cottage-image-preview").style.display = "none";
    document.getElementById("cottage-owner-photo-preview").style.display = "none";
    uploadedFile = null;
    uploadedPhoto = null;
  }

  document.getElementById("add-cottage-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("cottage-modal-title").textContent = "Add Cottage";
    cottageModal.show();
  });

  document.getElementById("cottage-image-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("cottage-image-preview");
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
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

  function editCottage(id) {
    const c = cottages.find((x) => String(x.id) === String(id));
    if (!c) return;
    resetForm();
    document.getElementById("cottage-modal-title").textContent = "Edit Cottage";
    document.getElementById("cottage-id").value = c.id;
    document.getElementById("cottage-name").value = c.name;
    document.getElementById("cottage-owner").value = c.owner || "";
    document.getElementById("cottage-owner-phone").value = c.ownerPhone || "";
    document.getElementById("cottage-owner-email").value = c.ownerEmail || "";
    document.getElementById("cottage-owner-bio").value = c.ownerBio || "";
    document.getElementById("cottage-rooms").value = c.rooms;
    document.getElementById("cottage-price").value = c.price;
    document.getElementById("cottage-description").value = c.description;

    const preview = document.getElementById("cottage-image-preview");
    if (c.image) {
      preview.src = resolveAsset(c.image);
      preview.style.display = "block";
    }

    const photoPreview = document.getElementById("cottage-owner-photo-preview");
    if (c.ownerPhoto) {
      photoPreview.src = resolveAsset(c.ownerPhoto);
      photoPreview.style.display = "block";
    }

    cottageModal.show();
  }

  function viewCottage(id) {
    const c = cottages.find((x) => String(x.id) === String(id));
    if (!c) return;
    const ownerName = c.owner || "CSU Auxiliary Services";
    const initials = ownerName.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

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

      <img src="${resolveAsset(c.image)}" class="w-100 rounded mb-3" style="max-height:240px;object-fit:cover;">
      <h5 class="fw-bold mb-1">${escapeHtml(c.name)}</h5>
      <p class="text-muted mb-2"><i class="fa-solid fa-bed me-1"></i>${c.rooms} rooms · <i class="fa-solid fa-tag me-1"></i>₱${Number(c.price || 0).toLocaleString()} / day · <span class="badge ${badgeClass(c.availability)}">${c.availability}</span></p>
      <p class="mb-0 text-secondary">${escapeHtml(c.description)}</p>`;
    cottageViewModal.show();
  }

  document.getElementById("cottage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("cottage-id").value;

    const phone = document.getElementById("cottage-owner-phone").value.trim();
    if (phone && !isValidPhone(phone)) {
      showToast("Please enter a valid PH mobile number (e.g. 09123456789).", "error");
      return;
    }

    const formData = new FormData();
    if (id) formData.append("id", id);
    formData.append("name", document.getElementById("cottage-name").value.trim());
    formData.append("owner", document.getElementById("cottage-owner").value.trim());
    formData.append("ownerPhone", phone);
    formData.append("ownerEmail", document.getElementById("cottage-owner-email").value.trim());
    formData.append("ownerBio", document.getElementById("cottage-owner-bio").value.trim());
    formData.append("rooms", document.getElementById("cottage-rooms").value);
    formData.append("price", document.getElementById("cottage-price").value);
    formData.append("description", document.getElementById("cottage-description").value.trim());
    if (uploadedFile) formData.append("image", uploadedFile);
    if (uploadedPhoto) formData.append("ownerPhoto", uploadedPhoto);

    withLoading(async () => {
      try {
        if (id) {
          await DataAPI.updateCottage(formData);
        } else {
          await DataAPI.createCottage(formData);
        }
        cottageModal.hide();
        await render();
        showToast(id ? "Cottage updated successfully." : "Cottage added successfully.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  render();
});
