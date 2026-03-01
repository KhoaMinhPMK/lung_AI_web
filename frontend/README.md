# MedVision AI — Frontend

Hệ thống hỗ trợ chẩn đoán tổn thương phổi bằng AI (YOLOv8).

## Cấu trúc thư mục

```
frontend/
├── index.html              # Dashboard
├── login.html              # Đăng nhập
├── diagnosis.html          # Chẩn đoán MRI (upload + AI chat)
├── patients.html           # Quản lý bệnh nhân
├── patient-detail.html     # Chi tiết bệnh nhân
├── statistics.html         # Thống kê & Báo cáo
├── settings.html           # Cài đặt hệ thống
└── assets/
    ├── css/                # 10+ CSS files (design system)
    │   ├── variables.css   # CSS custom properties
    │   ├── base.css        # Reset, typography
    │   ├── components.css  # Buttons, cards, modals, pagination
    │   ├── layout.css      # Sidebar, grid
    │   ├── dashboard.css   # Dashboard-specific
    │   ├── diagnosis.css   # Diagnosis page + windowing + doctor form
    │   ├── patients.css    # Patients table
    │   ├── chat.css        # AI Chat panel
    │   ├── statistics.css  # Charts & stats
    │   └── settings.css    # Settings page
    └── js/
        ├── utils.js        # Shared utilities (escapeHtml, Store, toast)
        ├── auth.js         # Authentication (checkAuth, logout, session)
        ├── components.js   # Shared sidebar/header (DRY)
        ├── dashboard.js    # Dashboard charts
        ├── diagnosis.js    # MRI upload, windowing, multi-image
        ├── chat.js         # AI chat (XSS-safe, conversation memory)
        ├── patients.js     # Patient CRUD, pagination, sort
        ├── patient-detail.js
        ├── statistics.js   # Charts & date filters
        └── services/
            ├── api.js              # HTTP client wrapper
            ├── ai-service.js       # LLM abstraction layer
            └── detection-service.js # YOLO API service
```

## Chạy dev server

```bash
cd frontend
python -m http.server 8765
# Truy cập: http://localhost:8765/login.html
```

## Tài khoản demo

- Username: bất kỳ
- Password: bất kỳ
- (Demo mode — chấp nhận mọi credentials)

## Tính năng chính

1. **Chẩn đoán AI** — Upload nhiều ảnh MRI (PNG), AI phân tích + bounding box
2. **Windowing** — Điều chỉnh brightness/contrast cho ảnh y khoa
3. **Doctor Conclusion** — Form kết luận bác sĩ + ICD-10
4. **Chat AI** — Hỏi đáp y khoa, context-aware, conversation memory
5. **Quản lý bệnh nhân** — CRUD, pagination, sort, search
6. **Thống kê** — 5 biểu đồ Chart.js, AI tổng hợp
7. **Auth guard** — Bảo vệ trang, auto-logout timeout
