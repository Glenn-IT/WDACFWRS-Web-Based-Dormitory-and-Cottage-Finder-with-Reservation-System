document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
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

  async function render() {
    const data = await DataAPI.getAdminSettings();
    const admin = data.admin;
    document.getElementById("admin-name").value = admin.name;
    document.getElementById("admin-email").value = admin.email;
    document.getElementById("admin-role").value = admin.role;
    document.getElementById("admin-security-question").value = admin.securityQuestion;
  }
  render();

  document.getElementById("profile-settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("admin-name").value.trim(),
      email: document.getElementById("admin-email").value.trim(),
    };
    withLoading(async () => {
      try {
        await DataAPI.updateAdminProfile(payload);
        showToast("System profile updated.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  document.getElementById("security-settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      securityQuestion: document.getElementById("admin-security-question").value,
      securityAnswer: document.getElementById("admin-security-answer").value.trim(),
    };
    withLoading(async () => {
      try {
        await DataAPI.updateAdminSecurity(payload);
        document.getElementById("admin-security-answer").value = "";
        showToast("Security question updated.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  document.getElementById("password-settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("s-password-error");
    errorEl.classList.add("d-none");

    const current = document.getElementById("s-current-password").value;
    const next = document.getElementById("s-new-password").value;
    const confirm = document.getElementById("s-confirm-password").value;

    withLoading(async () => {
      try {
        await DataAPI.updateAdminPassword({ current, next, confirm });
        document.getElementById("password-settings-form").reset();
        showToast("Password updated successfully.", "success");
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("d-none");
      }
    });
  });
});
