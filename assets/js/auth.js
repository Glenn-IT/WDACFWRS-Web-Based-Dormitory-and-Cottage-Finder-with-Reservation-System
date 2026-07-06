/* ============================================================
   Authentication simulation using localStorage
   ============================================================ */

const Auth = {
  getSession() {
    return DB.read(DB.KEYS.SESSION, null);
  },

  setSession(session) {
    DB.write(DB.KEYS.SESSION, session);
  },

  clearSession() {
    localStorage.removeItem(DB.KEYS.SESSION);
  },

  loginStudent(email, password) {
    const users = DataAPI.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, message: "Invalid email or password." };
    if (user.status === "Inactive") return { ok: false, message: "Your account has been deactivated. Contact the admin office." };
    this.setSession({ role: "student", id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}` });
    return { ok: true };
  },

  loginAdmin(email, password) {
    const admins = DataAPI.getAdmins();
    const admin = admins.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!admin) return { ok: false, message: "Invalid email or password." };
    this.setSession({ role: "admin", id: admin.id, email: admin.email, name: admin.name });
    return { ok: true };
  },

  register(data) {
    const users = DataAPI.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, message: "An account with this email already exists." };
    }
    const newUser = {
      id: DB.nextId(users, "STU"),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      securityQuestion: data.securityQuestion,
      securityAnswer: data.securityAnswer,
      course: data.course || "",
      yearLevel: data.yearLevel || "",
      semester: data.semester || "",
      nationality: data.nationality || "Filipino",
      address: data.address || "",
      birthday: data.birthday || "",
      phone: data.phone || "",
      profilePic: `https://placehold.co/200x200/94a3b8/ffffff?text=${(data.firstName || "U")[0]}${(data.lastName || "")[0] || ""}`,
      status: "Active",
      dateRegistered: new Date().toISOString().slice(0, 10),
    };
    users.push(newUser);
    DataAPI.saveUsers(users);
    return { ok: true, user: newUser };
  },

  findAccountByEmail(email, role) {
    if (role === "admin") {
      return DataAPI.getAdmins().find((a) => a.email.toLowerCase() === email.toLowerCase());
    }
    return DataAPI.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  resetPassword(email, role, securityAnswer, newPassword) {
    if (role === "admin") {
      const admins = DataAPI.getAdmins();
      const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (!admin) return { ok: false, message: "No account found with that email." };
      if (admin.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
        return { ok: false, message: "Security answer does not match our records." };
      }
      admin.password = newPassword;
      DataAPI.saveAdmins(admins);
      return { ok: true };
    }
    const users = DataAPI.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, message: "No account found with that email." };
    if (user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
      return { ok: false, message: "Security answer does not match our records." };
    }
    user.password = newPassword;
    DataAPI.saveUsers(users);
    return { ok: true };
  },

  requireRole(role) {
    const session = this.getSession();
    if (!session || session.role !== role) {
      const base = window.location.pathname.includes("/user/") || window.location.pathname.includes("/admin/") ? "../" : "";
      window.location.href = base + "index.html";
      return null;
    }
    return session;
  },

  logout() {
    this.clearSession();
    const base = window.location.pathname.includes("/user/") || window.location.pathname.includes("/admin/") ? "../" : "";
    window.location.href = base + "index.html";
  },
};
