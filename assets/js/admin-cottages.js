document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("cottages-table-body");
  const cottageModal = new bootstrap.Modal(document.getElementById("cottage-modal"));
  const cottageViewModal = new bootstrap.Modal(document.getElementById("cottage-view-modal"));
  let uploadedFile = null;
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
        <td>${escapeHtml(c.owner)}</td>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.rooms}</td>
        <td>₱${c.price.toLocaleString()}</td>
        <td><span class="badge ${badgeClass(c.availability)}">${c.availability}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-view="${c.id}"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary" data-edit="${c.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${c.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-house"></i>No cottages added yet.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewCottage(b.dataset.view)));
    tbody.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editCottage(b.dataset.edit)));
    tbody.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", () => deleteCottage(b.dataset.delete)));
  }

  function resetForm() {
    document.getElementById("cottage-form").reset();
    document.getElementById("cottage-id").value = "";
    document.getElementById("cottage-image-preview").style.display = "none";
    uploadedFile = null;
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

  function editCottage(id) {
    const c = cottages.find((x) => String(x.id) === String(id));
    if (!c) return;
    resetForm();
    document.getElementById("cottage-modal-title").textContent = "Edit Cottage";
    document.getElementById("cottage-id").value = c.id;
    document.getElementById("cottage-name").value = c.name;
    document.getElementById("cottage-owner").value = c.owner;
    document.getElementById("cottage-rooms").value = c.rooms;
    document.getElementById("cottage-price").value = c.price;
    document.getElementById("cottage-availability").value = c.availability;
    document.getElementById("cottage-description").value = c.description;
    const preview = document.getElementById("cottage-image-preview");
    preview.src = resolveAsset(c.image);
    preview.style.display = "block";
    cottageModal.show();
  }

  function viewCottage(id) {
    const c = cottages.find((x) => String(x.id) === String(id));
    if (!c) return;
    document.getElementById("cottage-view-body").innerHTML = `
      <img src="${resolveAsset(c.image)}" class="w-100 rounded mb-3" style="max-height:220px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(c.name)} <span class="badge ${badgeClass(c.availability)}">${c.availability}</span></h5>
      <p class="text-muted">Owner: ${escapeHtml(c.owner)} · ${c.rooms} rooms · ₱${c.price.toLocaleString()}/day</p>
      <p>${escapeHtml(c.description)}</p>`;
    cottageViewModal.show();
  }

  async function deleteCottage(id) {
    const ok = await confirmDialog({ title: "Delete Cottage", message: "Are you sure you want to delete this cottage record?", confirmText: "Delete" });
    if (!ok) return;
    await withLoading(async () => {
      try {
        await DataAPI.deleteCottage(id);
        await render();
        showToast("Cottage deleted.", "warning");
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  }

  document.getElementById("cottage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("cottage-id").value;

    const formData = new FormData();
    if (id) formData.append("id", id);
    formData.append("name", document.getElementById("cottage-name").value.trim());
    formData.append("owner", document.getElementById("cottage-owner").value.trim());
    formData.append("rooms", document.getElementById("cottage-rooms").value);
    formData.append("price", document.getElementById("cottage-price").value);
    formData.append("availability", document.getElementById("cottage-availability").value);
    formData.append("description", document.getElementById("cottage-description").value.trim());
    if (uploadedFile) formData.append("image", uploadedFile);

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
