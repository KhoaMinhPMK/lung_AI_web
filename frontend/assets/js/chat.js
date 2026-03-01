// ==========================================
// MedVision AI — Chat Logic (Secured + Memory)
// ==========================================

// Conversation memory — tích lũy qua cuộc hội thoại
const chatHistory = [];

// Current detection context (set by diagnosis.js after analysis)
let chatDetectionContext = null;

const chatResponses = {
    'Kích thước này có nguy hiểm không?': `Dựa trên kết quả phân tích:

🔴 **Tổn thương #1** (12.3mm × 8.7mm): Kích thước >10mm được xếp loại **nguy cơ cao** theo phân loại Lung-RADS 4B. Khuyến nghị:
- Sinh thiết để xác định bản chất (lành tính/ác tính)
- Chụp PET-CT để đánh giá hoạt động chuyển hóa

🟢 **Tổn thương #2** (5.8mm × 4.2mm): Kích thước <6mm, **nguy cơ thấp** (Lung-RADS 2). Khuyến nghị theo dõi định kỳ sau 6-12 tháng.

⚠️ *Đây chỉ là nhận định tham khảo của AI, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`,

    'Cần làm thêm xét nghiệm gì?': `Dựa trên phát hiện tổn thương nghi ngờ ở phổi phải, các xét nghiệm bổ sung được khuyến nghị:

1. **PET-CT**: Đánh giá hoạt động chuyển hóa của tổn thương
2. **Sinh thiết**: Xác định mô học (lành tính/ác tính)
3. **Xét nghiệm máu**: CEA, CYFRA 21-1, NSE (marker ung thư phổi)
4. **Xét nghiệm chức năng hô hấp**: Đánh giá ảnh hưởng đến chức năng phổi
5. **CT ngực có thuốc cản quang**: Đánh giá chi tiết hơn về hình thái tổn thương

⚠️ *Đây chỉ là gợi ý tham khảo, bác sĩ chuyên khoa sẽ quyết định chỉ định phù hợp.*`,

    'So sánh với lần khám trước': `📊 **So sánh kết quả chẩn đoán:**

Hiện tại chưa có dữ liệu lần khám trước cho bệnh nhân này trong hệ thống. 

Để so sánh hiệu quả, vui lòng:
1. Chọn bệnh nhân từ danh sách
2. Kiểm tra lịch sử chẩn đoán trong hồ sơ bệnh nhân
3. AI sẽ tự động so sánh kích thước tổn thương giữa các lần khám

💡 *Hệ thống sẽ vẽ biểu đồ xu hướng kích thước tổn thương theo thời gian.*`,

    'Tạo báo cáo tóm tắt': `📋 **BÁO CÁO TÓM TẮT — KẾT QUẢ AI HỖ TRỢ CHẨN ĐOÁN**

**Ngày:** ${new Date().toLocaleDateString('vi-VN')}  
**Bác sĩ thực hiện:** Nguyễn Văn A

**Kết quả phân tích MRI phổi (AI hỗ trợ):**
- AI gợi ý có **2 vùng tổn thương nghi ngờ**
- Vị trí: Thùy phải phổi
- Tổn thương lớn nhất: **12.3mm × 8.7mm** (Lung-RADS 4B — Nguy cơ cao)
- Tổn thương nhỏ: **5.8mm × 4.2mm** (Lung-RADS 2 — Nguy cơ thấp)
- Độ tin cậy mô hình trung bình: **91.5%**

**Khuyến nghị (dựa trên AI):**
- Sinh thiết tổn thương #1 (kích thước > 10mm)
- Theo dõi định kỳ tổn thương #2
- Chụp PET-CT để đánh giá thêm

⚠️ *Báo cáo này được tạo tự động bởi AI, cần sự xác nhận và kết luận cuối cùng của bác sĩ chuyên khoa.*

Bạn có muốn xuất báo cáo này ra **PDF** không?`
};

/**
 * Send user message
 */
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    // Hide empty state
    const empty = document.getElementById('chatEmpty');
    if (empty) empty.classList.add('d-none');

    // Add user message to UI and memory
    addMessage('user', text);
    chatHistory.push({ role: 'user', content: text });
    input.value = '';

    // Show typing indicator
    showTyping();

    // Simulate AI response
    setTimeout(() => {
        hideTyping();

        // Check for predefined responses
        let response = chatResponses[text];
        if (!response) {
            response = generateContextResponse(text);
        }

        addMessage('assistant', response);
        chatHistory.push({ role: 'assistant', content: response });
    }, 1500);
}

/**
 * Generate context-aware fallback response
 */
function generateContextResponse(userText) {
    const lowerText = userText.toLowerCase();

    // Context-aware responses based on detection results
    if (chatDetectionContext) {
        if (lowerText.includes('kích thước') || lowerText.includes('bao lớn') || lowerText.includes('size')) {
            return `Dựa trên kết quả phân tích hiện tại, AI gợi ý phát hiện ${chatDetectionContext.numDetections} vùng tổn thương nghi ngờ. Tổn thương lớn nhất có kích thước ước tính ${chatDetectionContext.maxSize}.

Lưu ý: kích thước này được tính dựa trên bounding box 2D với pixel spacing đã cấu hình. Kích thước thực tế cần đo trên nhiều lát cắt (slices) để xác định chính xác.

⚠️ *Đây chỉ là nhận định tham khảo của AI.*`;
        }
        if (lowerText.includes('nguy hiểm') || lowerText.includes('ác tính') || lowerText.includes('cancer')) {
            return `Tổn thương được AI phát hiện cần được đánh giá bổ sung trước khi đưa ra kết luận. Theo phân loại **Lung-RADS**:

- Nốt ≥ 15mm: **Lung-RADS 4B** — Nghi ngờ cao, cần sinh thiết
- Nốt 8-14mm: **Lung-RADS 4A** — Nghi ngờ, cần PET-CT hoặc sinh thiết
- Nốt 6-7mm: **Lung-RADS 3** — Có thể lành tính, theo dõi 6 tháng
- Nốt < 6mm: **Lung-RADS 2** — Lành tính, theo dõi thường quy

⚠️ *AI chỉ hỗ trợ phát hiện, không phải chẩn đoán xác định.*`;
        }
    }

    // Generic fallback
    return `Cảm ơn câu hỏi của bác sĩ. Dựa trên dữ liệu chẩn đoán hiện tại:

Ảnh MRI cho thấy những vùng tổn thương nghi ngờ cần được đánh giá thêm bằng các phương pháp chẩn đoán bổ sung.

Bác sĩ có muốn tôi phân tích thêm về vấn đề cụ thể nào không?

⚠️ *Đây chỉ là nhận định tham khảo của AI, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`;
}

/**
 * Ask quick question
 */
function askQuick(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

/**
 * Add message to chat — XSS-safe rendering
 */
function addMessage(role, text) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;

    const avatar = role === 'assistant' ? '🤖' : '👨‍⚕️';

    // Safe HTML rendering — escape user input, allow markdown for AI
    let htmlText;
    if (role === 'user') {
        htmlText = escapeHtml(text);
    } else {
        // AI responses are controlled/predefined — safe to format
        htmlText = sanitizeMarkdown(text);
    }

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    msg.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div>
      <div class="msg-bubble">${htmlText}</div>
      <div class="msg-time">${timeStr}</div>
    </div>
  `;

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTyping() {
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.id = 'typingIndicator';
    typing.className = 'chat-message assistant';
    typing.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

/**
 * Trigger AI initial analysis after detection completes
 */
function triggerAIAnalysis(detectionResult) {
    const empty = document.getElementById('chatEmpty');
    if (empty) empty.classList.add('d-none');

    // Store detection context for context-aware responses
    if (detectionResult) {
        chatDetectionContext = detectionResult;
    } else {
        chatDetectionContext = {
            numDetections: 2,
            maxSize: '12.3mm × 8.7mm',
            avgConfidence: 91.5
        };
    }

    showTyping();

    setTimeout(() => {
        hideTyping();
        const analysisMsg = `🔬 **Kết quả phân tích AI hoàn tất!**

AI đã phân tích ảnh MRI phổi và gợi ý:

🔴 **2 vùng tổn thương nghi ngờ** tại thùy phải phổi:
• **Tổn thương #1:** 12.3mm × 8.7mm — Độ tin cậy mô hình: 94.7% — **Lung-RADS 4B (Nguy cơ cao)**
• **Tổn thương #2:** 5.8mm × 4.2mm — Độ tin cậy mô hình: 88.3% — Lung-RADS 2 (Nguy cơ thấp)

📊 **Đánh giá sơ bộ (AI hỗ trợ):**
Tổn thương #1 có kích thước vượt ngưỡng 10mm, cần được đánh giá thêm bằng sinh thiết hoặc PET-CT. Tổn thương #2 có kích thước nhỏ, khuyến nghị theo dõi định kỳ.

Bác sĩ có câu hỏi gì thêm không ạ?

⚠️ *Đây chỉ là nhận định tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`;

        addMessage('assistant', analysisMsg);
        chatHistory.push({ role: 'assistant', content: analysisMsg });
    }, 2000);
}

/**
 * Handle Enter key in chat input
 */
function handleChatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}
