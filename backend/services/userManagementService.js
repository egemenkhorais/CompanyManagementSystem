const { pool } = require('../config/database');

class UserManagementService {
    /**
     * Kullanıcının rolüne göre kullanıcıları getir (userdetails dahil)
     */
    async getAllUsers(currentUserRoleId) {
        try {
            // Kullanıcının rolünü bul
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [currentUserRoleId]
            );
            const roleName = roleResult.rows[0]?.rolename;

            let query;
            let baseQuery = `
                SELECT 
                    u.userid, 
                    u.username, 
                    u.roleid, 
                    r.rolename,
                    ud.name as fullname,
                    ud.usersalary,
                    ud.yearsworked,
                    d.departmentid,
                    d.departmentname,
                    pn.id as positionid,
                    pn.position_name,
                    pn.level as position_level
                FROM users u
                JOIN roles r ON u.roleid = r.roleid
                LEFT JOIN userdetails ud ON u.userid = ud.userid
                LEFT JOIN departments d ON ud.departmentid = d.departmentid
                LEFT JOIN positionnames pn ON ud.positionnames_id = pn.id
            `;

            if (roleName === 'admin' || roleName === 'hr') {
                // Admin/HR: herkesi gör
                query = baseQuery + ` ORDER BY u.userid`;
            } else if (roleName.startsWith('backend_')) {
                // Backend: sadece backend kullanıcıları
                query = baseQuery + ` WHERE r.rolename LIKE 'backend_%' ORDER BY u.userid`;
            } else if (roleName.startsWith('qa_')) {
                // QA: sadece QA kullanıcıları
                query = baseQuery + ` WHERE r.rolename LIKE 'qa_%' ORDER BY u.userid`;
            } else {
                return { success: false, message: 'Yetkiniz yok!' };
            }

            const result = await pool.query(query);
            return { success: true, data: result.rows };

        } catch (error) {
            console.error('UserManagementService getAllUsers Error:', error);
            throw error;
        }
    }

    /**
     * Tek kullanıcı getir (userdetails dahil)
     */
    async getUserById(userId) {
        try {
            const result = await pool.query(`
                SELECT
                    u.userid,
                    u.username,
                    u.roleid,
                    r.rolename,
                    ud.userdetailsid,
                    ud.name as fullname,
                    ud.usersalary,
                    ud.yearsworked,
                    d.departmentid,
                    d.departmentname,
                    pn.id as positionid,
                    pn.position_name,
                    pn.level as position_level
                FROM users u
                         JOIN roles r ON u.roleid = r.roleid
                         LEFT JOIN userdetails ud ON u.userid = ud.userid
                         LEFT JOIN departments d ON ud.departmentid = d.departmentid
                         LEFT JOIN positionnames pn ON ud.positionnames_id = pn.id
                WHERE u.userid = $1
            `, [userId]);

            if (result.rows.length === 0) {
                return { success: false, message: 'Kullanıcı bulunamadı!' };
            }

            return { success: true, data: result.rows[0] };

        } catch (error) {
            console.error('UserManagementService getUserById Error:', error);
            throw error;
        }
    }

    /**
     * Kullanıcı güncelle (users + userdetails)
     */
    async updateUser(userId, userData) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { username, roleid, fullname, departmentid, positionid, usersalary, yearsworked } = userData;

            // 1. users tablosunu güncelle
            await client.query(`
                UPDATE users
                SET username = $1, roleid = $2
                WHERE userid = $3
            `, [username, roleid, userId]);

            // 2. userdetails var mı kontrol et
            const detailsCheck = await client.query(
                'SELECT userdetailsid FROM userdetails WHERE userid = $1',
                [userId]
            );

            if (detailsCheck.rows.length > 0) {
                // userdetails varsa güncelle
                await client.query(`
                    UPDATE userdetails
                    SET name = $1, 
                        departmentid = $2, 
                        positionnames_id = $3,
                        usersalary = $4,
                        yearsworked = $5
                    WHERE userid = $6
                `, [fullname, departmentid, positionid, usersalary, yearsworked, userId]);
            } else if (fullname || departmentid || positionid) {
                // userdetails yoksa ve bilgi varsa yeni kayıt oluştur
                await client.query(`
                    INSERT INTO userdetails (userid, name, departmentid, positionnames_id, usersalary, yearsworked, companyid)
                    VALUES ($1, $2, $3, $4, $5, $6, 1)
                `, [userId, fullname, departmentid, positionid, usersalary || 0, yearsworked || 0]);
            }

            await client.query('COMMIT');

            return { success: true, message: 'Kullanıcı güncellendi!' };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('UserManagementService updateUser Error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Kullanıcı sil (userdetails de silinir)
     */
    async deleteUser(userId) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Önce userdetails sil
            await client.query('DELETE FROM userdetails WHERE userid = $1', [userId]);

            // Sonra users sil
            const result = await client.query(
                'DELETE FROM users WHERE userid = $1 RETURNING userid',
                [userId]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, message: 'Kullanıcı bulunamadı!' };
            }

            await client.query('COMMIT');
            return { success: true, message: 'Kullanıcı silindi!' };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('UserManagementService deleteUser Error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Tüm rolleri getir (dropdown için)
     */
    async getAllRoles() {
        try {
            const result = await pool.query(
                'SELECT roleid, rolename FROM roles ORDER BY roleid'
            );
            return { success: true, data: result.rows };

        } catch (error) {
            console.error('UserManagementService getAllRoles Error:', error);
            throw error;
        }
    }

    /**
     * Tüm departmanları getir (dropdown için)
     */
    async getAllDepartments() {
        try {
            const result = await pool.query(
                'SELECT departmentid, departmentname FROM departments ORDER BY departmentid'
            );
            return { success: true, data: result.rows };

        } catch (error) {
            console.error('UserManagementService getAllDepartments Error:', error);
            throw error;
        }
    }

    /**
     * Tüm pozisyonları getir (dropdown için)
     */
    async getAllPositions() {
        try {
            const result = await pool.query(`
                SELECT id, position_name, level, 
                       position_name || ' - ' || level as display_name
                FROM positionnames 
                WHERE is_active = true
                ORDER BY position_name, level
            `);
            return { success: true, data: result.rows };

        } catch (error) {
            console.error('UserManagementService getAllPositions Error:', error);
            throw error;
        }
    }

    /**
     * Departmana göre pozisyonları getir
     */
    async getPositionsByDepartment(departmentId) {
        try {
            const result = await pool.query(`
                SELECT pn.id, pn.position_name, pn.level,
                       pn.position_name || ' - ' || pn.level as display_name
                FROM positions p
                JOIN positionnames pn ON p.position_name_id = pn.id
                WHERE p.departmentid = $1 AND p.is_active = true AND pn.is_active = true
                ORDER BY pn.position_name, pn.level
            `, [departmentId]);

            return { success: true, data: result.rows };
        } catch (error) {
            console.error('UserManagementService getPositionsByDepartment Error:', error);
            throw error;
        }
    }

    /**
     * Yeni kullanıcı oluştur
     */
    async createUser(userData) {
        const client = await pool.connect();
        const bcrypt = require('bcrypt');

        try {
            await client.query('BEGIN');

            const { username, password, roleid, fullname, departmentid, positionid, usersalary, yearsworked } = userData;

            // Username kontrolü
            const userCheck = await client.query(
                'SELECT userid FROM users WHERE username = $1',
                [username]
            );

            if (userCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor!' };
            }

            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 10);

            // Users tablosuna ekle
            const userResult = await client.query(
                `INSERT INTO users (username, password, roleid) 
                 VALUES ($1, $2, $3) 
                 RETURNING userid`,
                [username, hashedPassword, roleid]
            );

            const newUserId = userResult.rows[0].userid;

            // Userdetails tablosuna ekle
            await client.query(
                `INSERT INTO userdetails (userid, name, departmentid, positionnames_id, usersalary, yearsworked, companyid)
                 VALUES ($1, $2, $3, $4, $5, $6, 1)`,
                [newUserId, fullname, departmentid, positionid, usersalary || 0, yearsworked || 0]
            );

            await client.query('COMMIT');

            return {
                success: true,
                message: 'Kullanıcı başarıyla oluşturuldu',
                data: { userid: newUserId, username, fullname }
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('UserManagementService createUser Error:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new UserManagementService();