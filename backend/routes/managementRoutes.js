const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm route'lar auth gerektirir
router.use(authMiddleware);

// Kullanıcı yönetimi
router.get('/users', userManagementController.getAllUsers);
router.get('/users/:userId', userManagementController.getUserById);
router.put('/users/:userId', userManagementController.updateUser);
router.delete('/users/:userId', userManagementController.deleteUser);

// Dropdown verileri
router.get('/roles', userManagementController.getAllRoles);
router.get('/departments', userManagementController.getAllDepartments);
router.get('/positions', userManagementController.getAllPositions);

module.exports = router;