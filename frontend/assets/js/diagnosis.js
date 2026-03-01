// ==========================================
// MedVision AI — Diagnosis Logic
// ==========================================

let currentImage = null;
let currentZoom = 1;
let isAnalyzed = false;

document.addEventListener('DOMContentLoaded', () => {
    initPatientDropdown();
    initFileUpload();
    initDragDrop();
});

/**
 * Populate patient dropdown
 */
function initPatientDropdown() {
    const select = document.getElementById('patientSelect');
    const patients = Store.get('patients', []);
    patients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.patientCode} — ${p.fullName}`;
        select.appendChild(opt);
    });
}

/**
 * File input change
 */
function initFileUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });
}

/**
 * Drag and drop
 */
function initDragDrop() {
    const dropzone = document.getElementById('dropzone');

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    dropzone.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
}

/**
 * Handle uploaded file
 */
function handleFile(file) {
    if (file.type !== 'image/png') {
        showToast('error', 'Lỗi', 'Vui lòng chọn file ảnh định dạng PNG.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = e.target.result;
        showImagePreview(currentImage);
        showToast('success', 'Thành công', `Đã tải ảnh: ${file.name}`);
    };
    reader.readAsDataURL(file);
}

/**
 * Load sample image
 */
function loadSampleImage() {
    // Create a sample MRI-like canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 512);

    // Simulated lung tissue (ellipses)
    const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 220);
    gradient.addColorStop(0, '#2a2a2a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(256, 256, 200, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left lung area
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    ctx.ellipse(180, 250, 80, 120, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Right lung area
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    ctx.ellipse(330, 250, 85, 125, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Simulated nodule (bright spot)
    const noduleGrad = ctx.createRadialGradient(340, 200, 2, 340, 200, 18);
    noduleGrad.addColorStop(0, '#888888');
    noduleGrad.addColorStop(0.5, '#555555');
    noduleGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = noduleGrad;
    ctx.beginPath();
    ctx.arc(340, 200, 18, 0, Math.PI * 2);
    ctx.fill();

    // Another smaller nodule
    const nodule2 = ctx.createRadialGradient(370, 300, 1, 370, 300, 10);
    nodule2.addColorStop(0, '#777777');
    nodule2.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = nodule2;
    ctx.beginPath();
    ctx.arc(370, 300, 10, 0, Math.PI * 2);
    ctx.fill();

    // Some texture noise
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = Math.random() * 30;
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.3)`;
        ctx.fillRect(x, y, 1, 1);
    }

    currentImage = canvas.toDataURL('image/png');
    showImagePreview(currentImage);
    showToast('info', 'Ảnh mẫu', 'Đã tải ảnh MRI mẫu để demo.');
}

/**
 * Show image in preview area
 */
function showImagePreview(src) {
    document.getElementById('dropzone').classList.add('d-none');
    const preview = document.getElementById('imagePreview');
    preview.classList.remove('d-none');
    document.getElementById('previewImage').src = src;
    document.getElementById('btnAnalyze').disabled = false;
    currentZoom = 1;
    isAnalyzed = false;

    // Hide results and view toggle if they were shown
    document.getElementById('resultsPanel').classList.add('d-none');
    document.getElementById('viewToggle').classList.add('d-none');
}

/**
 * Clear image
 */
function clearImage() {
    document.getElementById('dropzone').classList.remove('d-none');
    document.getElementById('imagePreview').classList.add('d-none');
    document.getElementById('resultsPanel').classList.add('d-none');
    document.getElementById('btnAnalyze').disabled = true;
    document.getElementById('viewToggle').classList.add('d-none');
    currentImage = null;
    isAnalyzed = false;
    currentZoom = 1;
    document.getElementById('fileInput').value = '';
}

/**
 * Zoom image
 */
function zoomImage(direction) {
    currentZoom += direction * 0.2;
    currentZoom = Math.max(0.5, Math.min(3, currentZoom));
    document.getElementById('previewImage').style.transform = `scale(${currentZoom})`;
}

function resetZoom() {
    currentZoom = 1;
    document.getElementById('previewImage').style.transform = 'scale(1)';
}

/**
 * View toggle (original / result)
 */
function showView(type, e) {
    const btns = document.querySelectorAll('.view-toggle .toggle-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');

    // In real app, swap between original and result image
    if (type === 'result' && isAnalyzed) {
        // Show result with bounding boxes (simulated with canvas overlay)
        showResultImage();
    } else {
        document.getElementById('previewImage').src = currentImage;
    }
}

/**
 * Show result image with drawn bounding boxes
 */
function showResultImage() {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Draw bounding boxes
        const detections = [
            { x: 310, y: 172, w: 60, h: 56, conf: 0.947, label: 'Tổn thương #1' },
            { x: 348, y: 278, w: 44, h: 44, conf: 0.883, label: 'Tổn thương #2' }
        ];

        detections.forEach((d, i) => {
            // Box
            ctx.strokeStyle = i === 0 ? '#ef4444' : '#f59e0b';
            ctx.lineWidth = 2;
            ctx.strokeRect(d.x, d.y, d.w, d.h);

            // Label background
            ctx.fillStyle = i === 0 ? '#ef4444' : '#f59e0b';
            const labelText = `${d.label} (${(d.conf * 100).toFixed(1)}%)`;
            ctx.font = '12px Inter, sans-serif';
            const textWidth = ctx.measureText(labelText).width;
            ctx.fillRect(d.x, d.y - 20, textWidth + 10, 20);

            // Label text
            ctx.fillStyle = 'white';
            ctx.fillText(labelText, d.x + 5, d.y - 6);
        });

        document.getElementById('previewImage').src = canvas.toDataURL();
    };
    img.src = currentImage;
}

/**
 * Analyze image (simulated)
 */
function analyzeImage() {
    if (!currentImage) return;

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    document.getElementById('btnAnalyze').disabled = true;

    // Simulate AI processing
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.remove('active');

        // Show results
        isAnalyzed = true;
        document.getElementById('resultsPanel').classList.remove('d-none');
        document.getElementById('viewToggle').classList.remove('d-none');
        document.getElementById('btnAnalyze').disabled = false;

        // Switch to result view
        showResultImage();
        const btns = document.querySelectorAll('.view-toggle .toggle-btn');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');

        // Trigger AI chat initial analysis
        if (typeof triggerAIAnalysis === 'function') {
            triggerAIAnalysis();
        }

        showToast('success', 'Phân tích hoàn tất', 'AI gợi ý 2 vùng tổn thương nghi ngờ.');

        // Scroll to results
        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
    }, 2500);
}

/**
 * Toggle chat panel (mobile)
 */
function toggleChat() {
    const panel = document.getElementById('chatPanel');
    panel.classList.toggle('open');
}

/**
 * Apply windowing (brightness/contrast)
 */
function applyWindowing() {
    const brightness = document.getElementById('brightnessSlider').value;
    const contrast = document.getElementById('contrastSlider').value;
    const img = document.getElementById('previewImage');

    if (img) {
        img.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    }

    // Update display values
    document.getElementById('brightnessValue').textContent = brightness + '%';
    document.getElementById('contrastValue').textContent = contrast + '%';
}

/**
 * Save doctor conclusion
 */
function saveDoctorConclusion() {
    const icd10 = document.getElementById('icd10Code').value;
    const conclusion = document.getElementById('doctorConclusion').value.trim();
    const recommendation = document.getElementById('doctorRecommendation').value.trim();

    if (!icd10) {
        showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn mã ICD-10.');
        document.getElementById('icd10Code').focus();
        return;
    }
    if (!conclusion) {
        showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập kết luận chẩn đoán.');
        document.getElementById('doctorConclusion').focus();
        return;
    }

    // Save to localStorage via Store
    const selectedPatientId = document.getElementById('patientSelect').value;
    const diagnosisResult = {
        patientId: selectedPatientId || null,
        icd10Code: icd10,
        conclusion: conclusion,
        recommendation: recommendation,
        doctorName: getCurrentUser()?.fullName || 'Bác sĩ',
        confirmedAt: new Date().toISOString(),
        aiResults: {
            numDetections: 2,
            maxSize: '12.3mm × 8.7mm',
            avgConfidence: 91.5
        }
    };

    // Save diagnosis history
    const history = Store.get('diagnosis_history', []);
    history.unshift(diagnosisResult);
    Store.set('diagnosis_history', history);

    showToast('success', 'Lưu thành công', 'Kết luận bác sĩ đã được lưu vào hệ thống.');
}

/**
 * Handle multi-file upload 
 */
function handleMultipleFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type === 'image/png');
    if (validFiles.length === 0) {
        showToast('error', 'Lỗi', 'Không tìm thấy file PNG hợp lệ.');
        return;
    }

    // Store all images
    uploadedImages = [];
    let loadCount = 0;

    validFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push({ src: e.target.result, name: file.name, index });
            loadCount++;
            if (loadCount === validFiles.length) {
                // All loaded — show first image and thumbnail strip
                currentImage = uploadedImages[0].src;
                currentImageIndex = 0;
                showPreview(currentImage);
                renderThumbnailStrip();
                showToast('success', 'Tải lên thành công', `Đã tải ${validFiles.length} ảnh MRI.`);
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Render thumbnail strip for multi-image
 */
function renderThumbnailStrip() {
    const strip = document.getElementById('thumbnailStrip');
    if (!strip || uploadedImages.length <= 1) return;

    strip.classList.remove('d-none');
    strip.innerHTML = uploadedImages.map((img, i) => `
        <div class="thumb-item ${i === currentImageIndex ? 'active' : ''}" 
             onclick="selectImage(${i})" title="${escapeHtml(img.name)}">
            <img src="${img.src}" alt="Slice ${i + 1}">
        </div>
    `).join('');
}

/**
 * Select image from thumbnail strip
 */
function selectImage(index) {
    if (!uploadedImages[index]) return;
    currentImageIndex = index;
    currentImage = uploadedImages[index].src;
    document.getElementById('previewImage').src = currentImage;
    renderThumbnailStrip();
}

// Multi-image state
let uploadedImages = [];
let currentImageIndex = 0;
