// ==========================================
// MedVision AI — Dashboard Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initCurrentDate();
    initCharts();
});

/**
 * Set current date display
 */
function initCurrentDate() {
    const el = document.getElementById('currentDate');
    if (el) {
        const now = new Date();
        el.textContent = formatDate(now);
    }
}

/**
 * Init Chart.js charts
 */
function initCharts() {
    initMonthlyChart();
    initPieChart();
}

function initMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const tumorData = [3, 5, 2, 6, 4, 7, 5, 3, 4, 6, 3, 4];
    const normalData = [22, 28, 25, 30, 27, 35, 32, 28, 30, 33, 26, 29];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Tổn thương nghi ngờ',
                    data: tumorData,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Bình thường',
                    data: normalData,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        padding: 20,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleFont: { family: "'Inter', sans-serif" },
                    bodyFont: { family: "'Inter', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Inter', sans-serif", size: 12 } }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { family: "'Inter', sans-serif", size: 12 } },
                    beginAtZero: true
                }
            }
        }
    });
}

function initPieChart() {
    const ctx = document.getElementById('resultPieChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bình thường', 'Tổn thương nghi ngờ'],
            datasets: [{
                data: [309, 47],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 0,
                hoverOffset: 8,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: { family: "'Inter', sans-serif", size: 13 }
                    }
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleFont: { family: "'Inter', sans-serif" },
                    bodyFont: { family: "'Inter', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return ` ${context.label}: ${context.parsed} ca (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
