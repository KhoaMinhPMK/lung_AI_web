// ==========================================
// MedVision AI — Statistics Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initAllCharts();
});

function initAllCharts() {
    initTrendChart();
    initSizeChart();
    initAgeChart();
    initGenderChart();
    initSeverityChart();
}

function chartFont() {
    return { family: "'Inter', sans-serif" };
}

function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [
                {
                    label: 'Tổng ca',
                    data: [25, 33, 27, 36, 31, 42, 37, 31, 34, 39, 29, 33],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    fill: true, tension: 0.4, borderWidth: 2,
                    pointRadius: 4, pointBackgroundColor: '#3b82f6',
                },
                {
                    label: 'Phát hiện u',
                    data: [3, 5, 2, 6, 4, 7, 5, 3, 4, 6, 3, 4],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    fill: true, tension: 0.4, borderWidth: 2,
                    pointRadius: 4, pointBackgroundColor: '#ef4444',
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, padding: 20, font: chartFont() } },
                tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8, titleFont: chartFont(), bodyFont: chartFont() }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: chartFont() } },
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: chartFont() }, beginAtZero: true }
            }
        }
    });
}

function initSizeChart() {
    const ctx = document.getElementById('sizeChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['<3mm', '3-6mm', '6-10mm', '10-15mm', '15-20mm', '>20mm'],
            datasets: [{
                label: 'Số ca',
                data: [5, 12, 15, 8, 4, 3],
                backgroundColor: [
                    'rgba(16,185,129,0.7)', 'rgba(16,185,129,0.7)',
                    'rgba(245,158,11,0.7)', 'rgba(245,158,11,0.7)',
                    'rgba(239,68,68,0.7)', 'rgba(239,68,68,0.7)'
                ],
                borderRadius: 6, borderSkipped: false,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8, titleFont: chartFont(), bodyFont: chartFont() }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: chartFont() }, title: { display: true, text: 'Kích thước (mm)', font: chartFont() } },
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: chartFont() }, beginAtZero: true, title: { display: true, text: 'Số ca', font: chartFont() } }
            }
        }
    });
}

function initAgeChart() {
    const ctx = document.getElementById('ageChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['20-30', '30-40', '40-50', '50-60', '60-70', '70+'],
            datasets: [{
                label: 'Phát hiện u', data: [1, 3, 8, 15, 12, 8],
                backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 6, borderSkipped: false,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8, titleFont: chartFont(), bodyFont: chartFont() }
            },
            scales: {
                x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: chartFont() }, beginAtZero: true },
                y: { grid: { display: false }, ticks: { font: chartFont() } }
            }
        }
    });
}

function initGenderChart() {
    const ctx = document.getElementById('genderChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Nam', 'Nữ'],
            datasets: [{
                data: [31, 16],
                backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(236,72,153,0.8)'],
                borderWidth: 0, hoverOffset: 8, borderRadius: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: chartFont() } },
                tooltip: {
                    backgroundColor: '#0f172a', padding: 12, cornerRadius: 8, titleFont: chartFont(), bodyFont: chartFont(),
                    callbacks: {
                        label: ctx => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            return ` ${ctx.label}: ${ctx.parsed} ca (${((ctx.parsed / total) * 100).toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initSeverityChart() {
    const ctx = document.getElementById('severityChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Thấp', 'Trung bình', 'Cao'],
            datasets: [{
                data: [18, 17, 12],
                backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
                borderWidth: 0, hoverOffset: 8, borderRadius: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: chartFont() } },
                tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8, titleFont: chartFont(), bodyFont: chartFont() }
            }
        }
    });
}

// AI Summary
function showAISummary() {
    document.getElementById('aiSummaryModal').classList.add('active');
    setTimeout(() => {
        document.getElementById('aiSummaryContent').innerHTML = `
<strong>📊 BÁO CÁO TỔNG HỢP AI — MedVision AI</strong>
<strong>Giai đoạn:</strong> 01/03/2025 → 01/03/2026

<strong>📈 Tổng quan:</strong>
• Tổng số ca chẩn đoán: <strong>356 ca</strong>
• Tổn thương nghi ngờ: <strong>47 ca (13.2%)</strong>
• Bình thường: <strong>309 ca (86.8%)</strong>
• Confidence trung bình: <strong>93.8%</strong>

<strong>🔍 Phân tích xu hướng:</strong>
• Số ca phát hiện tổn thương nghi ngờ có xu hướng <strong>tăng 15%</strong> trong quý 2 (T4-T6), có thể liên quan đến đợt tầm soát mở rộng.
• Tháng 6 là tháng có nhiều ca phát hiện nhất (<strong>7 ca</strong>).
• Kích thước trung bình tổn thương: <strong>9.4mm</strong>, dao động từ 2.1mm đến 23.5mm.

<strong>👥 Phân tích nhóm nguy cơ:</strong>
• Nhóm tuổi 50-60 có tỉ lệ phát hiện u cao nhất (<strong>31.9%</strong>).
• Nam giới chiếm <strong>66%</strong> ca phát hiện u, nữ giới 34%.
• 25.5% ca có severity <strong>Cao</strong> (>10mm), cần can thiệp.

<strong>⚡ Top 5 ca có kích thước u lớn nhất:</strong>
1. Trần Thị Mai — 23.5mm (01/03/2026) ← <strong>Cần can thiệp</strong>
2. Nguyễn Đức Thắng — 18.2mm (15/02/2026)
3. Vũ Thị Hương — 16.8mm (03/01/2026)
4. Phạm Văn Minh — 15.1mm (20/12/2025)
5. Lê Hoàng Nam — 12.3mm (01/03/2026)

<strong>💡 Đề xuất tham khảo:</strong>
• Tăng tần suất tầm soát cho nhóm tuổi <strong>50-70</strong>
• Theo dõi sát các ca có severity Cao, đặc biệt 5 ca trên
• Xem xét bổ sung PET-CT cho ca có kích thước >15mm

⚠️ <em>Báo cáo được tạo tự động bởi AI, cần sự xem xét của bác sĩ chuyên khoa.</em>`;
    }, 2000);
}

function closeAISummary() {
    document.getElementById('aiSummaryModal').classList.remove('active');
}
