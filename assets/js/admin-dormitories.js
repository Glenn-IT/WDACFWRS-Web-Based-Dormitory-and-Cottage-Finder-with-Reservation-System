document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("dorms-table-body");
  const dormModal = new bootstrap.Modal(document.getElementById("dorm-modal"));
  const dormViewModal = new bootstrap.Modal(document.getElementById("dorm-view-modal"));
  let uploadedFile = null;
  let dorms = [];

  async function render() {
    const data = await DataAPI.getDorms();
    dorms = data.dorms || [];
    tbody.innerHTML = dorms.length
      ? dorms
          .map(
            (d) => `
      <tr>
        <td><img src="${resolveAsset(d.image)}" class="rounded" style="width:64px;height:44px;object-fit:cover;"></td>
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
    uploadedFile = null;
  }

  document.getElementById("add-dorm-btn").addEventListener("click", () => {
    resetForm();
    document.getElementById("dorm-modal-title").textContent = "Add Dormitory";
    dormModal.show();
  });

  document.getElementById("dorm-image-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById("dorm-image-preview");
      preview.src = reader.result;
      preview.style.display = "block";
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
    document.getElementById("dorm-gender").value = d.gender;
    document.getElementById("dorm-capacity").value = d.capacity;
    document.getElementById("dorm-price").value = d.price;
    document.getElementById("dorm-status").value = d.status;
    document.getElementById("dorm-description").value = d.description;
    const preview = document.getElementById("dorm-image-preview");
    preview.src = resolveAsset(d.image);
    preview.style.display = "block";
    dormModal.show();
  }

  function viewDorm(id) {
    const d = dorms.find((x) => String(x.id) === String(id));
    if (!d) return;
    document.getElementById("dorm-view-body").innerHTML = `
      <img src="${resolveAsset(d.image)}" class="w-100 rounded mb-3" style="max-height:220px;object-fit:cover;">
      <h5 class="fw-bold">Room ${escapeHtml(d.roomNumber)} <span class="badge ${badgeClass(d.status)}">${d.status}</span></h5>
      <p class="text-muted">${d.gender} · ${d.capacity} pax · ₱${d.price.toLocaleString()}/month</p>
      <p>${escapeHtml(d.description)}</p>`;
    dormViewModal.show();
  }

  async function deleteDorm(id) {
    const ok = await confirmDialog({ title: "Delete Dormitory", message: "Are you sure you want to delete this dormitory record?", confirmText: "Delete" });
    if (!ok) return;
    await withLoading(async () => {
      try {
        await DataAPI.deleteDorm(id);
        await render();
        showToast("Dormitory deleted.", "warning");
      } catch (e) {
        showToast(e.message, "error");
      }
    });
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
    if (uploadedFile) formData.append("image", uploadedFile);

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
