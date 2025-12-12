const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwtUtils');
const { pool } = require('../config/database');

class AuthService {
    /**
     * Kullanıcı girişi
     */
    async login(username, password) {
        try {
            // Kullanıcıyı username'e göre bul
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            const user = result.rows[0];

            if (!user) {
                return {
                    success: false,
                    message: 'Kullanıcı adı veya şifre hatalı!'
                };
            }

            // Şifre kontrolü
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return {
                    success: false,
                    message: 'Şifre hatalı!'
                };
            }

            // Başarılı giriş
            const token = jwtUtils.generateToken({
                id: user.userid,
                username: user.username,
                email: user.email,
                roleid: user.roleid
            });

            return {
                success: true,
                message: 'Giriş başarılı',
                token: token,
                user: {
                    id: user.userid,
                    username: user.username,
                    email: user.email,
                    roleid: user.roleid
                }
            };

        } catch (error) {
            console.error('AuthService Login Error:', error);
            throw error;
        }
    } 

    /**
     * Kullanıcının yetkilerini getir
     */
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

    /**
     * Kullanıcı kaydı
     */
    async register(userData) {
        try {
            const { username, email, password, fullName, phone, department } = userData;

            // Aynı username var mı kontrol et
            const userCheck = await pool.query(
                'SELECT username FROM users WHERE username = $1',
                [username]
            );

            if (userCheck.rows.length > 0) {
                return {
                    success: false,
                    message: 'Bu kullanıcı adı zaten kullanılıyor!'
                };
            }

            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 10);

            // Yeni kullanıcı ekle (varsayılan rol: 3 - backend_junior)
            const insertResult = await pool.query(
                'INSERT INTO users (username, password, roleid) VALUES ($1, $2, $3) RETURNING userid, username',
                [username, hashedPassword, 3]
            );

            const newUser = insertResult.rows[0];

            return {
                success: true,
                message: 'Kayıt başarılı!',
                user: {
                    id: newUser.userid,
                    username: newUser.username
                }
            };

        } catch (error) {
            console.error('AuthService Register Error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();