const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const authMiddleware = require('../middlewares/authMiddleware');
const activityMiddleware = require('../middlewares/activityMiddleware');

// MIDDLEWARE SIRALAMASI (Çok Önemli)
// 1. Önce kimlik doğrula (req.user oluşsun)
router.use(authMiddleware);

// 2. Sonra aktiviteyi kaydet (Kullanıcı online görünsün)
router.use(activityMiddleware);

//ROUTE TANIMLARI
// Kullanıcı işlemleri
router.get('/users', userManagementController.getAllUsers);
router.post('/users', userManagementController.createUser); // Yeni oluşturma
router.get('/users/:userId', userManagementController.getUserById);
router.put('/users/:userId', userManagementController.updateUser);
router.delete('/users/:userId', userManagementController.deleteUser);

// Dropdown verileri
router.get('/roles', userManagementController.getAllRoles);
router.get('/departments', userManagementController.getAllDepartments);
router.get('/positions', userManagementController.getAllPositions);
router.get('/positions/:departmentId', userManagementController.getPositionsByDepartment);

// Takım seçimi için kullanıcıları getir
router.get('/users-for-team', userManagementController.getAllUsersForTeam);

module.exports = router;