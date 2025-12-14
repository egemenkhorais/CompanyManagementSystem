const roleManagementService = require('../services/roleManagementService');

// Tüm rolleri getir
const getAllRoles = async (req, res) => {
    try {
        const result = await roleManagementService.getAllRoles();
        res.json(result);
    } catch (error) {
        console.error('Controller getAllRoles Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Tek rol getir
const getRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        const result = await roleManagementService.getRoleById(roleId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller getRoleById Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Yeni rol oluştur
const createRole = async (req, res) => {
    try {
        const { rolename } = req.body;

        if (!rolename || rolename.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rol adı zorunludur!'
            });
        }

        const result = await roleManagementService.createRole(rolename.trim());

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Controller createRole Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Rol güncelle
const updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { rolename } = req.body;

        if (!rolename || rolename.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rol adı zorunludur!'
            });
        }

        const result = await roleManagementService.updateRole(roleId, rolename.trim());

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller updateRole Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Rol sil
const deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const result = await roleManagementService.deleteRole(roleId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller deleteRole Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Tüm permission'ları getir (tree yapısında)
const getAllPermissions = async (req, res) => {
    try {
        const result = await roleManagementService.getAllPermissions();
        res.json(result);
    } catch (error) {
        console.error('Controller getAllPermissions Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Rolün permission'larını getir
const getRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const result = await roleManagementService.getRolePermissions(roleId);
        res.json(result);
    } catch (error) {
        console.error('Controller getRolePermissions Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Rolün permission'larını güncelle
const updateRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;

        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({
                success: false,
                message: 'permissionIds array olmalıdır!'
            });
        }

        const result = await roleManagementService.updateRolePermissions(roleId, permissionIds);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller updateRolePermissions Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// ============================================
// PERMISSION CRUD - YENİ EKLENENLER
// ============================================

// Yeni permission oluştur
const createPermission = async (req, res) => {
    try {
        const result = await roleManagementService.createPermission(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Controller createPermission Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Yetki oluşturulurken hata oluştu'
        });
    }
};

// Permission güncelle
const updatePermission = async (req, res) => {
    try {
        const result = await roleManagementService.updatePermission(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Controller updatePermission Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Yetki güncellenirken hata oluştu'
        });
    }
};

// Permission sil
const deletePermission = async (req, res) => {
    try {
        const result = await roleManagementService.deletePermission(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Controller deletePermission Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Yetki silinirken hata oluştu'
        });
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions,
    getRolePermissions,
    updateRolePermissions,
    createPermission,
    updatePermission,
    deletePermission
};