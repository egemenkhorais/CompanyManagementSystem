const cvService = require('../services/cvService');

class CVController {
    /**
     * POST /api/cv/upload
     * Çoklu CV dosyası yükleme
     */
    async uploadCVs(req, res) {
        try {
            const files = req.files; // Multer'dan gelen dosyalar
            const { jobPostId, senderInfo } = req.body;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'CV dosyası seçilmedi.'
                });
            }

            if (!jobPostId) {
                return res.status(400).json({
                    success: false,
                    message: 'İş ilanı seçilmedi.'
                });
            }

            const result = await cvService.uploadCVs(files, jobPostId, senderInfo);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);

        } catch (error) {
            console.error('CVController Upload Error:', error);
            res.status(500).json({
                success: false,
                message: 'CV yüklenirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/cv/jobpost/:jobPostId
     * JobPost'a göre CV listesi getir
     */
    async getCVsByJobPost(req, res) {
        try {
            const { jobPostId } = req.params;

            const result = await cvService.getCVsByJobPost(jobPostId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('CVController GetCVsByJobPost Error:', error);
            res.status(500).json({
                success: false,
                message: 'CV listesi getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * POST /api/cv/analyze/:jobPostId
     * JobPost'a göre analiz edilmemiş CV ID'lerini getir
     */
    async analyzeAllUncheckedCVs(req, res) {
        try {
            const { jobPostId } = req.params;

            const result = await cvService.analyzeAllUncheckedCVs(jobPostId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('CVController AnalyzeAllUncheckedCVs Error:', error);
            res.status(500).json({
                success: false,
                message: 'CV listesi getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * POST /api/cv/analyze-single/:cvId
     * Tek bir CV'yi analiz et
     */
    async analyzeSingleCV(req, res) {
        try {
            const { cvId } = req.params;

            const result = await cvService.analyzeSingleCV(cvId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('CVController AnalyzeSingleCV Error:', error);
            res.status(500).json({
                success: false,
                message: 'CV analizi yapılırken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/cv/view/:cvId
     * CV dosyasını tarayıcıda görüntüle (indirme değil)
     */
    async viewCV(req, res) {
        try {
            const { cvId } = req.params;

            const result = await cvService.getCVFile(cvId);

            if (!result.success) {
                return res.status(404).json(result);
            }

            // Content-Disposition: inline ile tarayıcıda görüntüleme
            res.set({
                'Content-Type': result.mimeType,
                'Content-Disposition': `inline; filename="${encodeURIComponent(result.fileName)}"`,
                'Content-Length': result.fileBuffer.length
            });

            return res.send(result.fileBuffer);

        } catch (error) {
            console.error('CVController ViewCV Error:', error);
            res.status(500).json({
                success: false,
                message: 'CV görüntülenirken hata oluştu: ' + error.message
            });
        }
    }
}

module.exports = new CVController();

