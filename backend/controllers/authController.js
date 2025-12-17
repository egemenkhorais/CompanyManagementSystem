const authService = require('../services/AuthService');
const { pool } = require('../config/database');

class AuthController {
    /**
     * Login İşlemi
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı adı ve şifre gereklidir!'
                });
            }

            const result = await authService.login(username, password);

            if (!result.success) {
                return res.status(401).json(result);
            }

            res.json(result);

        } catch (error) {
            console.error('AuthController Login Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu tarafında bir hata oluştu.'
            });
        }
    }

    /**
     * Kullanıcının yetkilerini getir
     */
    async getMyPermissions(req, res) {
        try {
            const userId = req.user.id;
            const permissions = await authService.getUserPermissions(userId);

            res.json({
                success: true,
                permissions: permissions
            });

        } catch (error) {
            console.error('AuthController GetPermissions Error:', error);
            res.status(500).json({
                success: false,
                message: 'Yetkiler alınamadı.'
            });
        }
    }

    /**
     * Kullanıcı detaylarını getir (Dashboard için)
     */
    async getUserDetails(req, res) {
        try {
            const userId = req.user.id; // Token'dan al

            const query = `
                SELECT
                ud.userdetailsid,
                ud.userid,
                ud.usersalary,
                ud.yearsworked,
                pn.position_name,
                pn.level,
                d.departmentname
                FROM userdetails ud
                LEFT JOIN positions p ON ud.positionnames_id = p.id
                LEFT JOIN positionnames pn ON p.position_name_id = pn.id
                LEFT JOIN departments d ON p.departmentid = d.id
                WHERE ud.userid = $1
            `;

            const result = await pool.query(query, [userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Kullanıcı detayları bulunamadı'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('AuthController getUserDetails Error:', error);
            res.status(500).json({
                success: false,
                message: 'Kullanıcı detayları yüklenirken hata oluştu',
                error: error.message
            });
        }
    }

    /**
     * Register İşlemi
     */
    async register(req, res) {
        try {
            const { username, email, password, fullName, phone, department } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı adı ve şifre gereklidir!'
                });
            }

            const result = await authService.register({
                username,
                email,
                password,
                fullName,
                phone,
                department
            });

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);

        } catch (error) {
            console.error('AuthController Register Error:', error);
            res.status(500).json({
                success: false,
                message: 'Kayıt sırasında bir hata oluştu.'
            });
        }
    }
}

module.exports = new AuthController();