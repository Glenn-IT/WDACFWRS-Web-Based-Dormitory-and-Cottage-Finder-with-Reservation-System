document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("payments-table-body");
  const viewModal = new bootstrap.Modal(document.getElementById("payment-view-modal"));
  const refundModal = new bootstrap.Modal(document.getElementById("refund-review-modal"));
  const receiptModal = new bootstrap.Modal(document.getElementById("receipt-preview-modal"));

  let payments = [];

  const filterStatus = document.getElementById("filter-payment-status");
  const filterRefund = document.getElementById("filter-refund-status");
  const filterMethod = document.getElementById("filter-payment-method");
  const filterSearch = document.getElementById("filter-search-payment");
  const refreshBtn = document.getElementById("refresh-payments-btn");
  const resetBtn = document.getElementById("reset-filters-btn");

  [filterStatus, filterRefund, filterMethod].forEach((el) => {
    if (el) el.addEventListener("change", render);
  });
  if (filterSearch) {
    let debounceTimer;
    filterSearch.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, 250);
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", render);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      filterStatus.value = "All";
      filterRefund.value = "All";
      filterMethod.value = "All";
      filterSearch.value = "";
      render();
    });
  }

  async function render() {
    const status = filterStatus ? filterStatus.value : "All";
    const refundStatus = filterRefund ? filterRefund.value : "All";
    const method = filterMethod ? filterMethod.value : "All";
    const search = filterSearch ? filterSearch.value.trim() : "";

    try {
      const data = await DataAPI.getPayments({ status, refundStatus, method, search });
      payments = data.payments || [];
      const stats = data.stats || {};

      // Update stat cards
      const colEl = document.getElementById("stat-collected");
      const penEl = document.getElementById("stat-pending");
      const refCountEl = document.getElementById("stat-refund-requests");
      const refTotEl = document.getElementById("stat-refunded");

      if (colEl) colEl.textContent = `₱${Number(stats.totalCollected || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      if (penEl) penEl.textContent = `₱${Number(stats.totalPending || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      if (refCountEl) refCountEl.textContent = stats.pendingRefundCount || 0;
      if (refTotEl) refTotEl.textContent = `₱${Number(stats.totalRefunded || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

      tbody.innerHTML = payments.length
        ? payments
            .map((p) => {
              const isRefundPending = p.refundStatus === "Pending";
              const refundBadge = p.refundStatus !== "None"
                ? `<span class="badge ${p.refundStatus === "Pending" ? "bg-warning text-dark border border-warning" : (p.refundStatus === "Approved" ? "bg-success" : "bg-danger")}">${p.refundStatus}</span>`
                : `<span class="text-muted small">—</span>`;

              return `
          <tr class="${isRefundPending ? "table-warning bg-opacity-25" : ""}">
            <td class="fw-bold font-monospace">#${p.id}</td>
            <td>
              <span class="badge bg-light text-dark border font-monospace">Res #${p.reservationId}</span>
            </td>
            <td>
              <div class="fw-semibold">${escapeHtml(p.studentName)}</div>
              <div class="text-muted small" style="font-size: 0.75rem;">ID: ${p.studentId}</div>
            </td>
            <td>
              <div class="small fw-semibold">${escapeHtml(p.assetLabel)}</div>
              <div class="text-muted small" style="font-size: 0.75rem;">${escapeHtml(p.assetType)}</div>
            </td>
            <td>
              <span class="badge bg-light text-primary border border-primary-subtle">${escapeHtml(p.method)}</span>
            </td>
            <td class="fw-bold text-dark font-monospace">
              ₱${Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
            <td class="small text-muted">${p.date}</td>
            <td>
              ${p.referenceNumber
                ? `<span class="badge bg-secondary-subtle text-dark border font-monospace">${escapeHtml(p.referenceNumber)}</span>`
                : `<span class="text-muted small">—</span>`}
            </td>
            <td class="text-center">
              ${p.receiptImage
                ? `<img src="${resolveAsset(p.receiptImage)}" alt="Receipt" class="border rounded bg-white shadow-sm" style="width: 38px; height: 38px; object-fit: cover; cursor: pointer;" data-view-receipt="${p.id}" title="Click to view slip">`
                : `<span class="text-muted small">—</span>`}
            </td>
            <td>
              <span class="badge ${badgeClass(p.status)}">${p.status}</span>
            </td>
            <td>${refundBadge}</td>
            <td class="text-end text-nowrap">
              <button class="btn btn-sm btn-outline-primary me-1" data-view-pay="${p.id}">
                <i class="fa-solid fa-eye me-1"></i>View
              </button>
              ${isRefundPending ? `
                <button class="btn btn-sm btn-danger" data-review-refund="${p.reservationId}">
                  <i class="fa-solid fa-hand-holding-dollar me-1"></i>Review Refund
                </button>` : ""}
            </td>
          </tr>`;
            })
            .join("")
        : `<tr><td colspan="12"><div class="empty-state py-5"><i class="fa-solid fa-receipt fa-2x mb-2 text-muted"></i><div>No payment records found matching your filters.</div></div></td></tr>`;

      tbody.querySelectorAll("[data-view-pay]").forEach((b) => b.addEventListener("click", () => openViewModal(b.dataset.viewPay)));
      tbody.querySelectorAll("[data-view-receipt]").forEach((b) => b.addEventListener("click", () => openReceiptModal(b.dataset.viewReceipt, "student")));
      tbody.querySelectorAll("[data-review-refund]").forEach((b) => b.addEventListener("click", () => openReviewRefundModal(b.dataset.reviewRefund)));
    } catch (err) {
      showToast(err.message || "Failed to load payment records", "error");
    }
  }

  function openReceiptModal(paymentId, mode = "student") {
    const p = payments.find((x) => String(x.id) === String(paymentId));
    if (!p) return;

    const imgPath = mode === "refund" ? p.refundReceiptImage : p.receiptImage;
    if (!imgPath) return;

    const fullUrl = resolveAsset(imgPath);
    document.getElementById("receipt-modal-title").innerHTML = mode === "refund"
      ? `<i class="fa-solid fa-receipt me-2 text-success"></i>Proof of Resent Refund — Res #${p.reservationId}`
      : `<i class="fa-solid fa-receipt me-2 text-primary"></i>Proof of Student Payment — Payment #${p.id}`;

    document.getElementById("receipt-modal-img").src = fullUrl;
    document.getElementById("receipt-modal-open-link").href = fullUrl;
    document.getElementById("receipt-modal-meta").innerHTML = `
      <div><strong>Student:</strong> ${escapeHtml(p.studentName)} &nbsp;|&nbsp; <strong>Amount:</strong> ₱${Number(p.amount).toLocaleString()} &nbsp;|&nbsp; <strong>Date:</strong> ${p.date}</div>
      ${p.referenceNumber ? `<div class="mt-1 font-monospace"><strong>Transaction Ref #:</strong> ${escapeHtml(p.referenceNumber)}</div>` : ""}
      ${p.refundReferenceNumber && mode === "refund" ? `<div class="mt-1 font-monospace text-success"><strong>Refund Transfer Ref #:</strong> ${escapeHtml(p.refundReferenceNumber)}</div>` : ""}
    `;
    receiptModal.show();
  }

  function openViewModal(id) {
    const p = payments.find((x) => String(x.id) === String(id));
    if (!p) return;

    let refundSection = "";
    if (p.refundStatus && p.refundStatus !== "None") {
      const isApproved = p.refundStatus === "Approved";
      const isPending = p.refundStatus === "Pending";
      const borderClass = isApproved ? "border-success-subtle bg-success-subtle" : (isPending ? "border-warning-subtle bg-warning-subtle" : "border-danger-subtle bg-danger-subtle");
      const icon = isApproved ? "fa-circle-check text-success" : (isPending ? "fa-clock text-warning" : "fa-circle-xmark text-danger");

      refundSection = `
        <div class="card p-3 border mt-3 bg-opacity-10 ${borderClass}">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold mb-0"><i class="fa-solid ${icon} me-2"></i>Refund Details (${p.refundStatus})</h6>
            ${isPending ? `<button class="btn btn-sm btn-danger py-1" onclick="document.querySelector('[data-review-refund=\x22${p.reservationId}\x22]').click()"><i class="fa-solid fa-hand-holding-dollar me-1"></i>Review Now</button>` : ""}
          </div>
          <div class="row g-2 small">
            <div class="col-sm-6"><strong>Refund Payout Channel:</strong> ${escapeHtml(p.refundMethod || "N/A")}</div>
            <div class="col-sm-6"><strong>Account / Payee Name:</strong> ${escapeHtml(p.refundAccountName || "N/A")}</div>
            <div class="col-sm-6"><strong>Account / Mobile Number:</strong> <span class="font-monospace fw-bold">${escapeHtml(p.refundAccountNumber || "N/A")}</span></div>
            <div class="col-sm-6"><strong>Request Date:</strong> ${p.refundRequestDate || "N/A"}</div>
            <div class="col-12 mt-1">
              <span class="text-muted d-block">Student's Cancellation Reason:</span>
              <div class="p-2 border rounded bg-white mt-1 fst-italic">${escapeHtml(p.refundReason || "None provided")}</div>
            </div>
            ${p.refundProcessedDate ? `
              <div class="col-sm-6 mt-2"><strong>Processed On:</strong> ${p.refundProcessedDate}</div>
              <div class="col-sm-6 mt-2"><strong>Refund Transfer Ref #:</strong> <span class="badge bg-success-subtle text-dark border font-monospace">${escapeHtml(p.refundReferenceNumber || "N/A")}</span></div>` : ""}
            ${p.refundAdminNotes ? `
              <div class="col-12 mt-2">
                <span class="text-muted d-block">Admin Confirmation Notes / Denial Reason:</span>
                <div class="p-2 border rounded bg-white mt-1">${escapeHtml(p.refundAdminNotes)}</div>
              </div>` : ""}
            ${p.refundReceiptImage ? `
              <div class="col-12 mt-2 text-center p-2 border rounded bg-white">
                <span class="small fw-semibold d-block text-success mb-1"><i class="fa-solid fa-receipt me-1"></i>Admin Proof of Resent Funds</span>
                <img src="${resolveAsset(p.refundReceiptImage)}" alt="Proof of Resent Refund" class="img-fluid rounded border shadow-sm" style="max-height: 160px; object-fit: contain; cursor: pointer;" onclick="window.open('${resolveAsset(p.refundReceiptImage)}', '_blank')">
              </div>` : ""}
          </div>
        </div>`;
    }

    document.getElementById("payment-view-body").innerHTML = `
      <div class="row g-3">
        <div class="col-md-5">
          <div class="text-center p-2 border rounded bg-light">
            <span class="small fw-semibold d-block text-muted mb-2">Booked Accommodation</span>
            <img src="${resolveAsset(p.assetImage)}" class="img-fluid rounded border" style="max-height: 160px; object-fit: cover;">
            <div class="fw-bold mt-2">${escapeHtml(p.assetLabel)}</div>
            <div class="small text-muted">${escapeHtml(p.assetType)}</div>
          </div>
          ${p.receiptImage ? `
            <div class="mt-3 text-center p-2 border rounded bg-light">
              <span class="small fw-semibold d-block text-primary mb-1"><i class="fa-solid fa-receipt me-1"></i>Student Payment Receipt</span>
              <img src="${resolveAsset(p.receiptImage)}" class="img-fluid rounded border shadow-sm" style="max-height: 150px; object-fit: contain; cursor: pointer;" title="Click to open" onclick="window.open('${resolveAsset(p.receiptImage)}', '_blank')">
            </div>` : ""}
        </div>
        <div class="col-md-7">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="fw-bold mb-0">Payment #${p.id}</h5>
            <span class="badge ${badgeClass(p.status)} fs-6">${p.status}</span>
          </div>
          <p class="mb-1"><strong>Reservation #:</strong> <a href="reservations.html" class="fw-bold text-decoration-none">#${p.reservationId}</a></p>
          <p class="mb-1"><strong>Student:</strong> ${escapeHtml(p.studentName)} (ID: ${p.studentId})</p>
          <p class="mb-1"><strong>Email:</strong> ${escapeHtml(p.studentEmail || "N/A")}</p>
          <p class="mb-1"><strong>Phone:</strong> ${escapeHtml(p.studentPhone || "N/A")}</p>
          <p class="mb-1"><strong>Payment Method:</strong> <span class="badge bg-light text-primary border border-primary-subtle">${escapeHtml(p.method)}</span></p>
          <p class="mb-1"><strong>Amount:</strong> <span class="fw-bold fs-5 text-dark font-monospace">₱${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
          <p class="mb-1"><strong>Payment Date:</strong> ${p.date}</p>
          ${p.referenceNumber ? `<p class="mb-1"><strong>Transaction Ref #:</strong> <span class="badge bg-secondary-subtle text-dark border font-monospace fs-6">${escapeHtml(p.referenceNumber)}</span></p>` : ""}
        </div>
      </div>
      ${refundSection}`;

    viewModal.show();
  }

  function openReviewRefundModal(reservationId) {
    const p = payments.find((x) => String(x.reservationId) === String(reservationId));
    if (!p) return;

    document.getElementById("refund-res-id").value = p.reservationId;
    document.getElementById("refund-student-name").textContent = `${p.studentName} (ID: ${p.studentId})`;
    document.getElementById("refund-res-num").textContent = `#${p.reservationId}`;
    document.getElementById("refund-amount").textContent = `₱${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById("refund-amount-text").textContent = Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById("refund-method-badge").textContent = p.refundMethod || "Online Transfer";
    document.getElementById("refund-acc-name").textContent = p.refundAccountName || "N/A";
    document.getElementById("refund-acc-number").textContent = p.refundAccountNumber || "N/A";
    document.getElementById("refund-reason-text").textContent = p.refundReason || "No explanation provided.";

    // Reset forms
    document.getElementById("approve-refund-form").reset();
    document.getElementById("deny-refund-form").reset();

    // Default to approve tab
    const approveTabBtn = document.getElementById("tab-approve-btn");
    if (approveTabBtn) bootstrap.Tab.getOrCreateInstance(approveTabBtn).show();

    refundModal.show();
  }

  // Handle Approve Refund Form Submit
  const approveForm = document.getElementById("approve-refund-form");
  if (approveForm) {
    approveForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const resId = document.getElementById("refund-res-id").value;
      const refNumber = document.getElementById("approve-ref-number").value.trim();
      const adminNotes = document.getElementById("approve-admin-notes").value.trim();
      const fileInput = document.getElementById("approve-receipt-file");

      if (!refNumber) {
        showToast("Please enter the transfer transaction reference number from sending the money.", "warning");
        return;
      }

      const ok = await confirmDialog({
        title: "Confirm Refund Approval",
        message: `Have you successfully resent the money to the student's designated payout account? This will mark the reservation as Refunded and reopen the unit for other students.`,
        confirmText: "Yes, Approve & Mark Resent",
        confirmClass: "btn-success",
      });
      if (!ok) return;

      withLoading(async () => {
        try {
          const fd = new FormData();
          fd.append("id", resId);
          fd.append("refundReferenceNumber", refNumber);
          fd.append("refundAdminNotes", adminNotes);
          if (fileInput && fileInput.files && fileInput.files[0]) {
            fd.append("refundReceipt", fileInput.files[0]);
          }

          await DataAPI.approveRefund(fd);
          refundModal.hide();
          showToast("Refund approved! Funds marked as resent and unit has been reopened.", "success");
          render();
        } catch (err) {
          showToast(err.message || "Failed to approve refund", "error");
        }
      });
    });
  }

  // Handle Deny Refund Form Submit
  const denyForm = document.getElementById("deny-refund-form");
  if (denyForm) {
    denyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const resId = document.getElementById("refund-res-id").value;
      const reason = document.getElementById("deny-reason").value.trim();

      if (!reason) {
        showToast("Please provide a reason for denying this refund.", "warning");
        return;
      }

      const ok = await confirmDialog({
        title: "Deny Refund Request",
        message: "Are you sure you want to deny this refund request? The student will be notified with your explanation.",
        confirmText: "Deny Refund",
        confirmClass: "btn-danger",
      });
      if (!ok) return;

      withLoading(async () => {
        try {
          await DataAPI.denyRefund({ id: Number(resId), reason });
          refundModal.hide();
          showToast("Refund request has been denied.", "info");
          render();
        } catch (err) {
          showToast(err.message || "Failed to deny refund", "error");
        }
      });
    });
  }

  // Initial render
  render();
});
