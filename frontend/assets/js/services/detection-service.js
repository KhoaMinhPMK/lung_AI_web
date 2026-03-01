// ==========================================
// MedVision AI — Detection Service (YOLO API)
// ==========================================

/**
 * Detection Service — handles YOLO model inference
 * In demo mode, returns simulated results
 * In production, calls FastAPI backend
 */
const DetectionService = {
    isDemo: true,

    /**
     * Analyze image(s) for tumor detection
     * @param {File|File[]} imageFiles - PNG image file(s)
     * @param {Object} options - { pixelSpacing, confidenceThreshold }
     * @returns {Object} Detection result
     */
    async analyze(imageFiles, options = {}) {
        const pixelSpacing = options.pixelSpacing || 0.5;
        const confidenceThreshold = options.confidenceThreshold || 0.5;

        if (this.isDemo) {
            return this._simulateDetection(imageFiles, pixelSpacing, confidenceThreshold);
        }

        try {
            const result = await ApiClient.upload('/detection/analyze', imageFiles, {
                pixel_spacing: pixelSpacing,
                confidence_threshold: confidenceThreshold
            });
            return this._formatResult(result);
        } catch (error) {
            console.error('Detection Error:', error);
            throw new Error(`Phân tích thất bại: ${error.message}`);
        }
    },

    /**
     * Format backend result to standard UI format
     */
    _formatResult(raw) {
        return {
            success: true,
            numDetections: raw.detections ? raw.detections.length : 0,
            detections: (raw.detections || []).map(d => ({
                label: d.label || 'Tổn thương nghi ngờ',
                confidence: d.confidence,
                bbox: { x: d.x, y: d.y, w: d.width, h: d.height },
                sizeEstimate: d.size_mm || null,
                lungRads: this._classifyLungRADS(d.size_mm),
                severity: this._classifySeverity(d.size_mm)
            })),
            avgConfidence: raw.avg_confidence || 0,
            processingTime: raw.processing_time || 0,
            maxSize: raw.max_size || 'N/A',
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Classify Lung-RADS based on size (mm)
     */
    _classifyLungRADS(sizeMm) {
        if (!sizeMm) return 'N/A';
        const maxDim = typeof sizeMm === 'string' ?
            Math.max(...sizeMm.replace('mm', '').split('×').map(Number)) :
            sizeMm;

        if (maxDim >= 15) return { category: '4B', risk: 'Nghi ngờ cao', action: 'Sinh thiết / PET-CT' };
        if (maxDim >= 8) return { category: '4A', risk: 'Nghi ngờ', action: 'PET-CT hoặc sinh thiết' };
        if (maxDim >= 6) return { category: '3', risk: 'Có thể lành tính', action: 'Theo dõi 6 tháng' };
        return { category: '2', risk: 'Nguy cơ thấp', action: 'Theo dõi thường quy' };
    },

    /**
     * Classify severity for UI display
     */
    _classifySeverity(sizeMm) {
        if (!sizeMm) return 'low';
        const maxDim = typeof sizeMm === 'string' ?
            Math.max(...sizeMm.replace('mm', '').split('×').map(Number)) :
            sizeMm;

        if (maxDim >= 10) return 'high';
        if (maxDim >= 6) return 'medium';
        return 'low';
    },

    // ============ Demo Mode Simulation ============

    /**
     * Simulate detection results for demo
     */
    _simulateDetection(files, pixelSpacing, threshold) {
        const detections = [
            {
                label: 'Tổn thương nghi ngờ #1',
                confidence: 0.947,
                bbox: { x: 310, y: 172, w: 60, h: 56 },
                sizeEstimate: `${(60 * pixelSpacing).toFixed(1)}mm × ${(56 * pixelSpacing).toFixed(1)}mm`,
                lungRads: { category: '4B', risk: 'Nghi ngờ cao', action: 'Sinh thiết / PET-CT' },
                severity: 'high'
            },
            {
                label: 'Tổn thương nghi ngờ #2',
                confidence: 0.883,
                bbox: { x: 348, y: 278, w: 44, h: 44 },
                sizeEstimate: `${(44 * pixelSpacing).toFixed(1)}mm × ${(44 * pixelSpacing).toFixed(1)}mm`,
                lungRads: { category: '2', risk: 'Nguy cơ thấp', action: 'Theo dõi thường quy' },
                severity: 'low'
            }
        ].filter(d => d.confidence >= threshold);

        return {
            success: true,
            numDetections: detections.length,
            detections,
            avgConfidence: detections.reduce((sum, d) => sum + d.confidence, 0) / (detections.length || 1),
            processingTime: 2.3,
            maxSize: detections.length > 0 ? detections[0].sizeEstimate : 'N/A',
            timestamp: new Date().toISOString()
        };
    }
};
