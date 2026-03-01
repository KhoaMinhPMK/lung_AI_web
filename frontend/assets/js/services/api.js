// ==========================================
// MedVision AI — API Client Service
// ==========================================

/**
 * HTTP Client wrapper for backend API communication
 * Handles auth headers, errors, timeouts, and retries
 */
const ApiClient = {
    baseUrl: '', // Will be set from settings when backend is ready
    timeout: 30000, // 30 seconds default

    /**
     * Initialize API client from settings
     */
    init() {
        const settings = Store.get('settings', {});
        this.baseUrl = settings.apiBaseUrl || window.location.origin + '/api';
        this.timeout = settings.apiTimeout || 30000;
    },

    /**
     * Get auth headers
     */
    _getHeaders() {
        const user = Store.get('user');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }
        return headers;
    },

    /**
     * Generic fetch wrapper with error handling
     */
    async _request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method,
            headers: this._getHeaders(),
            signal: AbortSignal.timeout(this.timeout)
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                // Unauthorized — session expired
                Store.remove('user');
                window.location.href = 'login.html';
                throw new Error('Session expired');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                throw new Error('Yêu cầu hết thời gian chờ. Vui lòng thử lại.');
            }
            throw error;
        }
    },

    /**
     * Upload file(s)
     */
    async upload(endpoint, files, additionalData = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const formData = new FormData();

        if (Array.isArray(files)) {
            files.forEach((file, i) => formData.append('files', file));
        } else {
            formData.append('file', files);
        }

        Object.entries(additionalData).forEach(([key, val]) => {
            formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
        });

        const user = Store.get('user');
        const headers = {};
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                signal: AbortSignal.timeout(60000) // 60s for uploads
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Upload failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Upload hết thời gian chờ. File có thể quá lớn.');
            }
            throw error;
        }
    },

    // Convenience methods
    get(endpoint) { return this._request('GET', endpoint); },
    post(endpoint, data) { return this._request('POST', endpoint, data); },
    put(endpoint, data) { return this._request('PUT', endpoint, data); },
    delete(endpoint) { return this._request('DELETE', endpoint); }
};

// Auto-initialize
ApiClient.init();
