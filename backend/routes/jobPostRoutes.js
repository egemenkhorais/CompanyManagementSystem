const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobPostController');
//Sadece token'ı olanlar erişebilir
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * GET /api/jobposts
 * Tüm iş ilanlarını getir
 * Bu route'u /:jobPostId'den ÖNCE tanımlamak önemli!
 */
router.get('/', authMiddleware, (req, res) => jobPostController.getAllJobPosts(req, res));

/**
 * GET /api/jobposts/:jobPostId
 * ID'ye göre iş ilanı getir
 */
router.get('/:jobPostId', authMiddleware, (req, res) => jobPostController.getJobPostById(req, res));

/**
 * POST /api/jobposts
 * Yeni iş ilanı oluştur
 */
router.post('/', authMiddleware, (req, res) => jobPostController.createJobPost(req, res));

module.exports = router;