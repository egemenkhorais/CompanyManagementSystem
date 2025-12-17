// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

// Public routes (token gerektirmez)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes (token gerektirir)
router.get('/my-permissions', authenticateToken, authController.getMyPermissions);
router.get('/my-details', authenticateToken, authController.getUserDetails);

module.exports = router;