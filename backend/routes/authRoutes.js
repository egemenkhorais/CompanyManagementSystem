const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/auth/login
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/register
router.post('/register', (req, res) => authController.register(req, res));

// GET /api/auth/my-permissions (token gerekli)
router.get('/my-permissions', authMiddleware, (req, res) => authController.getMyPermissions(req, res));

module.exports = router;
