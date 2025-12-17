const { pool } = require('../config/database');

class RoleManagementService {
    /**
     * Tüm rolleri getir
     */
    async getAllRoles() {
        try {
            const result = await pool.query(`
                SELECT r.roleid,
                       r.rolename,
                       COUNT(DISTINCT u.userid)         as user_count,
                       COUNT(DISTINCT rp.permission_id) as permission_count
                FROM roles r
                         LEFT JOIN users u ON r.roleid = u.roleid
                         LEFT JOIN role_permissions rp ON r.roleid = rp.roleid
                GROUP BY r.roleid, r.rolename
                ORDER BY r.roleid
            `);

            return {success: true, data: result.rows};
        } catch (error) {
            console.error('RoleManagementService getAllRoles Error:', error);
            throw error;
        }
    }

    /**
     * Tek rol getir
     */
    async getRoleById(roleId) {
        try {
            const result = await pool.query(`
                SELECT roleid, rolename
                FROM roles
                WHERE roleid = $1
            `, [roleId]);

            if (result.rows.length === 0) {
                return {success: false, message: 'Rol bulunamadı!'};
            }

            return {success: true, data: result.rows[0]};
        } catch (error) {
            console.error('RoleManagementService getRoleById Error:', error);
            throw error;
        }
    }

    /**
     * Yeni rol oluştur
     */
    async createRole(roleName) {
        try {
            const result = await pool.query(`
                INSERT INTO roles (rolename)
                VALUES ($1) RETURNING roleid, rolename
            `, [roleName]);

            return {
                success: true,
                message: 'Rol başarıyla oluşturuldu!',
                data: result.rows[0]
            };
        } catch (error) {
            if (error.code === '23505') {
                return {success: false, message: 'Bu rol adı zaten kullanılıyor!'};
            }
            console.error('RoleManagementService createRole Error:', error);
            throw error;
        }
    }

    /**
     * Rol güncelle
     */
    async updateRole(roleId, roleName) {
        try {
            const result = await pool.query(`
                UPDATE roles
                SET rolename = $1
                WHERE roleid = $2 RETURNING roleid, rolename
            `, [roleName, roleId]);

            if (result.rows.length === 0) {
                return {success: false, message: 'Rol bulunamadı!'};
            }

            return {
                success: true,
                message: 'Rol başarıyla güncellendi!',
                data: result.rows[0]
            };
        } catch (error) {
            if (error.code === '23505') {
                return {success: false, message: 'Bu rol adı zaten kullanılıyor!'};
            }
            console.error('RoleManagementService updateRole Error:', error);
            throw error;
        }
    }

    /**
     * Rol sil (kullanıcı kontrolü ile)
     */
    async deleteRole(roleId) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Bu role atanmış kullanıcı var mı kontrol et
            const userCheck = await client.query(
                'SELECT COUNT(*) as count FROM users WHERE roleid = $1',
                [roleId]
            );

            if (parseInt(userCheck.rows[0].count) > 0) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    message: 'Bu role atanmış kullanıcılar var! Rol silinemez.'
                };
            }

            // Önce role_permissions'dan sil
            await client.query(
                'DELETE FROM role_permissions WHERE roleid = $1',
                [roleId]
            );

            // Sonra rolü sil
            const result = await client.query(
                'DELETE FROM roles WHERE roleid = $1 RETURNING roleid',
                [roleId]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return {success: false, message: 'Rol bulunamadı!'};
            }

            await client.query('COMMIT');
            return {success: true, message: 'Rol başarıyla silindi!'};

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('RoleManagementService deleteRole Error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Tüm permission'ları tree yapısında getir
     */
    async getAllPermissions() {
        try {
            const result = await pool.query(`
                SELECT id,
                       permission_code,
                       permission_type,
                       description,
                       parent_code
                FROM permissions
                ORDER BY CASE
                             WHEN parent_code IS NULL THEN 0
                             ELSE 1
                             END,
                         parent_code,
                         permission_code
            `);

            return {success: true, data: result.rows};
        } catch (error) {
            console.error('RoleManagementService getAllPermissions Error:', error);
            throw error;
        }
    }

    /**
     * Permission'ları tree yapısına dönüştür
     */
    buildPermissionTree(permissions) {
        const map = {};
        const roots = [];

        permissions.forEach(permission => {
            map[permission.permission_code] = {
                ...permission,
                children: []
            };
        });

        permissions.forEach(permission => {
            if (permission.parent_code && map[permission.parent_code]) {
                map[permission.parent_code].children.push(map[permission.permission_code]);
            } else if (!permission.parent_code) {
                roots.push(map[permission.permission_code]);
            }
        });

        return roots;
    }

    /**
     * Belirli bir rolün permission'larını getir
     */
    async getRolePermissions(roleId) {
        try {
            const result = await pool.query(`
                SELECT p.id,
                       p.permission_code,
                       p.permission_type,
                       p.description,
                       p.parent_code
                FROM role_permissions rp
                         JOIN permissions p ON rp.permission_id = p.id
                WHERE rp.roleid = $1
                ORDER BY p.permission_code
            `, [roleId]);

            return {success: true, data: result.rows};
        } catch (error) {
            console.error('RoleManagementService getRolePermissions Error:', error);
            throw error;
        }
    }

    /**
     * Rolün permission'larını güncelle
     */
    async updateRolePermissions(roleId, permissionIds) {
        try {
            // Önce mevcut permissions'ları al
            const current = await pool.query(`
                SELECT permission_id
                FROM role_permissions
                WHERE roleid = $1
            `, [roleId]);

            const currentIds = current.rows.map(r => r.permission_id);

            // Sadece değişenleri işle
            const toAdd = permissionIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !permissionIds.includes(id));

            // Transaction başlat
            await pool.query('BEGIN');

            // Yeni permissions ekle
            for (const permId of toAdd) {
                await pool.query(`
                    INSERT INTO role_permissions (roleid, permission_id)
                    VALUES ($1, $2) ON CONFLICT (roleid, permission_id) DO NOTHING
                `, [roleId, permId]);
            }

            // Sadece SEÇILEN permissions'ları kaldır
            for (const permId of toRemove) {
                await pool.query(`
                    DELETE FROM role_permissions
                    WHERE roleid = $1 AND permission_id = $2
                `, [roleId, permId]);
            }

            await pool.query('COMMIT');

            return {success: true, message: 'Permissions updated successfully'};
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('RoleManagementService updateRolePermissions Error:', error);
            throw error;
        }
    }

    /**
     * Yeni permission oluştur
     */
    async createPermission(permissionData) {
        try {
            const { permission_code, permission_type, description, parent_code } = permissionData;

            const result = await pool.query(`
                INSERT INTO permissions (permission_code, permission_type, description, parent_code)
                VALUES ($1, $2, $3, $4)
                    RETURNING *
            `, [permission_code, permission_type, description, parent_code || null]);

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('RoleManagementService createPermission Error:', error);
            throw error;
        }
    }

    /**
     * Permission güncelle
     */
    async updatePermission(permissionId, permissionData) {
        try {
            const { permission_code, permission_type, description, parent_code } = permissionData;

            const result = await pool.query(`
                UPDATE permissions
                SET permission_code = $1,
                    permission_type = $2,
                    description = $3,
                    parent_code = $4
                WHERE id = $5
                    RETURNING *
            `, [permission_code, permission_type, description, parent_code || null, permissionId]);

            if (result.rows.length === 0) {
                throw new Error('Permission not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('RoleManagementService updatePermission Error:', error);
            throw error;
        }
    }

    /**
     * Permission sil
     */
    async deletePermission(permissionId) {
        try {
            // Önce bu permission'ın child'ı var mı kontrol et
            const childCheck = await pool.query(`
                SELECT COUNT(*) as count
                FROM permissions
                WHERE parent_code = (SELECT permission_code FROM permissions WHERE id = $1)
            `, [permissionId]);

            if (parseInt(childCheck.rows[0].count) > 0) {
                throw new Error('Bu yetkinin alt yetkileri var. Önce onları silmelisiniz.');
            }

            // Role_permissions tablosundan sil
            await pool.query(`
                DELETE FROM role_permissions WHERE permission_id = $1
            `, [permissionId]);

            // Permission'ı sil
            const result = await pool.query(`
                DELETE FROM permissions WHERE id = $1 RETURNING *
            `, [permissionId]);

            if (result.rows.length === 0) {
                throw new Error('Permission not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('RoleManagementService deletePermission Error:', error);
            throw error;
        }
    }
}

module.exports = new RoleManagementService();