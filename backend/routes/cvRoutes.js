const express = require('express');
const router = express.Router();
const multer = require('multer');
const cvController = require('../controllers/cvController');
const authMiddleware = require('../middlewares/authMiddleware');

// Multer yapılandırması - memory storage kullanıyoruz (dosyaları buffer olarak saklıyoruz)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 10 // Maksimum 10 dosya
    },
    fileFilter: (req, file, cb) => {
        // Sadece PDF, DOC, DOCX dosyalarına izin ver
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece PDF, DOC ve DOCX dosyaları yüklenebilir.'));
        }
    }
});

/**
 * POST /api/cv/upload
 * Çoklu CV dosyası yükleme
 * Middleware: authMiddleware (token gerekli)
 * Body: jobPostId, senderInfo (optional)
 * Files: cv (multiple files)
 */
router.post('/upload', authMiddleware, upload.array('cv', 10), (req, res) => {
    cvController.uploadCVs(req, res);
});

/**
 * GET /api/cv/jobpost/:jobPostId
 * JobPost'a göre CV listesi getir
 * Middleware: authMiddleware (token gerekli)
 */
router.get('/jobpost/:jobPostId', authMiddleware, (req, res) => {
    cvController.getCVsByJobPost(req, res);
});

/**
 * POST /api/cv/analyze/:jobPostId
 * JobPost'a göre analiz edilmemiş CV ID'lerini getir
 * Middleware: authMiddleware (token gerekli)
 */
router.post('/analyze/:jobPostId', authMiddleware, (req, res) => {
    cvController.analyzeAllUncheckedCVs(req, res);
});

/**
 * POST /api/cv/analyze-single/:cvId
 * Tek bir CV'yi analiz et
 * Middleware: authMiddleware (token gerekli)
 */
router.post('/analyze-single/:cvId', authMiddleware, (req, res) => {
    cvController.analyzeSingleCV(req, res);
});

module.exports = router;

