const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/login
 * Kullanıcı girişi
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * POST /api/auth/register
 * Kullanıcı kaydı
 */
router.post('/register', (req, res) => authController.register(req, res));

module.exports = router;