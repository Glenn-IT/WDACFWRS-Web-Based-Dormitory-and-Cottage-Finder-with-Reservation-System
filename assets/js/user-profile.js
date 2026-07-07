document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
  if (!session) return;

  function render(user) {
    document.getElementById("profile-picture").src = resolveAsset(user.profilePic);
    document.getElementById("profile-full-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-id").textContent = user.id;

    document.getElementById("pf-first-name").value = user.firstName || "";
    document.getElementById("pf-last-name").value = user.lastName || "";
    document.getElementById("pf-course").value = user.course || "";
    document.getElementById("pf-year-level").value = user.yearLevel || "";
    document.getElementById("pf-semester").value = user.semester || "";
    document.getElementById("pf-nationality").value = user.nationality || "";
    document.getElementById("pf-birthday").value = user.birthday || "";
    document.getElementById("pf-phone").value = user.phone || "";
    document.getElementById("pf-address").value = user.address || "";
  }

  async function reload() {
    const data = await DataAPI.getProfile();
    render(data.user);
    return data.user;
  }

  await reload();

  const fieldset = document.getElementById("profile-fieldset");
  const saveActions = document.getElementById("profile-save-actions");
  const editBtn = document.getElementById("edit-profile-btn");

  editBtn.addEventListener("click", () => {
    fieldset.disabled = false;
    saveActions.classList.remove("d-none");
    editBtn.classList.add("d-none");
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", async () => {
    await reload();
    fieldset.disabled = true;
    saveActions.classList.add("d-none");
    editBtn.classList.remove("d-none");
  });

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const payload = {
      firstName: document.getElementById("pf-first-name").value.trim(),
      lastName: document.getElementById("pf-last-name").value.trim(),
      course: document.getElementById("pf-course").value.trim(),
      yearLevel: document.getElementById("pf-year-level").value.trim(),
      semester: document.getElementById("pf-semester").value.trim(),
      nationality: document.getElementById("pf-nationality").value.trim(),
      birthday: document.getElementById("pf-birthday").value,
      phone: document.getElementById("pf-phone").value.trim(),
      address: document.getElementById("pf-address").value.trim(),
    };

    withLoading(async () => {
      try {
        await DataAPI.updateProfile(payload);
        await reload();
        fieldset.disabled = true;
        saveActions.classList.add("d-none");
        editBtn.classList.remove("d-none");
        showToast("Profile updated successfully.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  document.getElementById("profile-picture-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    withLoading(async () => {
      try {
        const formData = new FormData();
        formData.append("image", file);
        await DataAPI.uploadProfilePicture(formData);
        await reload();
        showToast("Profile picture updated.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  document.getElementById("change-password-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("cp-error");
    errorEl.classList.add("d-none");

    const current = document.getElementById("cp-current").value;
    const next = document.getElementById("cp-new").value;
    const confirm = document.getElementById("cp-confirm").value;

    withLoading(async () => {
      try {
        await DataAPI.changePassword({ current, next, confirm });
        showToast("Password changed successfully.", "success");
        document.getElementById("change-password-form").reset();
        bootstrap.Modal.getInstance(document.getElementById("change-password-modal")).hide();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("d-none");
      }
    });
  });
});
