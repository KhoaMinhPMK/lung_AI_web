// ==========================================
// MedVision AI — AI Service (Groq + GPT-OSS 120B)
// ==========================================

/**
 * Groq AI Service — calls Groq's OpenAI-compatible API
 * Model: openai/gpt-oss-120b (reasoning model)
 * API: https://api.groq.com/openai/v1/chat/completions
 */
const AiService = {

    // ============ Configuration ============
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'openai/gpt-oss-120b',

    /**
     * Get stored API key from localStorage
     */
    getApiKey() {
        return Store.get('groq_api_key', '');
    },

    /**
     * Check if API key is configured
     */
    isConfigured() {
        return this.getApiKey().length > 0;
    },

    // ============ System Prompt (Complex Medical) ============

    systemPrompt: `BẠN LÀ: Trợ lý AI Y khoa chuyên khoa hình ảnh phổi — hệ thống MedVision AI.

═══════════════════════════════════════════
CHUYÊN MÔN & VAI TRÒ
═══════════════════════════════════════════

Bạn là một hệ thống AI hỗ trợ bác sĩ chẩn đoán hình ảnh, chuyên về:
- Phân tích ảnh MRI/CT phổi
- Hỗ trợ phát hiện tổn thương phổi (nốt mờ, khối mờ, thâm nhiễm)
- Phân loại theo Lung-RADS (Lung CT Screening Reporting & Data System)
- Khuyến nghị quy trình theo dõi và xét nghiệm bổ sung
- Tạo báo cáo chẩn đoán hỗ trợ

═══════════════════════════════════════════
QUY TẮC BẮT BUỘC (KHÔNG ĐƯỢC VI PHẠM)
═══════════════════════════════════════════

1. THUẬT NGỮ Y KHOA:
   ✅ ĐÚNG: "tổn thương nghi ngờ", "nốt mờ", "khối mờ", "sang thương"
   ❌ SAI: "khối u", "tumor", "ung thư" → TUYỆT ĐỐI KHÔNG dùng trước khi có kết quả sinh thiết
   Lý do: AI chỉ phát hiện bất thường trên hình ảnh, KHÔNG thể chẩn đoán xác định bản chất

2. PHÂN LOẠI LUNG-RADS (BẮT BUỘC sử dụng khi đánh giá):
   | Lung-RADS | Kích thước     | Đánh giá             | Hành động khuyến nghị            |
   |-----------|---------------|----------------------|----------------------------------|
   | 1         | Không nốt     | Âm tính              | Tầm soát thường quy 12 tháng    |
   | 2         | < 6mm         | Lành tính            | Tầm soát thường quy 12 tháng    |
   | 3         | 6-7mm         | Có thể lành tính     | Theo dõi CT sau 6 tháng          |
   | 4A        | 8-14mm        | Nghi ngờ             | PET-CT hoặc sinh thiết 3 tháng   |
   | 4B        | ≥ 15mm        | Nghi ngờ cao         | Sinh thiết / nội soi phế quản    |
   | 4X        | Bất kỳ + đặc điểm ác tính | Rất nghi ngờ | Hội chẩn đa chuyên khoa    |

3. PHÂN BIỆT RÕ RÀNG:
   - "Độ tin cậy mô hình" (model confidence) ≠ xác suất bệnh thực tế
   - AI hỗ trợ phát hiện ≠ chẩn đoán xác định
   - Kích thước trên ảnh 2D ≠ kích thước thực (cần đo 3D trên nhiều lát cắt)

4. DISCLAIMER (LUÔN kết thúc mỗi phản hồi):
   "⚠️ Đây chỉ là nhận định tham khảo của AI, không thay thế chẩn đoán của bác sĩ chuyên khoa."

5. NGÔN NGỮ:
   - Trả lời bằng tiếng Việt
   - Chuyên nghiệp, mạch lạc, có cấu trúc (dùng heading, bullet, bảng)
   - Ưu tiên ngắn gọn, trọng tâm
   - Dùng emoji vừa phải để trực quan (🔴🟢📊📋)

═══════════════════════════════════════════
THÔNG TIN HỆ THỐNG
═══════════════════════════════════════════

- Model detection: YOLOv8 (best.pt) — object detection trên ảnh MRI phổi
- Format ảnh đầu vào: PNG
- Kết quả: Bounding boxes + confidence score + kích thước ước tính (mm)
- Kích thước (mm) = pixel size × pixel spacing (cấu hình trong Settings)
- Hệ thống KHÔNG chẩn đoán xác định, chỉ HỖ TRỢ bác sĩ

═══════════════════════════════════════════
KHẢ NĂNG CỦA BẠN
═══════════════════════════════════════════

Khi bác sĩ hỏi, bạn có thể:
1. Phân tích chi tiết kết quả detection (kích thước, vị trí, Lung-RADS)
2. Giải thích ý nghĩa lâm sàng của các chỉ số
3. Khuyến nghị xét nghiệm bổ sung phù hợp
4. So sánh với lần khám trước (nếu có dữ liệu)
5. Tạo báo cáo tóm tắt chẩn đoán hỗ trợ
6. Trả lời câu hỏi y khoa liên quan đến chẩn đoán hình ảnh phổi
7. Giải thích thuật ngữ y khoa cho bệnh nhân (nếu được yêu cầu)`,

    // ============ Context Builder ============

    /**
     * Build context block from available data
     */
    buildContextBlock(context = {}) {
        let blocks = [];

        // Detection results
        if (context.detectionResult) {
            const d = context.detectionResult;
            blocks.push(`[KẾT QUẢ DETECTION - YOLOv8]
Số tổn thương nghi ngờ: ${d.numDetections || 0}
Kích thước lớn nhất: ${d.maxSize || 'N/A'}
Độ tin cậy mô hình trung bình: ${d.avgConfidence ? d.avgConfidence + '%' : 'N/A'}
${d.detections ? 'Chi tiết:\n' + d.detections.map((det, i) =>
                `  - Tổn thương #${i + 1}: ${det.width}mm × ${det.height}mm | Confidence: ${det.confidence}% | Vị trí: (${det.x}, ${det.y})`
            ).join('\n') : ''}`);
        }

        // Patient info
        if (context.patientInfo) {
            const p = context.patientInfo;
            blocks.push(`[THÔNG TIN BỆNH NHÂN]
Họ tên: ${p.fullName || 'Chưa chọn'}
Tuổi: ${p.age || 'N/A'}
Giới tính: ${p.gender || 'N/A'}
Tiền sử bệnh: ${p.medicalHistory || 'Không có thông tin'}
Ghi chú: ${p.notes || 'Không'}`);
        }

        // Doctor conclusion (if exists)
        if (context.doctorConclusion) {
            blocks.push(`[KẾT LUẬN BÁC SĨ ĐÃ NHẬP]
Mã ICD-10: ${context.doctorConclusion.icd10Code || 'Chưa có'}
Kết luận: ${context.doctorConclusion.conclusion || 'Chưa có'}
Khuyến nghị: ${context.doctorConclusion.recommendation || 'Chưa có'}`);
        }

        // Previous diagnoses (if exists)
        if (context.previousDiagnoses && context.previousDiagnoses.length > 0) {
            blocks.push(`[LỊCH SỬ CHẨN ĐOÁN TRƯỚC]
${context.previousDiagnoses.map((dx, i) =>
                `  Lần ${i + 1} (${dx.date}): ${dx.numDetections} tổn thương, lớn nhất ${dx.maxSize}, Lung-RADS ${dx.lungRads}`
            ).join('\n')}`);
        }

        // System settings
        if (context.settings) {
            blocks.push(`[CÀI ĐẶT HỆ THỐNG]
Pixel spacing: ${context.settings.pixelSpacing || 0.5}mm/pixel
Ngưỡng confidence: ${context.settings.confThreshold || 50}%`);
        }

        return blocks.length > 0
            ? '\n\n═══ DỮ LIỆU NGỮ CẢNH ═══\n' + blocks.join('\n\n') + '\n═══ HẾT NGỮ CẢNH ═══'
            : '';
    },

    // ============ API Communication ============

    /**
     * Chat with Groq API
     * @param {Array} messages - Chat history [{role, content}, ...]
     * @param {Object} context - Detection/patient context
     * @returns {string} AI response text
     */
    async chat(messages, context = {}) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return `⚠️ **Chưa cấu hình API Key!**

Để sử dụng trợ lý AI, vui lòng:
1. Vào **Cài đặt** → **Cấu hình LLM (Groq)**
2. Nhập API Key từ [console.groq.com](https://console.groq.com)
3. Nhấn **Lưu thay đổi**

API Key miễn phí tại: https://console.groq.com/keys`;
        }

        try {
            // Build messages array with system prompt + context
            const contextBlock = this.buildContextBlock(context);
            const apiMessages = [
                {
                    role: 'user',
                    content: this.systemPrompt + contextBlock
                }
            ];

            // Add conversation history (sliding window — last 10 turns)
            const recentHistory = messages.slice(-10);
            recentHistory.forEach(msg => {
                apiMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            });

            // Call Groq API
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: apiMessages,
                    temperature: 0.6,
                    max_completion_tokens: 2048,
                    top_p: 0.95,
                    reasoning_effort: 'medium',
                    include_reasoning: false,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || response.statusText;

                if (response.status === 401) {
                    return `❌ **API Key không hợp lệ!**\n\nVui lòng kiểm tra lại API Key trong **Cài đặt** → **Cấu hình LLM**.\n\nLấy key mới tại: https://console.groq.com/keys`;
                }
                if (response.status === 429) {
                    return `⏳ **Đã vượt giới hạn request!**\n\nGroq API có rate limit. Vui lòng chờ vài giây rồi thử lại.\n\nChi tiết: ${errorMsg}`;
                }
                throw new Error(`Groq API Error (${response.status}): ${errorMsg}`);
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;

            if (!reply) {
                throw new Error('Không nhận được phản hồi từ model');
            }

            return reply;

        } catch (error) {
            console.error('Groq Chat Error:', error);

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return `🌐 **Lỗi kết nối mạng!**\n\nKhông thể kết nối tới Groq API. Vui lòng kiểm tra:\n1. Kết nối internet\n2. Groq API có đang hoạt động không\n\nChi tiết: ${error.message}`;
            }

            return `⚠️ **Lỗi khi gọi AI:**\n\n${error.message}\n\nVui lòng thử lại hoặc kiểm tra cấu hình trong **Cài đặt**.`;
        }
    },

    /**
     * Chat with streaming (for real-time typing effect)
     */
    async chatStream(messages, context = {}, onChunk) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            onChunk('⚠️ Chưa cấu hình API Key. Vào Cài đặt để nhập.');
            return;
        }

        try {
            const contextBlock = this.buildContextBlock(context);
            const apiMessages = [
                { role: 'user', content: this.systemPrompt + contextBlock }
            ];
            const recentHistory = messages.slice(-10);
            recentHistory.forEach(msg => {
                apiMessages.push({ role: msg.role, content: msg.content });
            });

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: apiMessages,
                    temperature: 0.6,
                    max_completion_tokens: 2048,
                    top_p: 0.95,
                    reasoning_effort: 'medium',
                    include_reasoning: false,
                    stream: true
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || response.statusText);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

                for (const line of lines) {
                    const jsonStr = line.replace('data: ', '');
                    if (jsonStr === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) {
                            fullText += delta;
                            onChunk(delta);
                        }
                    } catch (e) { /* skip parse errors */ }
                }
            }

            return fullText;

        } catch (error) {
            console.error('Groq Stream Error:', error);
            onChunk(`\n\n⚠️ Lỗi streaming: ${error.message}`);
        }
    },

    /**
     * Quick test API connection
     */
    async testConnection() {
        const apiKey = this.getApiKey();
        if (!apiKey) return { ok: false, error: 'Chưa nhập API Key' };

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: [{ role: 'user', content: 'Xin chào, trả lời ngắn gọn 1 từ.' }],
                    max_completion_tokens: 32,
                    include_reasoning: false,
                    stream: false
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                return { ok: false, error: err.error?.message || `HTTP ${response.status}` };
            }

            const data = await response.json();
            return {
                ok: true,
                model: data.model,
                reply: data.choices?.[0]?.message?.content || '',
                usage: data.usage
            };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    }
};
