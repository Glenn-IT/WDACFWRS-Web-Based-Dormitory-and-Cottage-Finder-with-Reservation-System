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
    document.getElementById("dorm-gender").value = d.gender || "Male";
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
    const isFemale = d.gender === "Female";
    const isMixed = d.gender === "Mixed";
    const genderBadgeClass = isFemale ? 'bg-danger-subtle text-danger border border-danger-subtle' : (isMixed ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle');
    const genderIcon = isFemale ? 'venus' : (isMixed ? 'venus-mars' : 'mars');
    const genderLabel = isMixed ? 'Mixed Gender (Male & Female)' : `${escapeHtml(d.gender || 'Male')} Boarders Only`;

    document.getElementById("dorm-view-body").innerHTML = `
      <img src="${resolveAsset(d.image)}" class="w-100 rounded mb-3" style="max-height:220px;object-fit:cover;">
      <h5 class="fw-bold">${escapeHtml(d.roomNumber)} <span class="badge ${badgeClass(d.status)}">${d.status}</span></h5>
      <p class="text-muted mb-2">
        <span class="badge ${genderBadgeClass} me-2">
          <i class="fa-solid fa-${genderIcon} me-1"></i>${genderLabel}
        </span>
        Capacity: ${d.capacity} pax · ₱${Number(d.price || 0).toLocaleString()}/month
      </p>
      <p>${escapeHtml(d.description)}</p>`;
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
