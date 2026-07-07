document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("dorms-table-body");
  const dormModal = new bootstrap.Modal(document.getElementById("dorm-modal"));
  const dormViewModal = new bootstrap.Modal(document.getElementById("dorm-view-modal"));
  let uploadedImage = null;

  function render() {
    const dorms = DataAPI.getDorms();
    tbody.innerHTML = dorms.length
      ? dorms
          .map(
            (d) => `
      <tr>
        <td><img src="${d.image}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
        <td>${escapeHtml(d.roomNumber)}</td>
        <td>${d.gender}</td>
        <td>${d.capacity} pax</td>
        <td>₱${d.price.toLocaleString()}</td>
        <td><span class="badge ${badgeClass(d.status)}">${d.status}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-view="${d.id}"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary" data-edit="${d.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${d.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-door-closed"></i>No dormitories added yet.</div></td></tr>`;

    tbody.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => viewDorm(b.dataset.view)));
    tbody.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editDorm(b.dataset.edit)));
    tbody.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", () => deleteDorm(b.dataset.delete)));
  }

  function resetForm() {
    document.getElementById("dorm-form").reset();
    document.getElementById("dorm-id").value = "";
    document.getElementById("dorm-image-preview").style.display = "none";
    uploadedImage = null;
  }

  document.getElementById("add-dorm-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("dorm-modal-title").textContent = "Add Dormitory";
    dormModal.show();
  });

  document.getElementById("dorm-image-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
      const preview = document.getElementById("dorm-image-preview");
      preview.src = uploadedImage;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function editDorm(id) {
    const d = DataAPI.getDorms().find((x) => x.id === id);
    if (!d) return;
    resetForm();
    document.getElementById("dorm-modal-title").textContent = "Edit Dormitory";
    document.getElementById("dorm-id").value = d.id;
    document.getElementById("dorm-room-number").value = d.roomNumber;
    document.getElementById("dorm-gender").value = d.gender;
    document.getElementById("dorm-capacity").value = d.capacity;
    document.getElementById("dorm-price").value = d.price;
    document.getElementById("dorm-status").value = d.status;
    document.getElementById("dorm-description").value = d.description;
    uploadedImage = d.image;
    const preview = document.getElementById("dorm-image-preview");
    preview.src = d.image;
    preview.style.display = "block";
    dormModal.show();
  }

  function viewDorm(id) {
    const d = DataAPI.getDorms().find((x) => x.id === id);
    if (!d) return;
    document.getElementById("dorm-view-body").innerHTML = `
      <img src="${d.image}" class="w-100 rounded mb-3" style="max-height:220px;object-fit:cover;">
      <h5 class="fw-bold">Room ${escapeHtml(d.roomNumber)} <span class="badge ${badgeClass(d.status)}">${d.status}</span></h5>
      <p class="text-muted">${d.gender} · ${d.capacity} pax · ₱${d.price.toLocaleString()}/month</p>
      <p>${escapeHtml(d.description)}</p>`;
    dormViewModal.show();
  }

  async function deleteDorm(id) {
    const ok = await confirmDialog({ title: "Delete Dormitory", message: "Are you sure you want to delete this dormitory record?", confirmText: "Delete" });
    if (!ok) return;
    withLoading(() => {
      const dorms = DataAPI.getDorms().filter((x) => x.id !== id);
      DataAPI.saveDorms(dorms);
      render();
      showToast("Dormitory deleted.", "warning");
    });
  }

  document.getElementById("dorm-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("dorm-id").value;
    const dorms = DataAPI.getDorms();
    const payload = {
      roomNumber: document.getElementById("dorm-room-number").value.trim(),
      gender: document.getElementById("dorm-gender").value,
      capacity: parseInt(document.getElementById("dorm-capacity").value, 10),
      price: parseInt(document.getElementById("dorm-price").value, 10),
      status: document.getElementById("dorm-status").value,
      description: document.getElementById("dorm-description").value.trim(),
      image: uploadedImage || `https://placehold.co/400x260/2563eb/ffffff?text=Room`,
    };

    withLoading(() => {
      if (id) {
        const existing = dorms.find((x) => x.id === id);
        Object.assign(existing, payload);
      } else {
        dorms.push({ id: DB.nextId(dorms, "DR"), ...payload });
      }
      DataAPI.saveDorms(dorms);
      dormModal.hide();
      render();
      showToast(id ? "Dormitory updated." : "Dormitory added.", "success");
    });
  });

  render();
});
