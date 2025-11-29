const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

class AuthService {
    /**
     * Kullanıcı girişi
     */
    async login(username, password) {
        try {
            // Kullanıcıyı username'e göre bul
            const result = await pool.query(`
                SELECT * 
                FROM users 
                WHERE username = '${username}'
            `);

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
            return {
                success: true,
                message: 'Giriş başarılı',
                role: user.role || 'user',
                user: {
                    id: user.userid,
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                }
            };

        } catch (error) {
            console.error('AuthService Login Error:', error);
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
            const userCheck = await pool.query(`
                SELECT username 
                FROM users 
                WHERE username = '${username}'
            `);

            if (userCheck.rows.length > 0) {
                return {
                    success: false,
                    message: 'Bu kullanıcı adı zaten kullanılıyor!'
                };
            }

            // Aynı email var mı kontrol et
            const emailCheck = await pool.query(`
                SELECT email 
                FROM users 
                WHERE email = '${email}'
            `);

            if (emailCheck.rows.length > 0) {
                return {
                    success: false,
                    message: 'Bu e-posta adresi zaten kayıtlı!'
                };
            }

            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 10);

            // Yeni kullanıcı ekle
            const insertResult = await pool.query(`
                INSERT INTO users (username, email, password, full_name, phone, department, role) 
                VALUES ('${username}', '${email}', '${hashedPassword}', '${fullName}', '${phone}', '${department}', 'user') 
                RETURNING userid, username, email
            `);

            const newUser = insertResult.rows[0];

            return {
                success: true,
                message: 'Kayıt başarılı!',
                user: {
                    id: newUser.userid,
                    username: newUser.username,
                    email: newUser.email
                }
            };

        } catch (error) {
            console.error('AuthService Register Error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();