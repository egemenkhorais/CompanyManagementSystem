const userManagementService = require('../services/userManagementService');

// Tüm kullanıcıları getir
const getAllUsers = async (req, res) => {
    try {
        const result = await userManagementService.getAllUsers(req.user.roleid);

        if (!result.success) {
            return res.status(403).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller getAllUsers Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Tek kullanıcı getir
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await userManagementService.getUserById(userId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller getUserById Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Kullanıcı güncelle
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await userManagementService.updateUser(userId, req.body);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller updateUser Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Kullanıcı sil
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await userManagementService.deleteUser(userId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Controller deleteUser Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Tüm rolleri getir
const getAllRoles = async (req, res) => {
    try {
        const result = await userManagementService.getAllRoles();
        res.json(result);
    } catch (error) {
        console.error('Controller getAllRoles Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Tüm departmanları getir
const getAllDepartments = async (req, res) => {
    try {
        const result = await userManagementService.getAllDepartments();
        res.json(result);
    } catch (error) {
        console.error('Controller getAllDepartments Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

// Tüm pozisyonları getir
const getAllPositions = async (req, res) => {
    try {
        const result = await userManagementService.getAllPositions();
        res.json(result);
    } catch (error) {
        console.error('Controller getAllPositions Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllRoles,
    getAllDepartments,
    getAllPositions
};