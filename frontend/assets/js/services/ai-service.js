// ==========================================
// MedVision AI — AI Service (LLM Abstraction)
// ==========================================

/**
 * AI Service — handles LLM communication, prompt building, streaming
 * In demo mode, simulates responses. When backend is ready, calls API.
 */
const AiService = {
    isDemo: true, // Toggle when backend is connected

    /**
     * System prompt for medical AI assistant
     */
    systemPrompt: `Bạn là Trợ lý Y khoa AI của MedVision AI — hệ thống hỗ trợ chẩn đoán hình ảnh y khoa.

QUY TẮC BẮT BUỘC:
1. LUÔN sử dụng thuật ngữ "tổn thương nghi ngờ" hoặc "nốt mờ", KHÔNG BAO GIỜ gọi là "khối u" hay "tumor" trước khi có sinh thiết.
2. LUÔN kết thúc phản hồi bằng: "⚠️ Đây chỉ là nhận định tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa."
3. Sử dụng phân loại Lung-RADS khi đánh giá mức độ nguy cơ.
4. Phân biệt rõ "Độ tin cậy mô hình" (model confidence) vs xác suất bệnh.
5. Trả lời bằng tiếng Việt, chuyên nghiệp, ngắn gọn.

THÔNG TIN HỆ THỐNG:
- Model detection: YOLOv8 (best.pt) — phát hiện tổn thương phổi trên ảnh MRI
- Format ảnh: PNG
- Pixel spacing có thể cấu hình từ Settings`,

    /**
     * Build prompt with context
     */
    buildPrompt(userMessage, context = {}) {
        let contextStr = '';
        if (context.detectionResult) {
            contextStr += `\n\nKẾT QUẢ DETECTION:\n${JSON.stringify(context.detectionResult, null, 2)}`;
        }
        if (context.patientInfo) {
            contextStr += `\n\nTHÔNG TIN BỆNH NHÂN:\n- Họ tên: ${context.patientInfo.fullName}\n- Tuổi: ${context.patientInfo.age}\n- Giới tính: ${context.patientInfo.gender}\n- Tiền sử: ${context.patientInfo.medicalHistory || 'Không có'}`;
        }
        return `${this.systemPrompt}${contextStr}\n\nCâu hỏi của bác sĩ: ${userMessage}`;
    },

    /**
     * Chat with AI — returns response string
     * In demo mode, uses simulated responses
     * In production, calls backend LLM API
     */
    async chat(messages, context = {}) {
        if (this.isDemo) {
            return this._simulateResponse(messages, context);
        }

        try {
            const response = await ApiClient.post('/ai/chat', {
                messages,
                context,
                system_prompt: this.systemPrompt
            });
            return response.reply;
        } catch (error) {
            console.error('AI Chat Error:', error);
            return `⚠️ Không thể kết nối tới AI. Lỗi: ${error.message}\n\nVui lòng kiểm tra kết nối mạng hoặc cấu hình LLM trong Cài đặt.`;
        }
    },

    /**
     * Generate diagnosis report
     */
    async generateReport(diagnosisData) {
        if (this.isDemo) {
            return this._simulateReport(diagnosisData);
        }

        try {
            return await ApiClient.post('/ai/report', { diagnosis: diagnosisData });
        } catch (error) {
            console.error('Report Generation Error:', error);
            throw error;
        }
    },

    /**
     * Generate statistics summary
     */
    async generateStatsSummary(statsData) {
        if (this.isDemo) {
            return this._simulateStatsSummary(statsData);
        }

        try {
            const response = await ApiClient.post('/ai/stats-summary', { stats: statsData });
            return response.summary;
        } catch (error) {
            console.error('Stats Summary Error:', error);
            throw error;
        }
    },

    // ============ Demo Mode Simulations ============

    _simulateResponse(messages, context) {
        const lastMsg = messages[messages.length - 1];
        const text = lastMsg ? lastMsg.content : '';
        const lowerText = text.toLowerCase();

        // Context-aware responses
        if (lowerText.includes('kích thước') || lowerText.includes('bao lớn')) {
            return `Dựa trên kết quả phân tích, kích thước tổn thương được ước tính dựa trên bounding box 2D:

🔴 **Tổn thương #1**: 12.3mm × 8.7mm — vượt ngưỡng 10mm (Lung-RADS 4B)
🟢 **Tổn thương #2**: 5.8mm × 4.2mm — dưới 6mm (Lung-RADS 2)

Lưu ý: kích thước thực cần đo trên nhiều lát cắt (slices) để xác định chính xác thể tích 3D.

⚠️ *Đây chỉ là nhận định tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`;
        }

        if (lowerText.includes('nguy hiểm') || lowerText.includes('ác tính')) {
            return `Theo phân loại **Lung-RADS**, tổn thương được đánh giá như sau:

| Lung-RADS | Kích thước | Đánh giá | Hành động |
|-----------|-----------|----------|-----------|
| 4B | ≥ 15mm | Nghi ngờ cao | Sinh thiết |
| 4A | 8-14mm | Nghi ngờ | PET-CT / sinh thiết |
| 3 | 6-7mm | Có thể lành tính | Theo dõi 6 tháng |
| 2 | < 6mm | Lành tính | Theo dõi thường quy |

⚠️ *Đây chỉ là nhận định tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`;
        }

        if (lowerText.includes('xét nghiệm') || lowerText.includes('cần làm')) {
            return `Xét nghiệm bổ sung khuyến nghị:

1. **PET-CT** — Đánh giá hoạt động chuyển hóa
2. **Sinh thiết** — Xác định mô học
3. **Marker ung thư**: CEA, CYFRA 21-1, NSE
4. **Chức năng hô hấp** — Đánh giá ảnh hưởng
5. **CT ngực có cản quang** — Hình thái chi tiết

⚠️ *Đây chỉ là gợi ý tham khảo, bác sĩ chuyên khoa sẽ quyết định chỉ định phù hợp.*`;
        }

        return `Cảm ơn câu hỏi của bác sĩ. Tôi sẽ phân tích dựa trên dữ liệu chẩn đoán hiện tại.

Bác sĩ có thể hỏi cụ thể về:
- Kích thước và phân loại tổn thương
- Các xét nghiệm bổ sung cần làm
- So sánh với lần khám trước
- Tạo báo cáo tóm tắt

⚠️ *Đây chỉ là nhận định tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`;
    },

    _simulateReport(data) {
        return {
            title: 'BÁO CÁO KẾT QUẢ AI HỖ TRỢ CHẨN ĐOÁN',
            date: new Date().toLocaleDateString('vi-VN'),
            content: `Kết quả phân tích ảnh MRI phổi bằng AI...`,
            disclaimer: 'Báo cáo này được tạo tự động bởi AI, cần sự xác nhận của bác sĩ chuyên khoa.'
        };
    },

    _simulateStatsSummary(data) {
        return `📊 **Tổng hợp AI — Thống kê chẩn đoán**

Trong khoảng thời gian được chọn:
- Tổng số ca chẩn đoán: **356 ca**
- Tỷ lệ phát hiện tổn thương nghi ngờ: **13.2%** (47 ca)
- Kích thước trung bình tổn thương phát hiện: **9.4mm**
- Độ tin cậy mô hình trung bình: **93.8%**

**Xu hướng:** Tỷ lệ phát hiện ổn định, tập trung ở nhóm tuổi 50-70.

⚠️ *Báo cáo tổng hợp bởi AI, mang tính tham khảo.*`;
    }
};
