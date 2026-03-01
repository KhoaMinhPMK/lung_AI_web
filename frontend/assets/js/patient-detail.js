// ==========================================
// MedVision AI — Patient Detail Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  if (id) loadPatient(id);
});

function loadPatient(id) {
  const patients = Store.get('patients', []);
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    document.querySelector('.page-body').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❌</div>
        <h3>Không tìm thấy bệnh nhân</h3>
        <a href="patients.html" class="btn btn-primary mt-lg">Quay lại danh sách</a>
      </div>`;
    return;
  }

  // Update page info
  const initials = patient.fullName.split(' ').map(w => w[0]).slice(-2).join('');
  document.getElementById('patientAvatar').textContent = initials;
  document.getElementById('patientName').textContent = patient.fullName;
  document.getElementById('patientCode').textContent = patient.patientCode;
  document.getElementById('patientAge').textContent = calculateAge(patient.dateOfBirth) + ' tuổi';
  document.getElementById('patientGender').textContent = patient.gender;
  document.getElementById('patientPhone').textContent = patient.phone || '—';
  document.getElementById('patientAddress').textContent = patient.address || '—';
  document.getElementById('patientHistory').textContent = patient.medicalHistory || 'Không có';
  document.getElementById('breadcrumbName').textContent = patient.fullName;
  document.getElementById('pageTitle').textContent = patient.fullName;
  document.title = `${patient.fullName} — MedVision AI`;

  const statusClass = patient.status === 'Đang theo dõi' ? 'badge-primary' :
    patient.status === 'Hoàn tất' ? 'badge-success' : 'badge-warning';
  const badge = document.getElementById('patientStatusBadge');
  badge.className = `badge ${statusClass} badge-dot`;
  badge.textContent = patient.status;

  // Load diagnoses
  loadTimeline(id);
}

function loadTimeline(patientId) {
  const diagnoses = Store.get('diagnoses', []);
  const patientDiags = diagnoses.filter(d => d.patientId === patientId);
  const timeline = document.getElementById('diagnosisTimeline');

  if (patientDiags.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state" style="padding-left:0;">
        <div class="empty-icon">🔬</div>
        <h3>Chưa có lịch sử chẩn đoán</h3>
        <p>Bệnh nhân chưa được chẩn đoán lần nào.</p>
        <a href="diagnosis.html" class="btn btn-primary mt-lg"><i class="fa-solid fa-microscope"></i> Chẩn đoán ngay</a>
      </div>`;
    return;
  }

  // Sort by date desc
  patientDiags.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  timeline.innerHTML = patientDiags.map((d, i) => {
    const typeClass = d.hasTumor ? 'tumor' : 'normal';
    const severityHtml = d.hasTumor ? `
      <span class="severity ${d.severity}">
        <span class="severity-dot"></span> ${d.severity === 'high' ? 'Cao' : d.severity === 'medium' ? 'Trung bình' : 'Thấp'}
      </span>` : '<span class="text-success fw-600">Bình thường</span>';

    return `
      <div class="timeline-item ${typeClass}" style="animation-delay: ${i * 100}ms;">
        <div class="timeline-card">
          <div class="timeline-date">${formatDateTime(d.createdAt)}</div>
          <div class="timeline-result">
            ${d.hasTumor ? `⚠️ AI gợi ý ${d.numTumors} tổn thương nghi ngờ` : '✅ Không phát hiện bất thường'}
            — ${severityHtml}
          </div>
          <div class="timeline-detail">
            ${d.hasTumor ? `Kích thước: <strong>${d.sizeEstimate}</strong> • ` : ''}
            Confidence: <strong>${d.confidence}%</strong>
          </div>
          <div class="timeline-detail mt-sm" style="color: var(--text-tertiary); font-size:12px;">
            AI: ${d.aiSummary}
          </div>
        </div>
      </div>`;
  }).join('');
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');

  if (tabId === 'chart') {
    initTrackingChart();
  }
}

let trackingChartInstance = null;

function initTrackingChart() {
  if (trackingChartInstance) return;

  const ctx = document.getElementById('tumorTrackingChart');
  if (!ctx) return;

  trackingChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['01/01', '15/01', '01/02', '15/02', '01/03'],
      datasets: [{
        label: 'Kích thước tổn thương lớn nhất (mm)',
        data: [8.2, 9.1, 10.5, 11.4, 12.3],
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      }, {
        label: 'Khối u phụ (mm)',
        data: [4.5, 4.8, 5.0, 5.3, 5.8],
        borderColor: 'rgba(245, 158, 11, 0.8)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { family: "'Inter', sans-serif", size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}mm`
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'Kích thước (mm)', font: { family: "'Inter', sans-serif" } },
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' }
        },
        x: {
          title: { display: true, text: 'Ngày khám', font: { family: "'Inter', sans-serif" } },
          grid: { display: false }
        }
      }
    }
  });
}
