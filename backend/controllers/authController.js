const authService = require('../services/AuthService');

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