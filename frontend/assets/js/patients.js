// ==========================================
// MedVision AI — Patients Logic (Enhanced)
// ==========================================

let currentFilter = 'all';
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = 'createdAt';
let sortDirection = 'desc'; // 'asc' or 'desc'

// Debounced search
const debouncedSearch = debounce(() => {
  currentPage = 1;
  renderPatients();
}, 300);

document.addEventListener('DOMContentLoaded', () => {
  renderPatients();

  // Add click-to-close for modal backdrop
  const modal = document.getElementById('patientModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
});

/**
 * Render patients table with pagination
 */
function renderPatients() {
  const patients = Store.get('patients', []);
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();

  // Filter
  let filtered = patients.filter(p => {
    const matchSearch = !search ||
      p.fullName.toLowerCase().includes(search) ||
      p.patientCode.toLowerCase().includes(search) ||
      (p.phone && p.phone.includes(search));
    const matchFilter = currentFilter === 'all' || p.status === currentFilter;
    return matchSearch && matchFilter;
  });

  // Sort
  filtered.sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (sortColumn === 'dateOfBirth' || sortColumn === 'createdAt') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Clamp currentPage
  if (currentPage > totalPages) currentPage = totalPages || 1;

  // Paginate
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

  const tbody = document.getElementById('patientsBody');
  if (!tbody) return;

  if (paginated.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 48px;">
          <div class="empty-state" style="padding: 16px;">
            <div class="empty-icon">👥</div>
            <h3>Không tìm thấy bệnh nhân</h3>
            <p>Thử thay đổi bộ lọc hoặc thêm bệnh nhân mới.</p>
          </div>
        </td>
      </tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = paginated.map(p => {
    const age = calculateAge(p.dateOfBirth);
    const statusClass = p.status === 'Đang theo dõi' ? 'monitoring' :
      p.status === 'Hoàn tất' ? 'completed' : 'new';
    return `
      <tr>
        <td><code style="font-size:12px;">${escapeHtml(p.patientCode)}</code></td>
        <td><strong>${escapeHtml(p.fullName)}</strong></td>
        <td>${age}</td>
        <td>${escapeHtml(p.gender)}</td>
        <td>${escapeHtml(p.phone || '—')}</td>
        <td><span class="patient-status ${statusClass}">${escapeHtml(p.status)}</span></td>
        <td>${formatDateTime(p.createdAt)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-secondary" title="Xem chi tiết" onclick="viewPatient(${p.id})">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-secondary" title="Sửa" onclick="editPatient(${p.id})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-danger" title="Xóa" onclick="confirmDeletePatient(${p.id}, '${escapeHtml(p.fullName)}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderPagination(totalItems, totalPages);
  updateSortIndicators();
}

/**
 * Render pagination controls
 */
function renderPagination(totalItems, totalPages) {
  const container = document.getElementById('pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = totalItems > 0 ?
      `<span class="pagination-info">Hiển thị ${totalItems} bệnh nhân</span>` : '';
    return;
  }

  let buttons = '';

  // Previous
  buttons += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
        <i class="fa-solid fa-chevron-left"></i>
    </button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      buttons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      buttons += `<span class="pagination-dots">...</span>`;
    }
  }

  // Next
  buttons += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
        <i class="fa-solid fa-chevron-right"></i>
    </button>`;

  container.innerHTML = `
        <span class="pagination-info">${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} / ${totalItems}</span>
        <div class="pagination-buttons">${buttons}</div>
    `;
}

function goToPage(page) {
  currentPage = page;
  renderPatients();
}

/**
 * Sort by column
 */
function sortBy(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  currentPage = 1;
  renderPatients();
}

function updateSortIndicators() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.sort === sortColumn) {
      th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

/**
 * Filter by search (debounced)
 */
function filterPatients() {
  debouncedSearch();
}

/**
 * Filter by status chip
 */
function filterByStatus(chip, status) {
  document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentFilter = status;
  currentPage = 1;
  renderPatients();
}

/**
 * Open add modal
 */
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Thêm bệnh nhân mới';
  document.getElementById('editId').value = '';
  document.getElementById('formCode').value = generatePatientCode();
  document.getElementById('formName').value = '';
  document.getElementById('formDob').value = '';
  document.getElementById('formGender').value = 'Nam';
  document.getElementById('formPhone').value = '';
  document.getElementById('formAddress').value = '';
  document.getElementById('formHistory').value = '';
  document.getElementById('formNotes').value = '';
  document.getElementById('formStatus').value = 'Mới';
  clearValidationErrors();
  document.getElementById('patientModal').classList.add('active');
}

/**
 * Edit patient
 */
function editPatient(id) {
  const patients = Store.get('patients', []);
  const p = patients.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh sửa bệnh nhân';
  document.getElementById('editId').value = p.id;
  document.getElementById('formCode').value = p.patientCode;
  document.getElementById('formName').value = p.fullName;
  document.getElementById('formDob').value = p.dateOfBirth;
  document.getElementById('formGender').value = p.gender;
  document.getElementById('formPhone').value = p.phone;
  document.getElementById('formAddress').value = p.address;
  document.getElementById('formHistory').value = p.medicalHistory;
  document.getElementById('formNotes').value = p.notes;
  document.getElementById('formStatus').value = p.status;
  clearValidationErrors();
  document.getElementById('patientModal').classList.add('active');
}

/**
 * Close modal
 */
function closeModal() {
  document.getElementById('patientModal').classList.remove('active');
  clearValidationErrors();
}

/**
 * Form validation with visual feedback
 */
function validateField(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  const value = field.value.trim();
  if (!value) {
    field.classList.add('input-error');
    // Add error message
    let errEl = field.parentElement.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'field-error';
      field.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
    field.focus();
    return false;
  }
  field.classList.remove('input-error');
  const errEl = field.parentElement.querySelector('.field-error');
  if (errEl) errEl.remove();
  return true;
}

function clearValidationErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('.field-error').forEach(el => el.remove());
}

/**
 * Save patient (add or edit) with validation
 */
function savePatient() {
  clearValidationErrors();

  let valid = true;
  if (!validateField('formDob', 'Vui lòng chọn ngày sinh')) valid = false;
  if (!validateField('formName', 'Vui lòng nhập họ tên')) valid = false;

  if (!valid) {
    showToast('warning', 'Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc.');
    return;
  }

  const patients = Store.get('patients', []);
  const editId = document.getElementById('editId').value;

  const data = {
    patientCode: document.getElementById('formCode').value,
    fullName: document.getElementById('formName').value.trim(),
    dateOfBirth: document.getElementById('formDob').value,
    gender: document.getElementById('formGender').value,
    phone: document.getElementById('formPhone').value,
    address: document.getElementById('formAddress').value,
    medicalHistory: document.getElementById('formHistory').value,
    notes: document.getElementById('formNotes').value,
    status: document.getElementById('formStatus').value,
  };

  if (editId) {
    const idx = patients.findIndex(p => p.id === parseInt(editId));
    if (idx >= 0) {
      patients[idx] = { ...patients[idx], ...data, updatedAt: new Date().toISOString() };
    }
    showToast('success', 'Cập nhật thành công', `Đã cập nhật hồ sơ ${data.fullName}.`);
  } else {
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    patients.push({ id: newId, ...data, createdAt: new Date().toISOString() });
    showToast('success', 'Thêm thành công', `Đã thêm bệnh nhân ${data.fullName}.`);
  }

  Store.set('patients', patients);
  closeModal();
  renderPatients();
}

/**
 * Custom confirm dialog for delete (replacing native confirm())
 */
function confirmDeletePatient(id, name) {
  // Create custom confirm modal
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'deleteConfirmModal';
  overlay.innerHTML = `
        <div class="modal" style="max-width: 420px;">
            <div class="modal-header">
                <h2><i class="fa-solid fa-triangle-exclamation text-danger"></i> Xác nhận xóa</h2>
            </div>
            <div class="modal-body" style="padding: var(--space-lg);">
                <p>Bạn có chắc muốn xóa bệnh nhân <strong>${escapeHtml(name)}</strong>?</p>
                <p style="color: var(--text-tertiary); font-size: 13px; margin-top: var(--space-sm);">Hành động này không thể hoàn tác.</p>
            </div>
            <div class="d-flex justify-end gap-sm" style="padding: var(--space-md) var(--space-lg);">
                <button class="btn btn-secondary" onclick="document.getElementById('deleteConfirmModal').remove()">Hủy</button>
                <button class="btn btn-danger" onclick="deletePatient(${id})">
                    <i class="fa-solid fa-trash"></i> Xóa bệnh nhân
                </button>
            </div>
        </div>
    `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

/**
 * Delete patient
 */
function deletePatient(id) {
  // Remove confirm modal if exists
  const confirmModal = document.getElementById('deleteConfirmModal');
  if (confirmModal) confirmModal.remove();

  let patients = Store.get('patients', []);
  patients = patients.filter(p => p.id !== id);
  Store.set('patients', patients);
  showToast('info', 'Đã xóa', 'Bệnh nhân đã được xóa khỏi hệ thống.');
  renderPatients();
}

/**
 * View patient detail
 */
function viewPatient(id) {
  window.location.href = `patient-detail.html?id=${id}`;
}
