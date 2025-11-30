const { pool } = require('../config/database');

// Kullanıcının permission'ı var mı kontrol et
const checkUserPermission = async (roleid, permissionCode) => {
    try {
        const result = await pool.query(`
            SELECT p.permission_code 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.roleid = $1 AND p.permission_code = $2
        `, [roleid, permissionCode]);

        return result.rows.length > 0;

    } catch (error) {
        console.error('Permission Service Error:', error);
        throw error;
    }
};

// Kullanıcının herhangi bir permission'ı var mı kontrol et
const checkUserAnyPermission = async (roleid, permissionList) => {
    try {
        const result = await pool.query(`
            SELECT p.permission_code 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.roleid = $1 AND p.permission_code = ANY($2)
        `, [roleid, permissionList]);

        return result.rows.length > 0;

    } catch (error) {
        console.error('Permission Service Error:', error);
        throw error;
    }
};

module.exports = {
    checkUserPermission,
    checkUserAnyPermission
};