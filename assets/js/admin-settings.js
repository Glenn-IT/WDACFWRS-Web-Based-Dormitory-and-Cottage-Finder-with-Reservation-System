document.addEventListener("DOMContentLoaded", () => {
  const session = Auth.getSession();
  if (!session) return;

  document.querySelectorAll("#settings-tabs .nav-link").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#settings-tabs .nav-link").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      ["profile", "security", "password"].forEach((name) => {
        document.getElementById(`tab-${name}`).classList.toggle("d-none", name !== tab.dataset.tab);
      });
    });
  });

  function getAdmin() {
    return DataAPI.getAdmins().find((a) => a.id === session.id);
  }

  function render() {
    const admin = getAdmin();
    if (!admin) return;
    document.getElementById("admin-name").value = admin.name;
    document.getElementById("admin-email").value = admin.email;
    document.getElementById("admin-role").value = admin.role;
    document.getElementById("admin-security-question").value = admin.securityQuestion;
    document.getElementById("admin-security-answer").value = admin.securityAnswer;
  }
  render();

  document.getElementById("profile-settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const admins = DataAPI.getAdmins();
    const admin = admins.find((a) => a.id === session.id);
    admin.name = document.getElementById("admin-name").value.trim();
    admin.email = document.getElementById("admin-email").value.trim();
    withLoading(() => {
      DataAPI.saveAdmins(admins);
      Auth.setSession({ ...session, name: admin.name, email: admin.email });
      showToast("System profile updated.", "success");
    });
  });

  document.getElementById("security-settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const admins = DataAPI.getAdmins();
    const admin = admins.find((a) => a.id === session.id);
    admin.securityQuestion = document.getElementById("admin-security-question").value;
    admin.securityAnswer = document.getElementById("admin-security-answer").value.trim();
    withLoading(() => {
      DataAPI.saveAdmins(admins);
      showToast("Security question updated.", "success");
    });
  });

  document.getElementById("password-settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("s-password-error");
    errorEl.classList.add("d-none");

    const current = document.getElementById("s-current-password").value;
    const next = document.getElementById("s-new-password").value;
    const confirm = document.getElementById("s-confirm-password").value;

    const admins = DataAPI.getAdmins();
    const admin = admins.find((a) => a.id === session.id);

    if (!admin || admin.password !== current) {
      errorEl.textContent = "Current password is incorrect.";
      errorEl.classList.remove("d-none");
      return;
    }
    if (next !== confirm) {
      errorEl.textContent = "New passwords do not match.";
      errorEl.classList.remove("d-none");
      return;
    }

    withLoading(() => {
      admin.password = next;
      DataAPI.saveAdmins(admins);
      document.getElementById("password-settings-form").reset();
      showToast("Password updated successfully.", "success");
    });
  });
});
