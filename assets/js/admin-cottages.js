document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("cottages-table-body");
  const cottageModal = new bootstrap.Modal(document.getElementById("cottage-modal"));
  const cottageViewModal = new bootstrap.Modal(document.getElementById("cottage-view-modal"));
  let uploadedImage = null;

  function render() {
    const cottages = DataAPI.getCottages();
    tbody.innerHTML = cottages.length
      ? cottages
          .map(
            (c) => `
      <tr>
        <td><img src="${c.image}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
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
    uploadedImage = null;
  }

  document.getElementById("add-cottage-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("cottage-modal-title").textContent = "Add Cottage";
    cottageModal.show();
  });

  document.getElementById("cottage-image-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
      const preview = document.getElementById("cottage-image-preview");
      preview.src = uploadedImage;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function editCottage(id) {
    const c = DataAPI.getCottages().find((x) => x.id === id);
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
    uploadedImage = c.image;
    const preview = document.getElementById("cottage-image-preview");
    preview.src = c.image;
    preview.style.display = "block";
    cottageModal.show();
  }

  function viewCottage(id) {
    const c = DataAPI.getCottages().find((x) => x.id === id);
    if (!c) return;
    document.getElementById("cottage-view-body").innerHTML = `
      <img src="${c.image}" class="w-100 rounded mb-3" style="max-height:220px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(c.name)} <span class="badge ${badgeClass(c.availability)}">${c.availability}</span></h5>
      <p class="text-muted">Owner: ${escapeHtml(c.owner)} · ${c.rooms} rooms · ₱${c.price.toLocaleString()}/day</p>
      <p>${escapeHtml(c.description)}</p>`;
    cottageViewModal.show();
  }

  async function deleteCottage(id) {
    const ok = await confirmDialog({ title: "Delete Cottage", message: "Are you sure you want to delete this cottage record?", confirmText: "Delete" });
    if (!ok) return;
    withLoading(() => {
      const cottages = DataAPI.getCottages().filter((x) => x.id !== id);
      DataAPI.saveCottages(cottages);
      render();
      showToast("Cottage deleted.", "warning");
    });
  }

  document.getElementById("cottage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("cottage-id").value;
    const cottages = DataAPI.getCottages();
    const payload = {
      name: document.getElementById("cottage-name").value.trim(),
      owner: document.getElementById("cottage-owner").value.trim(),
      rooms: parseInt(document.getElementById("cottage-rooms").value, 10),
      price: parseInt(document.getElementById("cottage-price").value, 10),
      availability: document.getElementById("cottage-availability").value,
      description: document.getElementById("cottage-description").value.trim(),
      image: uploadedImage || `https://placehold.co/400x260/16a34a/ffffff?text=Cottage`,
    };

    withLoading(() => {
      if (id) {
        const existing = cottages.find((x) => x.id === id);
        Object.assign(existing, payload);
      } else {
        cottages.push({ id: DB.nextId(cottages, "CT"), ...payload });
      }
      DataAPI.saveCottages(cottages);
      cottageModal.hide();
      render();
      showToast(id ? "Cottage updated." : "Cottage added.", "success");
    });
  });

  render();
});
