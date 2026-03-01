// ==========================================
// MedVision AI — Auth Logic
// ==========================================

/**
 * Check if user is authenticated
 * Redirects to login page if not authenticated
 * Call this at the top of every protected page
 */
function checkAuth() {
    const user = Store.get('user');
    if (!user || !user.loginAt) {
        // Not logged in — redirect to login
        window.location.href = 'login.html';
        return false;
    }

    // Check auto-logout timeout (default 30 minutes)
    const settings = Store.get('settings', {});
    const timeoutMinutes = settings.autoLogoutMinutes || 30;
    const loginTime = new Date(user.loginAt).getTime();
    const now = Date.now();
    const elapsed = (now - loginTime) / 1000 / 60; // in minutes

    if (elapsed > timeoutMinutes) {
        logout();
        return false;
    }

    // Update last active time
    user.lastActive = new Date().toISOString();
    Store.set('user', user);

    return true;
}

/**
 * Get current logged-in user
 */
function getCurrentUser() {
    return Store.get('user', null);
}

/**
 * Logout — clear session and redirect
 */
function logout() {
    Store.remove('user');
    showToast('info', 'Đã đăng xuất', 'Bạn đã được đăng xuất khỏi hệ thống.');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

/**
 * Initialize login page logic
 */
function initLoginPage() {
    const form = document.getElementById('loginForm');
    const toggleBtn = document.getElementById('togglePassword');

    // If already logged in, redirect to dashboard
    const user = Store.get('user');
    if (user && user.loginAt) {
        window.location.href = 'index.html';
        return;
    }

    // Toggle password visibility
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = document.getElementById('password');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggleBtn.classList.toggle('fa-eye');
            toggleBtn.classList.toggle('fa-eye-slash');
        });
    }

    // Handle login
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu.');
                return;
            }

            // Show loading
            const loginText = document.getElementById('loginText');
            const loginSpinner = document.getElementById('loginSpinner');
            const btn = document.getElementById('btnLogin');

            loginText.classList.add('d-none');
            loginSpinner.classList.remove('d-none');
            btn.disabled = true;

            // Simulate login (demo mode — accept any credentials)
            setTimeout(() => {
                // Store user session
                const user = {
                    id: 1,
                    username: username,
                    fullName: 'Bác sĩ Nguyễn Văn A',
                    specialty: 'Chẩn đoán hình ảnh',
                    role: 'doctor',
                    loginAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                };

                Store.set('user', user);
                showToast('success', 'Đăng nhập thành công', `Chào mừng ${user.fullName}!`);

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 600);
            }, 1200);
        });
    }
}

// Auto-initialize login page if loginForm exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }
});
