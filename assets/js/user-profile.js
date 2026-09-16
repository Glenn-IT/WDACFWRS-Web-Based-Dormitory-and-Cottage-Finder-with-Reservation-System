document.addEventListener("DOMContentLoaded", async () => {
  const session = await Auth.getSession();
  if (!session) return;

  wireTogglePassword("cp-toggle-current", "cp-current");
  wireTogglePassword("cp-toggle-new", "cp-new");
  wireTogglePassword("cp-toggle-confirm", "cp-confirm");

  // Tab switching
  const tabButtons = document.querySelectorAll("#profile-tabs button[data-tab]");
  const tabPanes = {
    personal: document.getElementById("tab-pane-personal"),
    parent: document.getElementById("tab-pane-parent"),
    background: document.getElementById("tab-pane-background"),
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      Object.keys(tabPanes).forEach((k) => {
        if (tabPanes[k]) tabPanes[k].classList.toggle("d-none", k !== target);
      });
    });
  });

  function render(data) {
    const user = data.user || {};
    const parent = data.parentInfo || {};
    const bg = data.background || {};

    document.getElementById("profile-picture").src = resolveAsset(user.profilePic);
    document.getElementById("profile-full-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-id").textContent = user.id;

    // Personal
    document.getElementById("pf-first-name").value = user.firstName || "";
    document.getElementById("pf-last-name").value = user.lastName || "";
    document.getElementById("pf-course").value = user.course || "";
    document.getElementById("pf-year-level").value = user.yearLevel || "";
    document.getElementById("pf-semester").value = user.semester || "";
    document.getElementById("pf-nationality").value = user.nationality || "";
    document.getElementById("pf-birthday").value = user.birthday || "";
    document.getElementById("pf-phone").value = user.phone || "";
    document.getElementById("pf-address").value = user.address || "";

    // Parent
    document.getElementById("p-father-name").value = parent.fatherName || "";
    document.getElementById("p-mother-name").value = parent.motherName || "";
    document.getElementById("p-occupation").value = parent.occupation || "";
    document.getElementById("p-education").value = parent.education || "";
    document.getElementById("p-address").value = parent.address || "";
    document.getElementById("p-phone").value = parent.phone || "";
    document.getElementById("p-emergency-contact").value = parent.emergencyContact || "";
    document.getElementById("p-relationship").value = parent.relationship || "";
    document.getElementById("p-emergency-number").value = parent.emergencyNumber || "";

    // Background
    document.getElementById("b-appliances").value = bg.appliances || "";
    document.getElementById("b-friends").value = bg.friendsAtDorm || "No";
    document.getElementById("b-friends-relationship").value = bg.friendsRelationship || "";
    document.getElementById("b-reason").value = bg.reason || "";
    document.getElementById("b-medical").value = bg.medicalConditions || "None";
    document.getElementById("b-illness").value = bg.severeIllness || "None";
    document.getElementById("b-hobbies").value = bg.hobbies || "";
    document.getElementById("b-smoking").value = bg.smoking || "No";
    document.getElementById("b-drinking").value = bg.drinking || "No";
    document.getElementById("b-organizations").value = bg.organizations || "";
    document.getElementById("b-leisure").value = bg.leisure || "";
  }

  async function reload() {
    const data = await DataAPI.getProfile();
    render(data);
    return data;
  }

  await reload();

  const fieldset = document.getElementById("profile-fieldset");
  const saveActions = document.getElementById("profile-save-actions");
  const editBtn = document.getElementById("edit-profile-btn");

  editBtn.addEventListener("click", () => {
    fieldset.disabled = false;
    document.getElementById("pf-first-name").readOnly = true;
    document.getElementById("pf-last-name").readOnly = true;
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

    const phone = document.getElementById("pf-phone").value.trim();
    if (phone && !isValidPhone(phone)) {
      showToast("Please enter a valid PH mobile number (e.g. 09123456789).", "error");
      return;
    }

    const pPhone = document.getElementById("p-phone").value.trim();
    if (pPhone && !isValidPhone(pPhone)) {
      showToast("Please enter a valid parent mobile number (e.g. 09123456789).", "error");
      return;
    }

    const pEmerg = document.getElementById("p-emergency-number").value.trim();
    if (pEmerg && !isValidPhone(pEmerg)) {
      showToast("Please enter a valid emergency mobile number (e.g. 09123456789).", "error");
      return;
    }

    const payload = {
      firstName: document.getElementById("pf-first-name").value.trim(),
      lastName: document.getElementById("pf-last-name").value.trim(),
      course: document.getElementById("pf-course").value.trim(),
      yearLevel: document.getElementById("pf-year-level").value.trim(),
      semester: document.getElementById("pf-semester").value.trim(),
      nationality: document.getElementById("pf-nationality").value.trim(),
      birthday: document.getElementById("pf-birthday").value,
      phone,
      address: document.getElementById("pf-address").value.trim(),
      parentInfo: {
        fatherName: document.getElementById("p-father-name").value.trim(),
        motherName: document.getElementById("p-mother-name").value.trim(),
        occupation: document.getElementById("p-occupation").value.trim(),
        education: document.getElementById("p-education").value.trim(),
        address: document.getElementById("p-address").value.trim(),
        phone: pPhone,
        emergencyContact: document.getElementById("p-emergency-contact").value.trim(),
        relationship: document.getElementById("p-relationship").value.trim(),
        emergencyNumber: pEmerg,
      },
      background: {
        appliances: document.getElementById("b-appliances").value.trim(),
        friendsAtDorm: document.getElementById("b-friends").value,
        friendsRelationship: document.getElementById("b-friends-relationship").value.trim(),
        reason: document.getElementById("b-reason").value.trim(),
        medicalConditions: document.getElementById("b-medical").value.trim(),
        severeIllness: document.getElementById("b-illness").value.trim(),
        hobbies: document.getElementById("b-hobbies").value.trim(),
        smoking: document.getElementById("b-smoking").value,
        drinking: document.getElementById("b-drinking").value,
        organizations: document.getElementById("b-organizations").value.trim(),
        leisure: document.getElementById("b-leisure").value.trim(),
      },
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

    if (!isValidPassword(next)) {
      errorEl.textContent = "Password must be at least 6 characters long and contain both letters and numbers.";
      errorEl.classList.remove("d-none");
      return;
    }
    if (next !== confirm) {
      errorEl.textContent = "New passwords do not match.";
      errorEl.classList.remove("d-none");
      return;
    }

    withLoading(async () => {
      try {
        await DataAPI.changePassword({ current, next, confirm });
        showToast("Password changed successfully.", "success");
        document.getElementById("change-password-form").reset();
        resetTogglePassword("cp-toggle-current", "cp-current");
        resetTogglePassword("cp-toggle-new", "cp-new");
        resetTogglePassword("cp-toggle-confirm", "cp-confirm");
        bootstrap.Modal.getInstance(document.getElementById("change-password-modal")).hide();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("d-none");
      }
    });
  });
});
