// ==========================================
// MedVision AI — Chat Logic (Groq API + Streaming)
// ==========================================

// Conversation memory — accumulates through the session
const chatHistory = [];

// Current detection context (set by diagnosis.js after analysis)
let chatDetectionContext = null;

// Is AI currently processing?
let isAiProcessing = false;

/**
 * Send user message — calls Groq API
 */
async function sendMessage() {
    if (isAiProcessing) return;

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

    // Disable input during processing
    isAiProcessing = true;
    input.disabled = true;

    // Build context from current state
    const context = buildChatContext();

    // Check if API is configured
    if (!AiService.isConfigured()) {
        const noKeyMsg = `⚠️ **Chưa cấu hình Groq API Key!**

Để sử dụng trợ lý AI thật, vui lòng:
1. Vào **Cài đặt** → **Cấu hình LLM (Groq)**
2. Nhập API Key từ [console.groq.com](https://console.groq.com)
3. Nhấn **Lưu thay đổi**

Hiện tại đang dùng chế độ demo.`;
        addMessage('assistant', noKeyMsg);
        chatHistory.push({ role: 'assistant', content: noKeyMsg });
        isAiProcessing = false;
        input.disabled = false;
        return;
    }

    // Show typing indicator
    showTyping();

    try {
        // Use streaming for real-time typing effect
        const msgElement = createStreamingMessage();
        hideTyping();
        let fullResponse = '';

        await AiService.chatStream(chatHistory, context, (chunk) => {
            fullResponse += chunk;
            updateStreamingMessage(msgElement, fullResponse);
        });

        // Save to history
        chatHistory.push({ role: 'assistant', content: fullResponse });

    } catch (error) {
        hideTyping();
        const errMsg = `⚠️ Lỗi: ${error.message}`;
        addMessage('assistant', errMsg);
        chatHistory.push({ role: 'assistant', content: errMsg });
    }

    isAiProcessing = false;
    input.disabled = false;
    input.focus();
}

/**
 * Build context object from current page state
 */
function buildChatContext() {
    const context = {};

    // Detection context (set after AI analysis)
    if (chatDetectionContext) {
        context.detectionResult = chatDetectionContext;
    }

    // Patient info (from patient selector if available)
    const patientSelect = document.getElementById('patientSelect');
    if (patientSelect && patientSelect.value) {
        const patients = Store.get('patients', []);
        const patient = patients.find(p => p.id === parseInt(patientSelect.value));
        if (patient) {
            context.patientInfo = {
                fullName: patient.fullName,
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender,
                medicalHistory: patient.medicalHistory,
                notes: patient.notes
            };
        }
    }

    // Doctor conclusion (from form if available)
    const icd10 = document.getElementById('icd10Code');
    const conclusion = document.getElementById('doctorConclusion');
    if (icd10 && icd10.value) {
        context.doctorConclusion = {
            icd10Code: icd10.value,
            conclusion: conclusion ? conclusion.value : '',
            recommendation: document.getElementById('doctorRecommendation')?.value || ''
        };
    }

    // System settings
    context.settings = {
        pixelSpacing: Store.get('pixel_spacing', 0.5),
        confThreshold: Store.get('conf_threshold', 50)
    };

    return context;
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

    let htmlText;
    if (role === 'user') {
        htmlText = escapeHtml(text);
    } else {
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
 * Create streaming message element (for real-time typing)
 */
function createStreamingMessage() {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = 'chat-message assistant';
    msg.id = 'streamingMsg';

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    msg.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div>
      <div class="msg-bubble streaming-bubble">
        <span class="streaming-cursor">▊</span>
      </div>
      <div class="msg-time">${timeStr}</div>
    </div>
  `;

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
}

/**
 * Update streaming message content in real-time
 */
function updateStreamingMessage(msgElement, text) {
    const bubble = msgElement.querySelector('.msg-bubble');
    if (bubble) {
        bubble.innerHTML = sanitizeMarkdown(text) + '<span class="streaming-cursor">▊</span>';
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    }
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

    // Also remove streaming cursor if exists
    const cursor = document.querySelector('.streaming-cursor');
    if (cursor) cursor.remove();
}

/**
 * Trigger AI initial analysis after detection completes
 */
async function triggerAIAnalysis(detectionResult) {
    const empty = document.getElementById('chatEmpty');
    if (empty) empty.classList.add('d-none');

    // Store detection context
    if (detectionResult) {
        chatDetectionContext = detectionResult;
    } else {
        chatDetectionContext = {
            numDetections: 2,
            maxSize: '12.3mm × 8.7mm',
            avgConfidence: 91.5,
            detections: [
                { x: 310, y: 172, width: 12.3, height: 8.7, confidence: 94.7 },
                { x: 348, y: 278, width: 5.8, height: 4.2, confidence: 88.3 }
            ]
        };
    }

    // If API configured, ask AI to analyze
    if (AiService.isConfigured()) {
        showTyping();
        isAiProcessing = true;

        const context = buildChatContext();
        const initialPrompt = 'Phân tích kết quả detection vừa hoàn thành. Đánh giá kích thước, phân loại Lung-RADS, và đưa ra khuyến nghị sơ bộ cho bác sĩ.';
        chatHistory.push({ role: 'user', content: initialPrompt });

        try {
            const msgElement = createStreamingMessage();
            hideTyping();
            let fullResponse = '';

            await AiService.chatStream(chatHistory, context, (chunk) => {
                fullResponse += chunk;
                updateStreamingMessage(msgElement, fullResponse);
            });

            chatHistory.push({ role: 'assistant', content: fullResponse });
        } catch (error) {
            hideTyping();
            addMessage('assistant', `⚠️ Không thể phân tích tự động: ${error.message}`);
        }

        isAiProcessing = false;
    } else {
        // Demo mode fallback
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

💡 **Nhập API Key Groq** trong Cài đặt để sử dụng AI trợ lý thật!

⚠️ *Đây chỉ là nhận định tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa.*`;

            addMessage('assistant', analysisMsg);
            chatHistory.push({ role: 'assistant', content: analysisMsg });
        }, 2000);
    }
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
