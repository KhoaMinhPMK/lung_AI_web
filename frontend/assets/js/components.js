// ==========================================
// MedVision AI — Shared Components (DRY)
// ==========================================

/**
 * Render sidebar navigation
 * @param {string} activePage - Current page identifier
 */
function renderSidebar(activePage) {
    const sidebarRoot = document.getElementById('sidebar-root');
    if (!sidebarRoot) return;

    const user = getCurrentUser() || { fullName: 'Bác sĩ Nguyễn Văn A', specialty: 'Chẩn đoán hình ảnh' };
    const initials = user.fullName ? user.fullName.split(' ').map(w => w[0]).slice(-2).join('') : 'BS';

    const menuItems = [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', href: 'index.html' },
        { id: 'diagnosis', icon: 'fa-microscope', label: 'Chẩn đoán mới', href: 'diagnosis.html' },
        { id: 'patients', icon: 'fa-hospital-user', label: 'Quản lý bệnh nhân', href: 'patients.html' },
        { id: 'statistics', icon: 'fa-chart-line', label: 'Thống kê & Báo cáo', href: 'statistics.html' }
    ];

    const systemItems = [
        { id: 'settings', icon: 'fa-gear', label: 'Cài đặt', href: 'settings.html' }
    ];

    sidebarRoot.innerHTML = `
        <aside class="sidebar" id="sidebar" role="navigation" aria-label="Menu chính">
            <div class="sidebar-logo">
                <div class="logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="logo-text">
                    <span>MedVision AI</span>
                    <span>Medical Imaging</span>
                </div>
            </div>

            <nav class="sidebar-nav" aria-label="Chức năng chính">
                <div class="nav-section">
                    <div class="nav-section-title">Chức năng chính</div>
                    ${menuItems.map(item => `
                    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}"
                       aria-current="${activePage === item.id ? 'page' : 'false'}">
                        <span class="nav-icon"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
                        <span>${item.label}</span>
                    </a>`).join('')}
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Hệ thống</div>
                    ${systemItems.map(item => `
                    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}"
                       aria-current="${activePage === item.id ? 'page' : 'false'}">
                        <span class="nav-icon"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
                        <span>${item.label}</span>
                    </a>`).join('')}
                </div>
            </nav>

            <div class="sidebar-user">
                <div class="user-avatar" aria-hidden="true">${initials}</div>
                <div class="user-info">
                    <div class="user-name" title="${escapeHtml(user.fullName)}">${escapeHtml(user.fullName)}</div>
                    <div class="user-role">${escapeHtml(user.specialty || 'Chẩn đoán hình ảnh')}</div>
                </div>
                <button class="user-logout" title="Đăng xuất" onclick="logout()" aria-label="Đăng xuất">
                    <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                </button>
            </div>
        </aside>
    `;
}

/**
 * Render page header
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {string} actionsHtml - HTML for action buttons (optional)
 */
function renderPageHeader(title, subtitle, actionsHtml = '') {
    const headerRoot = document.getElementById('header-root');
    if (!headerRoot) return;

    headerRoot.innerHTML = `
        <header class="page-header" role="banner">
            <div class="page-header-left">
                <div>
                    <h1 class="page-title">${escapeHtml(title)}</h1>
                    <p class="page-subtitle">${escapeHtml(subtitle)}</p>
                </div>
            </div>
            <div class="page-header-right">
                <div class="badge badge-success badge-dot">Hệ thống hoạt động</div>
                ${actionsHtml}
            </div>
        </header>
    `;
}

/**
 * Initialize page layout — call at DOM ready
 */
function initPageLayout(activePage, title, subtitle, actionsHtml) {
    renderSidebar(activePage);
    renderPageHeader(title, subtitle, actionsHtml);
}
