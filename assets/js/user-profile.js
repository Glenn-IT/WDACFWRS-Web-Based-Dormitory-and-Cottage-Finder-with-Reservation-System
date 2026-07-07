document.addEventListener("DOMContentLoaded", () => {
  const session = Auth.getSession();
  if (!session) return;

  function getUser() {
    return DataAPI.getUsers().find((u) => u.id === session.id);
  }

  function render() {
    const user = getUser();
    if (!user) return;
    document.getElementById("profile-picture").src = user.profilePic;
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

  render();

  const fieldset = document.getElementById("profile-fieldset");
  const saveActions = document.getElementById("profile-save-actions");
  const editBtn = document.getElementById("edit-profile-btn");

  editBtn.addEventListener("click", () => {
    fieldset.disabled = false;
    saveActions.classList.remove("d-none");
    editBtn.classList.add("d-none");
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    render();
    fieldset.disabled = true;
    saveActions.classList.add("d-none");
    editBtn.classList.remove("d-none");
  });

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const users = DataAPI.getUsers();
    const user = users.find((u) => u.id === session.id);
    if (!user) return;

    user.firstName = document.getElementById("pf-first-name").value.trim();
    user.lastName = document.getElementById("pf-last-name").value.trim();
    user.course = document.getElementById("pf-course").value.trim();
    user.yearLevel = document.getElementById("pf-year-level").value.trim();
    user.semester = document.getElementById("pf-semester").value.trim();
    user.nationality = document.getElementById("pf-nationality").value.trim();
    user.birthday = document.getElementById("pf-birthday").value;
    user.phone = document.getElementById("pf-phone").value.trim();
    user.address = document.getElementById("pf-address").value.trim();

    withLoading(() => {
      DataAPI.saveUsers(users);
      Auth.setSession({ ...session, name: `${user.firstName} ${user.lastName}` });
      render();
      fieldset.disabled = true;
      saveActions.classList.add("d-none");
      editBtn.classList.remove("d-none");
      showToast("Profile updated successfully.", "success");
    });
  });

  document.getElementById("profile-picture-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const users = DataAPI.getUsers();
      const user = users.find((u) => u.id === session.id);
      if (user) {
        user.profilePic = reader.result;
        DataAPI.saveUsers(users);
        render();
        showToast("Profile picture updated.", "success");
      }
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("change-password-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("cp-error");
    errorEl.classList.add("d-none");

    const current = document.getElementById("cp-current").value;
    const next = document.getElementById("cp-new").value;
    const confirm = document.getElementById("cp-confirm").value;

    const users = DataAPI.getUsers();
    const user = users.find((u) => u.id === session.id);

    if (!user || user.password !== current) {
      errorEl.textContent = "Current password is incorrect.";
      errorEl.classList.remove("d-none");
      return;
    }
    if (next !== confirm) {
      errorEl.textContent = "New passwords do not match.";
      errorEl.classList.remove("d-none");
      return;
    }

    user.password = next;
    DataAPI.saveUsers(users);
    showToast("Password changed successfully.", "success");
    document.getElementById("change-password-form").reset();
    bootstrap.Modal.getInstance(document.getElementById("change-password-modal")).hide();
  });
});
