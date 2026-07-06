/* ============================================================
   Shared UI helpers: toasts, confirm dialogs, loading overlay
   ============================================================ */

function ensureToastContainer() {
  let el = document.getElementById("toast-stack");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-stack";
    el.className = "toast-container position-fixed top-0 end-0 p-3";
    el.style.zIndex = "1080";
    document.body.appendChild(el);
  }
  return el;
}

function showToast(message, type = "success") {
  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info",
  };
  const container = ensureToastContainer();
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center border-0 toast-${type}`;
  toastEl.setAttribute("role", "alert");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fa-solid ${icons[type] || icons.info} me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function confirmDialog({ title = "Please Confirm", message = "Are you sure?", confirmText = "Confirm", confirmClass = "btn-danger" } = {}) {
  return new Promise((resolve) => {
    let modalEl = document.getElementById("global-confirm-modal");
    if (modalEl) modalEl.remove();

    modalEl = document.createElement("div");
    modalEl.id = "global-confirm-modal";
    modalEl.className = "modal fade";
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">${message}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn ${confirmClass}" id="global-confirm-btn">${confirmText}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);
    const modal = new bootstrap.Modal(modalEl);

    let resolved = false;
    modalEl.querySelector("#global-confirm-btn").addEventListener("click", () => {
      resolved = true;
      modal.hide();
      resolve(true);
    });
    modalEl.addEventListener("hidden.bs.modal", () => {
      modalEl.remove();
      if (!resolved) resolve(false);
    });
    modal.show();
  });
}

function showLoading(show = true) {
  let el = document.getElementById("global-loading-overlay");
  if (show) {
    if (!el) {
      el = document.createElement("div");
      el.id = "global-loading-overlay";
      el.className = "loading-overlay";
      el.innerHTML = `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>`;
      document.body.appendChild(el);
    }
    el.style.display = "flex";
  } else if (el) {
    el.style.display = "none";
  }
}

function withLoading(fn, delay = 400) {
  showLoading(true);
  setTimeout(() => {
    fn();
    showLoading(false);
  }, delay);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function badgeClass(status) {
  const map = {
    Available: "bg-success",
    Occupied: "bg-warning text-dark",
    Full: "bg-secondary",
    Booked: "bg-warning text-dark",
    Approved: "bg-success",
    Pending: "bg-warning text-dark",
    Declined: "bg-danger",
    Paid: "bg-success",
    Active: "bg-success",
    Inactive: "bg-secondary",
    Cancelled: "bg-danger",
  };
  return map[status] || "bg-secondary";
}
