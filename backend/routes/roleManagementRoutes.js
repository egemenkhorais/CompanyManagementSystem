const express = require('express');
const router = express.Router();
const roleManagementController = require('../controllers/roleManagementController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm route'lar auth gerektirir
router.use(authMiddleware);

// ============================================
// ROL CRUD İŞLEMLERİ
// ============================================
router.get('/roles', roleManagementController.getAllRoles);
router.get('/roles/:roleId', roleManagementController.getRoleById);
router.post('/roles', roleManagementController.createRole);
router.put('/roles/:roleId', roleManagementController.updateRole);
router.delete('/roles/:roleId', roleManagementController.deleteRole);

// ============================================
// PERMISSION İŞLEMLERİ
// ============================================
// Tüm permissions'ları getir
router.get('/permissions', roleManagementController.getAllPermissions);

// Permission CRUD
router.post('/permissions', roleManagementController.createPermission);
router.put('/permissions/:id', roleManagementController.updatePermission);
router.delete('/permissions/:id', roleManagementController.deletePermission);

// Rolün permissions'larını getir/güncelle
router.get('/roles/:roleId/permissions', roleManagementController.getRolePermissions);
router.put('/roles/:roleId/permissions', roleManagementController.updateRolePermissions);

module.exports = router;