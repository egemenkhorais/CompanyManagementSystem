const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwtUtils');
const { pool } = require('../config/database');

class AuthService {
    /**
     * Kullanıcı girişi (Departman ID Sorununu Çözen Versiyon)
     */
    async login(username, password) {
        try {
            // 1. ADIM: Kullanıcıyı bul
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            const user = result.rows[0];

            if (!user) {
                return { success: false, message: 'Kullanıcı adı veya şifre hatalı!' };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return { success: false, message: 'Şifre hatalı!' };
            }

            // 2. ADIM: Departman bilgisini çek (DÜZELTME: COALESCE ile null kontrolü)
            let deptInfo = { id: null, name: 'Belirtilmemiş' };

            try {
                const deptQuery = `
                    SELECT
                        COALESCE(ud.departmentid, 0) as departmentid,
                        COALESCE(d.departmentname, 'Belirtilmemiş') as departmentname
                    FROM userdetails ud
                    LEFT JOIN departments d ON ud.departmentid = d.departmentid
                    WHERE ud.userid = $1
                    LIMIT 1
                `;
                const deptResult = await pool.query(deptQuery, [user.userid]);

                if (deptResult.rows.length > 0) {
                    const row = deptResult.rows[0];
                    deptInfo = {
                        id: row.departmentid || null,
                        name: row.departmentname || 'Belirtilmemiş'
                    };
                }

                console.log('✅ Departman bilgisi çekildi:', deptInfo);

            } catch (err) {
                console.error("⚠️ Departman çekme hatası:", err.message);
            }

            // 3. ADIM: Token oluştur
            const token = jwtUtils.generateToken({
                id: user.userid,
                username: user.username,
                email: user.email,
                roleid: user.roleid,
                departmentid: deptInfo.id // TOKEN'a da ekliyoruz
            });

            // 4. ADIM: Response döndür
            return {
                success: true,
                message: 'Giriş başarılı',
                token: token,
                user: {
                    id: user.userid,
                    username: user.username,
                    email: user.email,
                    roleid: user.roleid,
                    fullname: user.fullname || user.username,
                    // ⚠️ KRITIK: Bu alanlar frontend'de kullanılıyor
                    departmentid: deptInfo.id,
                    departmentname: deptInfo.name
                }
            };

        } catch (error) {
            console.error('❌ AuthService Login Error:', error);
            throw error;
        }
    }

    async getUserPermissions(userId) {
        try {
            const result = await pool.query(`
                SELECT p.id, p.permission_code, p.permission_type, p.description, p.parent_code
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN users u ON rp.roleid = u.roleid
                WHERE u.userid = $1
                ORDER BY p.permission_type, p.permission_code
            `, [userId]);
            return result.rows;
        } catch (error) {
            console.error('AuthService GetPermissions Error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const { username, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertResult = await pool.query(
                'INSERT INTO users (username, password, roleid) VALUES ($1, $2, $3) RETURNING userid, username',
                [username, hashedPassword, 3]
            );
            return { success: true, message: 'Kayıt başarılı!', user: insertResult.rows[0] };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService();