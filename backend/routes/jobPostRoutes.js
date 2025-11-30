const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobPostController');
//Sadece token'ı olanlar erişebilir
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * POST /api/jobposts
 * Yeni iş ilanı oluştur
 */
router.post('/', (req, res) => jobPostController.createJobPost(req, res));

module.exports = router;