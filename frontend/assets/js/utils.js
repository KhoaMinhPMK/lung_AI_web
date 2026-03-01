// ==========================================
// MedVision AI — Utility Functions
// ==========================================

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Render markdown text to safe HTML using marked.js
 * Falls back to simple bold/newline conversion if marked is not loaded
 */
function sanitizeMarkdown(text) {
  if (!text) return '';

  // Use marked.js if available (loaded on diagnosis page)
  if (typeof marked !== 'undefined') {
    try {
      marked.setOptions({
        breaks: true,       // GitHub-flavored line breaks
        gfm: true,          // GitHub-flavored markdown (tables, strikethrough)
        headerIds: false,    // No auto-generated header IDs
        mangle: false        // Don't mangle email addresses
      });
      return marked.parse(text);
    } catch (e) {
      console.warn('Marked.js parse error:', e);
    }
  }

  // Fallback: simple regex-based conversion
  let safe = escapeHtml(text);
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\n/g, '<br>');
  return safe;
}

/**
 * Format date to Vietnamese locale
 */
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('vi-VN', options);
}

/**
 * Format datetime to Vietnamese locale
 */
function formatDateTime(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Generate patient code
 */
function generatePatientCode() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `BN-${dateStr}-${random}`;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Show toast notification
 */
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toastContainer') || createToastContainer();

  const icons = {
    success: '<i class="fa-solid fa-circle-check text-success"></i>',
    error: '<i class="fa-solid fa-circle-xmark text-danger"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation text-warning"></i>',
    info: '<i class="fa-solid fa-circle-info" style="color: var(--primary)"></i>'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createToastContainer() {
  // Check if container already exists to avoid duplicates
  const existing = document.getElementById('toastContainer');
  if (existing) return existing;

  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Simple data store (localStorage wrapper)
 */
const Store = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`medvision_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    localStorage.setItem(`medvision_${key}`, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(`medvision_${key}`);
  }
};

/**
 * Initialize demo data if not exists
 */
function initDemoData() {
  if (!Store.get('patients')) {
    Store.set('patients', [
      { id: 1, patientCode: 'BN-20260228-001', fullName: 'Trần Thị Mai', dateOfBirth: '1975-06-15', gender: 'Nữ', phone: '0912345678', address: 'Hà Nội', medicalHistory: 'Tiền sử hút thuốc 10 năm', notes: '', status: 'Đang theo dõi', createdAt: '2026-02-28T08:00:00' },
      { id: 2, patientCode: 'BN-20260228-002', fullName: 'Nguyễn Văn Hùng', dateOfBirth: '1980-03-20', gender: 'Nam', phone: '0987654321', address: 'TP. Hồ Chí Minh', medicalHistory: 'Không có tiền sử đặc biệt', notes: '', status: 'Hoàn tất', createdAt: '2026-02-28T09:30:00' },
      { id: 3, patientCode: 'BN-20260228-003', fullName: 'Lê Hoàng Nam', dateOfBirth: '1965-11-08', gender: 'Nam', phone: '0909876543', address: 'Đà Nẵng', medicalHistory: 'Gia đình có tiền sử ung thư phổi', notes: 'Bệnh nhân tái khám lần 2', status: 'Đang theo dõi', createdAt: '2026-02-28T10:00:00' },
      { id: 4, patientCode: 'BN-20260301-001', fullName: 'Phạm Thị Lan', dateOfBirth: '1990-01-25', gender: 'Nữ', phone: '0935678901', address: 'Hải Phòng', medicalHistory: '', notes: '', status: 'Mới', createdAt: '2026-03-01T07:00:00' },
      { id: 5, patientCode: 'BN-20260301-002', fullName: 'Đỗ Minh Tuấn', dateOfBirth: '1958-07-12', gender: 'Nam', phone: '0967890123', address: 'Cần Thơ', medicalHistory: 'COPD mức độ nhẹ', notes: '', status: 'Mới', createdAt: '2026-03-01T08:30:00' }
    ]);
  }

  if (!Store.get('diagnoses')) {
    Store.set('diagnoses', [
      { id: 1, patientId: 1, doctorId: 1, numTumors: 2, hasTumor: true, severity: 'high', confidence: 94.7, sizeEstimate: '12.3mm × 8.7mm', aiSummary: 'AI gợi ý 2 vùng tổn thương nghi ngờ ở thùy phải phổi. Kích thước lớn nhất 12.3mm. Khuyến nghị sinh thiết.', doctorConclusion: '', createdAt: '2026-03-01T09:45:00' },
      { id: 2, patientId: 2, doctorId: 1, numTumors: 0, hasTumor: false, severity: 'low', confidence: 98.2, sizeEstimate: 'N/A', aiSummary: 'Không phát hiện bất thường trên ảnh MRI.', doctorConclusion: '', createdAt: '2026-03-01T08:30:00' },
      { id: 3, patientId: 3, doctorId: 1, numTumors: 1, hasTumor: true, severity: 'medium', confidence: 87.5, sizeEstimate: '6.1mm × 5.2mm', aiSummary: 'Phát hiện 1 nốt nhỏ ở phân thùy trên thùy trái. Kích thước 6.1mm. Cần theo dõi định kỳ.', doctorConclusion: '', createdAt: '2026-03-01T07:15:00' },
      { id: 4, patientId: 4, doctorId: 1, numTumors: 0, hasTumor: false, severity: 'low', confidence: 96.8, sizeEstimate: 'N/A', aiSummary: 'Không phát hiện bất thường.', doctorConclusion: '', createdAt: '2026-03-01T06:00:00' },
      { id: 5, patientId: 5, doctorId: 1, numTumors: 0, hasTumor: false, severity: 'low', confidence: 99.1, sizeEstimate: 'N/A', aiSummary: 'Phổi sạch, không có dấu hiệu bất thường.', doctorConclusion: '', createdAt: '2026-02-28T16:00:00' }
    ]);
  }
}

// Auto init
initDemoData();
