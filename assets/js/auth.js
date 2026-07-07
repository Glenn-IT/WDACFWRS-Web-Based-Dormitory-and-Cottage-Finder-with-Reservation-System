/* ============================================================
   Authentication client — talks to /api/auth/*.php.
   Session state now lives server-side (PHP $_SESSION); this
   module just wraps the relevant fetch calls.
   ============================================================ */

const Auth = {
  async getSession() {
    try {
      const data = await apiFetch("auth/session.php");
      return data.user || null;
    } catch (e) {
      return null;
    }
  },

  async loginStudent(email, password) {
    try {
      const data = await apiFetch("auth/login.php", {
        method: "POST",
        body: JSON.stringify({ role: "student", email, password }),
      });
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },

  async loginAdmin(email, password) {
    try {
      const data = await apiFetch("auth/login.php", {
        method: "POST",
        body: JSON.stringify({ role: "admin", email, password }),
      });
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },

  async register(payload) {
    try {
      const data = await apiFetch("auth/register.php", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },

  async findSecurityQuestion(email, role) {
    try {
      const data = await apiFetch("auth/forgot_lookup.php", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      return { ok: true, question: data.question };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },

  async verifySecurityAnswer(email, role, securityAnswer) {
    try {
      await apiFetch("auth/forgot_verify.php", {
        method: "POST",
        body: JSON.stringify({ email, role, securityAnswer }),
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },

  async resetPassword(email, role, securityAnswer, newPassword) {
    try {
      await apiFetch("auth/forgot_reset.php", {
        method: "POST",
        body: JSON.stringify({ email, role, securityAnswer, newPassword }),
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },

  async requireRole(role) {
    const session = await this.getSession();
    if (!session || session.role !== role) {
      const base = window.location.pathname.includes("/user/") || window.location.pathname.includes("/admin/") ? "../" : "";
      window.location.href = base + "index.html";
      return null;
    }
    return session;
  },

  async logout() {
    try {
      await apiFetch("auth/logout.php", { method: "POST" });
    } finally {
      const base = window.location.pathname.includes("/user/") || window.location.pathname.includes("/admin/") ? "../" : "";
      window.location.href = base + "index.html";
    }
  },
};
