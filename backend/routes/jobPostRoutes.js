const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobPostController');

/**
 * POST /api/jobposts
 * Yeni iş ilanı oluştur
 */
router.post('/', (req, res) => jobPostController.createJobPost(req, res));

module.exports = router;