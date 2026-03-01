# 📋 PROJECT BRIEF — HỆ THỐNG HỖ TRỢ CHẨN ĐOÁN KHỐI U PHỔI BẰNG AI

> **Tên dự án:** MedVision AI — AI-Powered Lung Tumor Detection System  
> **Khách hàng:** Thanh Nam  
> **Ngày bắt đầu:** 01/03/2026  
> **Công nghệ:** HTML, CSS, JavaScript (Frontend) + Python FastAPI (Backend) + YOLOv8 (AI Model) + LLM API  
> **Model đã train:** `best.pt` (có sẵn trong thư mục `model/`)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Bối cảnh & Vấn đề

Trong thực tế lâm sàng, bác sĩ chẩn đoán hình ảnh phải phân tích **hàng trăm lát cắt MRI** cho mỗi ca bệnh. Khối lượng công việc lớn dẫn đến:

- **Áp lực thời gian:** Mỗi ca bệnh mất 15–30 phút phân tích thủ công, trong khi lượng bệnh nhân ngày càng tăng.
- **Nguy cơ bỏ sót:** Mắt người có giới hạn. Các khối u nhỏ (dưới 5mm) hoặc nằm ở vị trí khó quan sát dễ bị bỏ qua, đặc biệt khi bác sĩ mệt mỏi.
- **Thiếu thông tin định lượng:** Bác sĩ thường ước lượng kích thước bằng mắt, thiếu số liệu chính xác để theo dõi tiến triển bệnh qua từng lần tái khám.
- **Hậu quả nghiêm trọng:** Chẩn đoán sai hoặc bỏ sót có thể dẫn đến phát hiện ung thư muộn, giảm cơ hội điều trị thành công.

### 1.2. Giải pháp đề xuất

Xây dựng một **hệ thống web** tích hợp trí tuệ nhân tạo (AI) giúp:

1. **Tự động phát hiện khối u:** Model AI quét từng ảnh MRI, đánh dấu vùng nghi ngờ chứa khối u với bounding box.
2. **Tính toán kích thước:** Ước tính kích thước thực tế (mm) của khối u dựa trên tỷ lệ pixel của ảnh MRI.
3. **Phân tích & Đánh giá:** Tích hợp LLM phân tích mức độ nguy hiểm, vị trí, đưa ra nhận định tham khảo.
4. **Quản lý bệnh nhân:** Hệ thống lưu trữ hồ sơ, lịch sử khám, ảnh MRI theo từng bệnh nhân.
5. **Thống kê & Báo cáo:** Dashboard tổng hợp dữ liệu, biểu đồ phân tích, xuất báo cáo PDF cho bác sĩ.

### 1.3. Đối tượng sử dụng

| Vai trò | Mô tả |
|---------|--------|
| **Bác sĩ chẩn đoán hình ảnh** | Người dùng chính. Upload ảnh MRI, xem kết quả AI, quản lý bệnh nhân. |
| **Bác sĩ điều trị** | Nhận kết quả từ bác sĩ hình ảnh, dựa vào phân tích AI để đưa ra quyết định điều trị. |
| **Sinh viên y khoa / Nghiên cứu** | Sử dụng hệ thống như công cụ tham khảo, học tập. |

---

## 2. PHÂN TÍCH NGHIỆP VỤ CHUYÊN MÔN (DOMAIN ANALYSIS)

### 2.1. Quy trình chẩn đoán hiện tại (Chưa có AI)

```
Bệnh nhân → Chụp MRI phổi → Bác sĩ xem TỪNG lát cắt bằng mắt
→ Đánh dấu vùng nghi ngờ thủ công → Ước lượng kích thước bằng mắt
→ Viết kết luận → Gửi cho bác sĩ điều trị
```

**Nhược điểm:**
- Phụ thuộc hoàn toàn vào kinh nghiệm và trạng thái tinh thần bác sĩ.
- Không có số liệu định lượng (kích thước, tọa độ) chính xác.
- Không có hệ thống lưu trữ và so sánh kết quả giữa các lần tái khám.

### 2.2. Quy trình chẩn đoán với MedVision AI

```
Bệnh nhân → Chụp MRI phổi → Upload lên hệ thống MedVision AI
→ AI tự động quét & phát hiện khối u (< 5 giây)
→ Hiển thị kết quả: Bounding box + Kích thước + Độ tin cậy
→ LLM phân tích bổ sung: Mức độ nguy hiểm, đề xuất tham khảo
→ Bác sĩ review kết quả AI → Đưa ra kết luận cuối cùng
→ Lưu vào hồ sơ bệnh nhân → Xuất báo cáo PDF
```

**Ưu điểm:**
- AI hỗ trợ "mắt thứ hai", giảm thiểu bỏ sót.
- Cung cấp số liệu chính xác, có thể so sánh giữa các lần tái khám.
- Giảm thời gian phân tích từ 15–30 phút xuống còn < 1 phút/ca.

### 2.3. Thuật ngữ y khoa quan trọng

| Thuật ngữ | Giải thích | Liên quan đến hệ thống |
|-----------|------------|------------------------|
| **MRI (Magnetic Resonance Imaging)** | Chụp cộng hưởng từ, tạo ảnh lát cắt cơ thể không dùng tia X. | Input chính của hệ thống. |
| **Lát cắt (Slice)** | Một "tấm" ảnh 2D trong chuỗi MRI 3D. Mỗi ca bệnh có thể lên tới 100–300 lát cắt. | Mỗi lát cắt được upload và phân tích riêng. |
| **Bounding Box** | Khung hình chữ nhật bao quanh vùng phát hiện khối u trên ảnh. | Output trực quan của model YOLO. |
| **Confidence Score (Độ tin cậy)** | Xác suất model tin rằng vùng đánh dấu thực sự chứa khối u (0%–100%). | Hiển thị cho bác sĩ đánh giá mức tin cậy. |
| **Nodule (Nốt)** | Khối tổn thương nhỏ trong phổi, có thể lành tính hoặc ác tính. | Đối tượng chính mà model phát hiện. |
| **Malignant/Benign** | Ác tính / Lành tính. Đặc điểm quan trọng nhất bác sĩ cần đánh giá. | LLM sẽ đưa ra nhận định tham khảo. |
| **PNG (Portable Network Graphics)** | Định dạng ảnh không nén mất dữ liệu, giữ nguyên chất lượng gốc. Model YOLO được train với ảnh PNG. | Định dạng input chính của hệ thống. |

### 2.4. Lưu ý quan trọng về y tế

> ⚠️ **AI là công cụ HỖ TRỢ, KHÔNG thay thế bác sĩ.**  
> Kết quả của AI chỉ mang tính chất tham khảo. Quyết định chẩn đoán và điều trị cuối cùng thuộc về bác sĩ chuyên khoa. Hệ thống cần hiển thị rõ ràng disclaimer này trên giao diện.

---

## 3. MÔ TẢ CHI TIẾT TỪNG TÍNH NĂNG

### 3.1. ĐĂNG NHẬP & BẢO MẬT

**Mục đích:** Bảo vệ dữ liệu bệnh nhân, chỉ cho phép nhân viên y tế có quyền truy cập.

**Chi tiết chức năng:**
- Form đăng nhập: Username + Password.
- Phân quyền đơn giản: Admin (quản lý toàn bộ) và Doctor (chỉ xem/tạo bệnh nhân và chẩn đoán).
- Session-based hoặc JWT token để duy trì trạng thái đăng nhập.
- Tự động đăng xuất sau 30 phút không hoạt động (bảo mật dữ liệu y tế).

**Mô tả UI — Trang Login:**
- Nền gradient xanh dương y tế → trắng.
- Ở giữa màn hình: Card đăng nhập bo tròn, có hiệu ứng glassmorphism (nền mờ trong suốt).
- Logo hệ thống "MedVision AI" + icon não/phổi cách điệu phía trên form.
- 2 field input: Tên đăng nhập, Mật khẩu (có icon mắt để show/hide password).
- Nút "Đăng nhập" lớn, gradient xanh → xanh nhạt, có hiệu ứng hover phát sáng.
- Footer nhỏ: "© 2026 MedVision AI — Hệ thống hỗ trợ chẩn đoán y khoa".

---

### 3.2. DASHBOARD — TRANG TỔNG QUAN

**Mục đích:** Cung cấp cái nhìn toàn diện về hoạt động hệ thống ngay khi bác sĩ đăng nhập.

**Chi tiết chức năng:**
- Hiển thị **4 thẻ thống kê nhanh** (Summary Cards):
  - 🏥 Tổng số bệnh nhân đã đăng ký.
  - 🔬 Tổng số ca đã chẩn đoán (tổng số ảnh MRI đã phân tích).
  - ⚠️ Số ca phát hiện có khối u.
  - ✅ Số ca bình thường (không u).
- **Biểu đồ cột:** Số ca chẩn đoán theo tháng (12 tháng gần nhất).
- **Biểu đồ tròn:** Tỷ lệ phát hiện có u vs. không u.
- **Biểu đồ đường:** Xu hướng kích thước trung bình khối u theo thời gian (theo dõi diễn biến bệnh nhân tái khám).
- **Danh sách hoạt động gần đây:** 5 ca chẩn đoán mới nhất (Tên BN, Ngày, Kết quả).

**Mô tả UI — Dashboard:**
- **Sidebar trái (cố định 260px):**
  - Logo "MedVision AI" trên cùng.
  - Các mục menu:
    - 📊 Dashboard (active — highlight xanh)
    - 🔬 Chẩn đoán mới
    - 👥 Quản lý bệnh nhân
    - 📈 Thống kê & Báo cáo
    - ⚙️ Cài đặt
  - Phía dưới cùng: Avatar + Tên bác sĩ + Nút đăng xuất.
  - Sidebar có nền tối (Dark navy: `#0f172a`), chữ trắng, icon sáng.
- **Vùng nội dung chính (Main Content):**
  - Nền xám nhạt (`#f1f5f9`).
  - Header: "Xin chào, Bác sĩ [Tên]!" + Ngày hôm nay.
  - 4 Summary Cards xếp hàng ngang, mỗi card có icon lớn, số lớn (font-size 32px, đậm), tiêu đề nhỏ bên dưới. Card có hiệu ứng hover nhẹ (nâng lên + shadow đậm hơn).
  - Bên dưới: 2 biểu đồ xếp cạnh nhau (Biểu đồ cột trái, Biểu đồ tròn phải). Dùng Chart.js, màu pastel xanh/cam.
  - Bảng "Hoạt động gần đây" với các cột: STT, Bệnh nhân, Ngày khám, Kết quả, Hành động (nút "Xem chi tiết").

---

### 3.3. CHẨN ĐOÁN MỚI — TRANG PHÂN TÍCH MRI (Core Feature)

Đây là **trang quan trọng nhất** của hệ thống, nơi bác sĩ tương tác trực tiếp với AI.

**Chi tiết chức năng:**

#### A. Upload & Chọn ảnh MRI
- **Drag & Drop hoặc Click:** Khu vực upload lớn, hỗ trợ kéo thả file ảnh PNG (định dạng chuẩn của model YOLO).
- **Chọn từ thư viện mẫu:** Nút "Dùng ảnh mẫu" để test nhanh với data MRI có sẵn trong hệ thống.
- **Chọn bệnh nhân:** Dropdown chọn bệnh nhân đã có trong hệ thống. Nếu bệnh nhân mới, có nút "Tạo mới nhanh".
- **Preview ảnh:** Sau khi chọn, ảnh gốc hiển thị ngay ở vùng xem trước (zoom in/out được).
- **Nút "Phân tích AI":** Kích hoạt quá trình gửi ảnh lên server.

#### B. Kết quả phát hiện khối u (AI Detection Result)
- **Ảnh kết quả:** Hiển thị ảnh MRI gốc với **bounding box** vẽ lên vùng chứa khối u (màu đỏ/cam nổi bật).
- **So sánh Before/After:** Có slider hoặc tab chuyển đổi giữa ảnh gốc và ảnh đã đánh dấu.
- **Bảng kết quả chi tiết** cho mỗi khối u phát hiện được:

| Thông số | Giá trị mẫu | Giải thích |
|----------|-------------|------------|
| **Số lượng khối u** | 2 | Tổng số vùng phát hiện. |
| **Độ tin cậy (Confidence)** | 94.7% | Xác suất model tin rằng đây là khối u. |
| **Vị trí (tọa độ)** | (x: 234, y: 156) | Tọa độ tâm bounding box trên ảnh. |
| **Kích thước ước tính** | 12.3 mm × 8.7 mm | Tính từ bounding box kết hợp tỷ lệ pixel spacing do bác sĩ cấu hình. |
| **Diện tích ước tính** | 107.01 mm² | Diện tích bounding box quy đổi. |
| **Vị trí giải phẫu (nếu có)** | Thùy phải, phân thùy trên | Phân tích dựa trên vị trí trên ảnh (LLM hỗ trợ). |

- **Đánh giá mức độ nghiêm trọng (Severity):**
  - 🟢 **Thấp:** Kích thước < 6mm, confidence thấp → "Theo dõi định kỳ"
  - 🟡 **Trung bình:** 6mm – 15mm → "Cần theo dõi sát, sinh thiết nếu cần"
  - 🔴 **Cao:** > 15mm hoặc hình dạng bất thường → "Cần can thiệp ngay"

#### C. Tính toán kích thước khối u (Tumor Size Estimation)
- **Cơ chế tính:** Vì ảnh PNG không chứa metadata y khoa, bác sĩ sẽ nhập tỷ lệ pixel spacing (mm/pixel) dựa trên thông số máy chụp MRI. Hệ thống lưu cấu hình này để tái sử dụng.
- **Công thức:**
  - `Kích thước thực (mm) = Kích thước bounding box (pixel) × Pixel Spacing (mm/pixel)`
- **Cấu hình mặc định:** Hệ thống cung cấp giá trị pixel spacing mặc định phổ biến, bác sĩ có thể điều chỉnh.
- **Hiển thị:** Thanh thước kẻ trên ảnh kết quả (scale bar) cho trực quan.

#### D. Khung Chat AI — Trợ lý Y khoa (AI Medical Assistant)
- **Vị trí:** Panel bên phải của trang Chẩn đoán (chiếm khoảng 35% chiều rộng).
- **Chức năng:**
  - Bác sĩ nhập câu hỏi bằng text → LLM trả lời dựa trên context kết quả chẩn đoán hiện tại.
  - **Tự động kích hoạt:** Sau khi có kết quả phân tích, LLM tự động sinh ra một đoạn nhận xét ban đầu tổng hợp kết quả.
  - **Prompt mẫu từ hệ thống tới LLM:**
    ```
    Bạn là trợ lý chẩn đoán y khoa chuyên về ung thư phổi. 
    Kết quả phân tích ảnh MRI cho thấy:
    - Phát hiện [N] khối u tại vị trí [tọa độ].
    - Kích thước ước tính: [X] mm × [Y] mm.
    - Độ tin cậy: [Z]%.
    Thông tin bệnh nhân: [Tuổi], [Giới tính], [Tiền sử bệnh].
    
    Hãy đưa ra nhận định tham khảo về:
    1. Mức độ nguy hiểm tiềm tàng.
    2. Vị trí giải phẫu có thể.
    3. Đề xuất các bước tiếp theo (tham khảo).
    
    LƯU Ý: Đây chỉ là nhận định tham khảo của AI, 
    không thay thế chẩn đoán của bác sĩ chuyên khoa.
    ```
  - **Các câu hỏi gợi ý (Quick Questions):** Bên dưới ô chat, hiển thị 3–4 nút câu hỏi nhanh:
    - "Kích thước này có nguy hiểm không?"
    - "Cần làm thêm xét nghiệm gì?"
    - "So sánh với lần khám trước"
    - "Tạo báo cáo tóm tắt"

**Mô tả UI — Trang Chẩn đoán:**
- **Layout chia đôi:** Bên trái (65%) + Bên phải (35%).
- **Bên trái — Khu vực ảnh:**
  - Phía trên: Thanh công cụ nhỏ (Nút Upload, Nút chọn ảnh mẫu, Dropdown chọn bệnh nhân) trên nền trắng.
  - Giữa: Vùng hiển thị ảnh lớn (nền tối `#1e293b` cho ảnh MRI nổi bật), có thanh zoom ở góc phải. Trước khi upload, hiển thị icon upload lớn + text "Kéo thả ảnh MRI vào đây".
  - Bên dưới ảnh: Bảng kết quả chi tiết (bảng có viền mỏng, font monospace cho số liệu).
  - Nút lớn "🔍 Bắt đầu phân tích AI" (gradient xanh, có loading spinner khi đang xử lý).
- **Bên phải — Panel Chat AI:**
  - Header: "🤖 Trợ lý Y khoa AI" với đèn trạng thái xanh (online).
  - Vùng tin nhắn: Tin hệ thống nền xanh nhạt (bên trái), tin người dùng nền trắng (bên phải). Hiệu ứng typing indicator khi AI đang trả lời.
  - Quick question buttons phía trên ô nhập liệu.
  - Ô nhập liệu: Input text + nút gửi (icon mũi tên), hỗ trợ Enter để gửi.
- **Khi đang phân tích:** Overlay loading toàn trang với animation sóng não / DNA helix xoay, text "Đang phân tích ảnh MRI bằng AI..." (animation fade in/out).

---

### 3.4. QUẢN LÝ BỆNH NHÂN

**Mục đích:** Lưu trữ, tìm kiếm, quản lý hồ sơ toàn bộ bệnh nhân trong hệ thống.

**Chi tiết chức năng:**

#### A. Danh sách bệnh nhân
- Bảng hiển thị tất cả bệnh nhân: Mã BN, Họ tên, Tuổi, Giới tính, Ngày khám gần nhất, Số lần chẩn đoán, Trạng thái.
- **Tìm kiếm:** Thanh search realtime theo tên hoặc mã BN.
- **Bộ lọc:** Lọc theo giới tính, độ tuổi, trạng thái (Đang theo dõi / Hoàn tất / Mới).
- **Sắp xếp:** Click header cột để sắp xếp tăng/giảm.
- **Phân trang:** 20 bệnh nhân/trang.

#### B. Thêm mới bệnh nhân
- **Form nhập liệu** với các trường:
  - Mã bệnh nhân (tự sinh hoặc nhập thủ công).
  - Họ và tên (*bắt buộc*).
  - Ngày sinh (*bắt buộc*).
  - Giới tính (Nam / Nữ / Khác).
  - Số điện thoại.
  - Địa chỉ.
  - Tiền sử bệnh (textarea chi tiết — quan trọng cho AI phân tích).
  - Ghi chú bác sĩ.
- Validation: Kiểm tra các trường bắt buộc, format số điện thoại, tuổi hợp lệ.

#### C. Hồ sơ chi tiết bệnh nhân
- **Tab Thông tin cá nhân:** Hiển thị/chỉnh sửa các trường thông tin.
- **Tab Lịch sử chẩn đoán:** Timeline dọc hiển thị tất cả các lần chẩn đoán:
  - Mỗi entry: Ngày khám, Ảnh thumbnail MRI, Kết quả (có u/không u), Kích thước u (nếu có), Link "Xem chi tiết".
  - **Biểu đồ theo dõi:** Đồ thị kích thước khối u qua các lần khám (Line chart) — giúp bác sĩ đánh giá khối u đang tăng/giảm/ổn định.
- **Tab Báo cáo:** Danh sách báo cáo đã xuất, nút tạo báo cáo mới.

**Mô tả UI — Trang Quản lý Bệnh nhân:**
- Header trang: "👥 Quản lý Bệnh nhân" + Nút "+ Thêm bệnh nhân mới" (góc phải, nền xanh lá).
- Thanh tìm kiếm lớn phía trên bảng, với icon kính lúp và filter chips bên cạnh.
- Bảng dữ liệu: Zebra striping (xen kẽ trắng / xám cực nhạt), hover highlight. Cột "Hành động" có icon 👁️ Xem, ✏️ Sửa, 🗑️ Xóa.
- Modal thêm mới: Slide từ phải vào (panel 450px), overlay tối nền phía sau. Form sạch sẽ, nhóm các trường liên quan, nút "Lưu" + "Hủy" ở footer modal.
- Trang chi tiết BN: Tab navigation phía trên (Info / Lịch sử / Báo cáo). Timeline lịch sử dùng dạng card dọc với đường kẻ timeline bên trái.

---

### 3.5. THỐNG KÊ & BÁO CÁO

**Mục đích:** Tổng hợp dữ liệu, sinh biểu đồ phân tích và xuất báo cáo phục vụ nghiên cứu & báo cáo y khoa.

**Chi tiết chức năng:**

#### A. Dashboard Thống kê nâng cao
- **Biểu đồ phân bố kích thước khối u:** Histogram — trục X là kích thước (mm), trục Y là số ca.
- **Biểu đồ phân bố theo độ tuổi:** Nhóm tuổi nào hay gặp u phổi nhất.
- **Biểu đồ theo giới tính:** So sánh tỉ lệ phát hiện u giữa Nam và Nữ.
- **Biểu đồ theo thời gian:** Trend line số ca phát hiện theo tháng/quý.
- **Bộ lọc thời gian:** Chọn khoảng thời gian (7 ngày / 30 ngày / 3 tháng / 1 năm / Tùy chỉnh).

#### B. Tổng hợp ca bệnh bằng AI
- **Nút "AI Tổng hợp":** LLM đọc toàn bộ dữ liệu trong khoảng thời gian chọn và sinh ra bản báo cáo tự động:
  - Tóm tắt tổng quan số ca bệnh.
  - Nhận xét xu hướng (ví dụ: "Số ca phát hiện khối u có xu hướng tăng 15% trong quý 3").
  - Phân tích top 5 ca có kích thước u lớn nhất.
  - Đề xuất tham khảo (ví dụ: "Nên tăng tần suất tầm soát cho nhóm tuổi 50–65").

#### C. Xuất báo cáo
- **Xuất PDF:** Báo cáo từng ca bệnh hoặc báo cáo tổng hợp, gồm:
  - Header: Logo + Tên bệnh viện/phòng khám + Ngày.
  - Thông tin bệnh nhân.
  - Ảnh MRI gốc + ảnh kết quả AI đã đánh dấu.
  - Bảng số liệu chi tiết.
  - Nhận xét AI.
  - Chữ ký bác sĩ (placeholder).
- **Xuất Excel:** Bảng dữ liệu thô của tất cả các ca (Tên BN, Ngày, Kết quả, Kích thước, Confidence...) để bác sĩ dùng cho mục đích nghiên cứu.

**Mô tả UI — Trang Thống kê:**
- Grid layout 2 cột cho các biểu đồ, mỗi biểu đồ nằm trong card trắng bo tròn có shadow nhẹ.
- Thanh filter trên cùng: Date range picker (2 ô ngày bắt đầu/kết thúc) + Quick select buttons (7 ngày, 30 ngày, 3 tháng, 1 năm).
- Nút "📊 AI Tổng hợp" lớn, nổi bật (gradient tím/xanh), khi click mở modal hiển thị nội dung AI phân tích.
- Nút "📥 Xuất PDF" và "📥 Xuất Excel" nằm ở góc phải trên cùng.

---

### 3.6. CÀI ĐẶT HỆ THỐNG

**Chi tiết chức năng:**
- **Thông tin tài khoản:** Đổi mật khẩu, cập nhật thông tin cá nhân bác sĩ.
- **Cấu hình AI:** Chọn ngưỡng confidence threshold (mặc định 0.5), bác sĩ có thể tăng/giảm để lọc kết quả.
- **Cấu hình LLM:** Nhập API key cho LLM (OpenAI/Gemini), chọn model (GPT-4o, Gemini Pro...).
- **Quản lý người dùng (Admin only):** Thêm/xóa tài khoản bác sĩ, phân quyền.
- **Data mẫu:** Upload bộ data ảnh MRI mẫu để demo/test.

**Mô tả UI:**
- Layout form đơn giản, chia nhóm bằng các section card.
- Slider cho confidence threshold (có preview giá trị realtime).
- Toggle switch cho các cài đặt bật/tắt.

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN

```
Thanh_nam/
│
├── frontend/                          # ===== GIAO DIỆN NGƯỜI DÙNG =====
│   ├── index.html                     # Trang Dashboard (trang chủ sau đăng nhập)
│   ├── login.html                     # Trang đăng nhập
│   ├── diagnosis.html                 # Trang chẩn đoán MRI (trang chính)
│   ├── patients.html                  # Trang quản lý bệnh nhân
│   ├── patient-detail.html            # Trang chi tiết hồ sơ 1 bệnh nhân
│   ├── statistics.html                # Trang thống kê & báo cáo
│   ├── settings.html                  # Trang cài đặt hệ thống
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── variables.css          # CSS Custom Properties (màu, font, spacing)
│   │   │   ├── base.css               # Reset CSS, typography, global styles
│   │   │   ├── layout.css             # Sidebar, header, grid, responsive
│   │   │   ├── components.css         # Buttons, cards, modals, tables, forms
│   │   │   ├── dashboard.css          # Styles riêng cho dashboard
│   │   │   ├── diagnosis.css          # Styles riêng cho trang chẩn đoán
│   │   │   ├── patients.css           # Styles riêng cho quản lý BN
│   │   │   ├── statistics.css         # Styles riêng cho thống kê
│   │   │   └── chat.css               # Styles cho khung chat AI
│   │   │
│   │   ├── js/
│   │   │   ├── api.js                 # Module gọi API (fetch wrapper, error handling)
│   │   │   ├── auth.js                # Xử lý đăng nhập/đăng xuất, JWT token
│   │   │   ├── dashboard.js           # Logic render biểu đồ dashboard
│   │   │   ├── diagnosis.js           # Logic upload ảnh, gọi API detect, render kết quả
│   │   │   ├── patients.js            # CRUD bệnh nhân, tìm kiếm, phân trang
│   │   │   ├── patient-detail.js      # Xử lý timeline, chart theo dõi từng BN
│   │   │   ├── statistics.js          # Render biểu đồ thống kê nâng cao
│   │   │   ├── chat.js                # Logic khung chat, gọi LLM API, render tin nhắn
│   │   │   ├── report.js              # Logic xuất PDF/Excel (html2pdf, SheetJS)
│   │   │   └── utils.js              # Hàm tiện ích chung (format date, validate, notify)
│   │   │
│   │   ├── images/                    # Logo, icon, ảnh nền hệ thống
│   │   │   ├── logo.png
│   │   │   ├── logo-white.png
│   │   │   └── bg-login.jpg
│   │   │
│   │   └── libs/                      # Thư viện JS bên thứ 3 (nếu không dùng CDN)
│   │       ├── chart.min.js           # Chart.js
│   │       ├── html2pdf.min.js        # Xuất PDF
│   │       └── xlsx.min.js            # Xuất Excel (SheetJS)
│   │
│   └── sample_data/                   # Data ảnh MRI mẫu để test (cung cấp cho khách)
│       ├── mri_sample_01.png
│       ├── mri_sample_02.png
│       ├── mri_sample_03_no_tumor.png
│       └── README.txt                 # Mô tả nguồn gốc ảnh mẫu
│
├── backend/                           # ===== MÁY CHỦ API & AI MODEL =====
│   ├── app.py                         # Entry point — Khởi tạo FastAPI app, đăng ký routes
│   ├── config.py                      # Cấu hình: DB path, model path, API keys, thresholds
│   │
│   ├── routes/                        # Định nghĩa các API endpoint
│   │   ├── auth_routes.py             # POST /api/login, POST /api/logout
│   │   ├── detect_routes.py           # POST /api/detect (nhận ảnh, trả kết quả)
│   │   ├── patient_routes.py          # CRUD /api/patients
│   │   ├── diagnosis_routes.py        # GET /api/diagnoses (lịch sử chẩn đoán)
│   │   ├── statistics_routes.py       # GET /api/statistics (dữ liệu biểu đồ)
│   │   └── llm_routes.py             # POST /api/chat (gọi LLM)
│   │
│   ├── services/                      # Logic nghiệp vụ
│   │   ├── inference.py               # Load model best.pt, chạy detection, tính kích thước
│   │   ├── llm_service.py             # Kết nối & gọi LLM API (OpenAI/Gemini)
│   │   ├── db_service.py              # Thao tác database (SQLite queries)
│   │   ├── report_service.py          # Sinh báo cáo PDF phía server (nếu cần)
│   │   └── auth_service.py            # Xác thực, hash password, JWT
│   │
│   ├── database/
│   │   ├── schema.sql                 # SQL tạo bảng (patients, diagnoses, users)
│   │   └── medvision.db               # File database SQLite (auto-created)
│   │
│   ├── uploads/                       # Folder lưu ảnh upload tạm + ảnh kết quả
│   │   ├── originals/                 # Ảnh gốc upload
│   │   └── results/                   # Ảnh đã vẽ bounding box
│   │
│   └── requirements.txt              # Dependencies Python
│
├── model/
│   └── best.pt                        # ✅ File model đã train (CÓ SẴN)
│
├── docs/                              # Tài liệu dự án
│   ├── API_DOCUMENTATION.md           # Mô tả chi tiết các API endpoint
│   ├── DATABASE_SCHEMA.md             # Sơ đồ database
│   └── USER_GUIDE.md                  # Hướng dẫn sử dụng cho bác sĩ
│
├── PROJECT_BRIEF.md                   # ← File này
└── README.md                          # Hướng dẫn cài đặt & chạy project
```

---

## 5. THIẾT KẾ CƠ SỞ DỮ LIỆU

### Bảng `users` (Người dùng)
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | INTEGER PK | Khóa chính |
| username | TEXT UNIQUE | Tên đăng nhập |
| password_hash | TEXT | Mật khẩu đã mã hóa (bcrypt) |
| full_name | TEXT | Họ tên bác sĩ |
| role | TEXT | "admin" hoặc "doctor" |
| created_at | DATETIME | Ngày tạo |

### Bảng `patients` (Bệnh nhân)
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | INTEGER PK | Khóa chính |
| patient_code | TEXT UNIQUE | Mã bệnh nhân (VD: BN-20260301-001) |
| full_name | TEXT | Họ tên |
| date_of_birth | DATE | Ngày sinh |
| gender | TEXT | "Nam" / "Nữ" / "Khác" |
| phone | TEXT | Số điện thoại |
| address | TEXT | Địa chỉ |
| medical_history | TEXT | Tiền sử bệnh (quan trọng cho LLM) |
| notes | TEXT | Ghi chú bác sĩ |
| status | TEXT | "Đang theo dõi" / "Hoàn tất" / "Mới" |
| created_at | DATETIME | Ngày tạo hồ sơ |
| updated_at | DATETIME | Ngày cập nhật gần nhất |

### Bảng `diagnoses` (Chẩn đoán)
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | INTEGER PK | Khóa chính |
| patient_id | INTEGER FK | Liên kết tới patients.id |
| doctor_id | INTEGER FK | Bác sĩ thực hiện |
| original_image | TEXT | Đường dẫn ảnh MRI gốc |
| result_image | TEXT | Đường dẫn ảnh đã đánh dấu |
| num_tumors | INTEGER | Số khối u phát hiện |
| has_tumor | BOOLEAN | Có phát hiện u hay không |
| detections_json | TEXT | JSON chi tiết: [{x, y, w, h, confidence, size_mm},...] |
| severity | TEXT | "low" / "medium" / "high" |
| ai_summary | TEXT | Nhận xét tổng hợp từ LLM |
| doctor_conclusion | TEXT | Kết luận cuối cùng của bác sĩ |
| created_at | DATETIME | Thời điểm chẩn đoán |

### Bảng `chat_history` (Lịch sử chat AI)
| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | INTEGER PK | Khóa chính |
| diagnosis_id | INTEGER FK | Liên kết tới diagnoses.id |
| role | TEXT | "user" / "assistant" |
| message | TEXT | Nội dung tin nhắn |
| created_at | DATETIME | Thời điểm gửi |

---

## 6. DANH SÁCH API ENDPOINTS

| Method | Endpoint | Mô tả | Input | Output |
|--------|----------|--------|-------|--------|
| POST | `/api/login` | Đăng nhập | {username, password} | {token, user_info} |
| POST | `/api/logout` | Đăng xuất | Header: Bearer token | {success} |
| POST | `/api/detect` | Phân tích ảnh MRI | FormData: image file (PNG), patient_id | {detections, result_image_url, severity, size_info} |
| GET | `/api/patients` | Danh sách BN | Query: search, page, filter | {patients[], total, page} |
| POST | `/api/patients` | Thêm BN mới | {full_name, dob, gender, ...} | {patient} |
| GET | `/api/patients/:id` | Chi tiết 1 BN | Path: patient_id | {patient, diagnoses[]} |
| PUT | `/api/patients/:id` | Cập nhật BN | {full_name, phone, ...} | {patient} |
| DELETE | `/api/patients/:id` | Xóa BN | Path: patient_id | {success} |
| GET | `/api/diagnoses` | Lịch sử chẩn đoán | Query: patient_id, date_range | {diagnoses[]} |
| GET | `/api/diagnoses/:id` | Chi tiết 1 chẩn đoán | Path: diagnosis_id | {diagnosis, chat_history[]} |
| POST | `/api/chat` | Chat với LLM | {message, diagnosis_id} | {reply} |
| GET | `/api/statistics` | Dữ liệu thống kê | Query: date_from, date_to | {charts_data} |
| POST | `/api/statistics/ai-summary` | AI tổng hợp | {date_from, date_to} | {summary_text} |
| GET | `/api/report/:diagnosis_id/pdf` | Xuất PDF | Path: diagnosis_id | File PDF |
| GET | `/api/report/export-excel` | Xuất Excel | Query: date_range | File Excel |

---

## 7. CÔNG NGHỆ SỬ DỤNG

### Frontend
| Công nghệ | Mục đích | Phiên bản |
|-----------|---------|-----------|
| HTML5 | Cấu trúc trang | — |
| CSS3 (Vanilla) | Giao diện, responsive, animations | — |
| JavaScript (ES6+) | Logic, tương tác, gọi API | — |
| Chart.js | Vẽ biểu đồ thống kê | v4.x |
| html2pdf.js | Xuất báo cáo PDF phía client | v0.10.x |
| SheetJS (xlsx) | Xuất dữ liệu Excel | v0.20.x |
| Google Fonts (Inter) | Typography hiện đại | — |

### Backend
| Công nghệ | Mục đích | Phiên bản |
|-----------|---------|-----------|
| Python | Ngôn ngữ backend | 3.10+ |
| FastAPI | Web framework API | 0.100+ |
| Uvicorn | ASGI server | 0.23+ |
| Ultralytics (YOLOv8) | Load & chạy model best.pt | 8.x |
| PyTorch | Deep Learning runtime | 2.x |
| SQLite3 | Cơ sở dữ liệu nhẹ | Built-in |
| Pillow (PIL) | Xử lý ảnh (vẽ bbox, resize) | 10.x |
| python-jose | JWT token | — |
| bcrypt/passlib | Hash mật khẩu | — |
| OpenAI SDK / Google GenAI | Gọi LLM API | latest |
| python-multipart | Upload file | — |
| FPDF2 | Sinh PDF phía server | — |

---

## 8. DESIGN SYSTEM — HỆ THỐNG THIẾT KẾ

### 8.1. Bảng màu (Color Palette)

| Token | Hex | Sử dụng |
|-------|-----|---------|
| `--primary` | `#2563eb` | Nút chính, link, active state |
| `--primary-dark` | `#1d4ed8` | Hover state |
| `--primary-light` | `#dbeafe` | Nền nhạt highlight |
| `--secondary` | `#0f172a` | Sidebar, dark backgrounds |
| `--accent` | `#8b5cf6` | AI-related elements (chat, badge AI) |
| `--success` | `#10b981` | Kết quả tốt, trạng thái online |
| `--warning` | `#f59e0b` | Cảnh báo mức trung bình |
| `--danger` | `#ef4444` | Nguy hiểm, khối u severity cao |
| `--bg-main` | `#f1f5f9` | Nền trang chính |
| `--bg-card` | `#ffffff` | Nền card, bảng |
| `--text-primary` | `#1e293b` | Chữ chính |
| `--text-secondary` | `#64748b` | Chữ phụ, label |
| `--border` | `#e2e8f0` | Viền bảng, card |

### 8.2. Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Logo / App name | Inter | 24px | 800 (ExtraBold) |
| Page title (H1) | Inter | 28px | 700 (Bold) |
| Section title (H2) | Inter | 20px | 600 (SemiBold) |
| Body text | Inter | 14px | 400 (Regular) |
| Small / Caption | Inter | 12px | 400 |
| Data / Numbers | JetBrains Mono | 14px | 500 (Medium) |
| Button text | Inter | 14px | 600 |

### 8.3. Spacing & Border Radius

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--radius-sm` | 6px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--radius-full` | 9999px |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` |
| `--shadow-hover` | `0 4px 12px rgba(0,0,0,0.12)` |
| `--shadow-modal` | `0 8px 32px rgba(0,0,0,0.2)` |

---

## 9. LỘ TRÌNH TRIỂN KHAI (TIMELINE)

### Phase 1: Nền tảng (Ngày 1–3)
- [x] Phân tích yêu cầu, viết brief dự án ← **File này**
- [ ] Setup cấu trúc thư mục
- [ ] Code design system CSS (variables, base, components)
- [ ] Code layout Sidebar + Header (dùng chung tất cả trang)
- [ ] Setup Python FastAPI boilerplate
- [ ] Tạo database schema (SQLite)

### Phase 2: Core AI — Phát hiện khối u (Ngày 4–6)
- [ ] Backend: Viết `inference.py` — load `best.pt`, xử lý ảnh, tính kích thước
- [ ] Backend: API `/api/detect` — nhận ảnh, trả kết quả JSON + ảnh kết quả
- [ ] Frontend: Code trang `diagnosis.html` — UI upload, preview, hiển thị kết quả
- [ ] Frontend: Code `diagnosis.js` — logic gọi API, render bounding box, bảng thống kê
- [ ] Testing: Test với các ảnh MRI mẫu (có u + không u)

### Phase 3: Hệ thống Bệnh nhân (Ngày 7–9)
- [ ] Backend: API CRUD `/api/patients`
- [ ] Frontend: Code trang `patients.html` + `patient-detail.html`
- [ ] Frontend: Tìm kiếm realtime, phân trang, bộ lọc
- [ ] Liên kết chẩn đoán với bệnh nhân (lưu diagnosis → patient_id)
- [ ] Timeline lịch sử chẩn đoán từng bệnh nhân

### Phase 4: Dashboard & Thống kê (Ngày 10–11)
- [ ] Backend: API `/api/statistics` — truy vấn & tổng hợp dữ liệu
- [ ] Frontend: Code Dashboard với 4 summary cards + biểu đồ
- [ ] Frontend: Code trang Statistics — biểu đồ nâng cao (phân bố kích thước, tuổi, giới tính)
- [ ] Responsive design cho tất cả trang

### Phase 5: AI LLM & Chat (Ngày 12–13)
- [ ] Backend: `llm_service.py` — kết nối OpenAI/Gemini API
- [ ] Backend: API `/api/chat` — nhận câu hỏi + context, trả lời
- [ ] Frontend: Code khung Chat AI trên trang chẩn đoán
- [ ] Tự động sinh nhận xét khi có kết quả phát hiện
- [ ] Quick question buttons
- [ ] AI tổng hợp ca bệnh (trang thống kê)

### Phase 6: Báo cáo & Hoàn thiện (Ngày 14–16)
- [ ] Xuất PDF (từng ca + tổng hợp)
- [ ] Xuất Excel
- [ ] Trang Login + Auth (JWT)
- [ ] Trang Settings
- [ ] Chuẩn bị data mẫu MRI
- [ ] Testing toàn diện

### Phase 7: Bàn giao (Ngày 17–18)
- [ ] Viết tài liệu hướng dẫn sử dụng
- [ ] Viết tài liệu API
- [ ] Hỗ trợ cài đặt lên máy khách
- [ ] Hỗ trợ nội dung báo cáo đồ án (nếu cần)

---

## 10. RỦI RO & GIẢI PHÁP DỰ PHÒNG

| Rủi ro | Khả năng | Tác động | Giải pháp |
|--------|----------|----------|-----------|
| Model `best.pt` cho kết quả kém trên ảnh thực tế | Trung bình | Cao | Tinh chỉnh ngưỡng confidence, bổ sung data training |
| LLM API bị giới hạn tốc độ hoặc mất phí | Thấp | Trung bình | Dùng free tier Gemini, cache kết quả, fallback text tĩnh |
| Ảnh MRI kích thước lớn làm chậm upload | Trung bình | Thấp | Nén ảnh phía client trước khi upload, hiển thị progress bar |
| Backend cần GPU để chạy model nhanh | Trung bình | Trung bình | Hỗ trợ cả CPU mode (chậm hơn nhưng vẫn hoạt động) |
| Bảo mật dữ liệu bệnh nhân | — | Cao | Mã hóa password, JWT expire, HTTPS khuyến nghị |

---

## 11. GHI CHÚ BÀN GIAO

- **Mã nguồn:** Toàn bộ code frontend + backend được giao đầy đủ.
- **Tài liệu:** API docs, Database schema, User guide.
- **Data mẫu:** 10–20 ảnh MRI phổi (có u + không u) để demo.
- **Hỗ trợ báo cáo:** Cung cấp nội dung kỹ thuật cho báo cáo đồ án (công nghệ, kiến trúc, quy trình).
- **Chi phí:** 9.600.000 VNĐ (bao gồm huấn luyện model + hỗ trợ báo cáo).

---

> **Tài liệu này là bản brief chính thức của dự án MedVision AI.**  
> Mọi thay đổi về tính năng hoặc yêu cầu cần được cập nhật vào file này.
