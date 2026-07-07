/* ============================================================
   CSU-Piat Dormitory & Cottage Finder — API client
   Thin fetch() wrapper around the PHP/MySQL backend in /api.
   Replaces the old localStorage mock data layer.
   ============================================================ */

const API_BASE = (function () {
  const p = window.location.pathname;
  return (p.includes("/admin/") || p.includes("/user/")) ? "../api" : "api";
})();

const SITE_ROOT = (function () {
  const p = window.location.pathname;
  return (p.includes("/admin/") || p.includes("/user/")) ? ".." : ".";
})();

const PLACEHOLDER_IMAGE = "https://placehold.co/400x260/64748b/ffffff?text=No+Image";

function resolveAsset(path) {
  if (!path) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ROOT}/${path}`;
}

async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}/${path}`, {
    credentials: "same-origin",
    ...options,
    headers: isFormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

function qs(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const search = new URLSearchParams(clean).toString();
  return search ? `?${search}` : "";
}

const DataAPI = {
  // ---- Dormitories ----
  getDorms: (params = {}) => apiFetch(`dorms/list.php${qs(params)}`),
  getDorm: (id) => apiFetch(`dorms/get.php${qs({ id })}`),
  createDorm: (formData) => apiFetch("dorms/create.php", { method: "POST", body: formData }),
  updateDorm: (formData) => apiFetch("dorms/update.php", { method: "POST", body: formData }),
  deleteDorm: (id) => apiFetch("dorms/delete.php", { method: "POST", body: JSON.stringify({ id }) }),

  // ---- Cottages ----
  getCottages: (params = {}) => apiFetch(`cottages/list.php${qs(params)}`),
  getCottage: (id) => apiFetch(`cottages/get.php${qs({ id })}`),
  createCottage: (formData) => apiFetch("cottages/create.php", { method: "POST", body: formData }),
  updateCottage: (formData) => apiFetch("cottages/update.php", { method: "POST", body: formData }),
  deleteCottage: (id) => apiFetch("cottages/delete.php", { method: "POST", body: JSON.stringify({ id }) }),

  // ---- Reservations ----
  getReservations: (params = {}) => apiFetch(`reservations/list.php${qs(params)}`),
  getReservation: (id) => apiFetch(`reservations/get.php${qs({ id })}`),
  createReservation: (payload) => apiFetch("reservations/create.php", { method: "POST", body: JSON.stringify(payload) }),
  approveReservation: (id) => apiFetch("reservations/approve.php", { method: "POST", body: JSON.stringify({ id }) }),
  declineReservation: (id) => apiFetch("reservations/decline.php", { method: "POST", body: JSON.stringify({ id }) }),
  cancelReservation: (id) => apiFetch("reservations/cancel.php", { method: "POST", body: JSON.stringify({ id }) }),

  // ---- Notifications ----
  getNotifications: () => apiFetch("notifications/list.php"),
  markNotificationRead: (id) => apiFetch("notifications/mark_read.php", { method: "POST", body: JSON.stringify({ id }) }),

  // ---- Users (admin management of students) ----
  getUsers: (params = {}) => apiFetch(`users/list.php${qs(params)}`),
  getUser: (id) => apiFetch(`users/get.php${qs({ id })}`),
  setUserStatus: (id, status) => apiFetch("users/set_status.php", { method: "POST", body: JSON.stringify({ id, status }) }),

  // ---- Student self-service profile ----
  getProfile: () => apiFetch("profile/get.php"),
  updateProfile: (payload) => apiFetch("profile/update.php", { method: "POST", body: JSON.stringify(payload) }),
  changePassword: (payload) => apiFetch("profile/change_password.php", { method: "POST", body: JSON.stringify(payload) }),
  uploadProfilePicture: (formData) => apiFetch("profile/upload_picture.php", { method: "POST", body: formData }),

  // ---- Admin self-service settings ----
  getAdminSettings: () => apiFetch("settings/get.php"),
  updateAdminProfile: (payload) => apiFetch("settings/profile.php", { method: "POST", body: JSON.stringify(payload) }),
  updateAdminSecurity: (payload) => apiFetch("settings/security.php", { method: "POST", body: JSON.stringify(payload) }),
  updateAdminPassword: (payload) => apiFetch("settings/password.php", { method: "POST", body: JSON.stringify(payload) }),

  // ---- Dashboard & reports ----
  getAdminStats: () => apiFetch("dashboard/admin_stats.php"),
  getReport: (params = {}) => apiFetch(`reports/generate.php${qs(params)}`),
};
