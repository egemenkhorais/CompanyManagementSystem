const authService = require('../services/AuthService');

class AuthController {
    /**
     * Login İşlemi
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validasyon
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı adı ve şifre gereklidir!'
                });
            }

            // Service'i çağır
            const result = await authService.login(username, password);

            // Başarısızsa 401 döndür
            if (!result.success) {
                return res.status(401).json(result);
            }

            // Başarılıysa 200 döndür
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
     * Register İşlemi
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { username, email, password, fullName, phone, department } = req.body;

            // Validasyon
            if (!username || !email || !password || !fullName) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı adı, email, şifre ve tam ad gereklidir!'
                });
            }

            // Service'i çağır
            const result = await authService.register({
                username,
                email,
                password,
                fullName,
                phone,
                department
            });

            // Başarısızsa 400 döndür
            if (!result.success) {
                return res.status(400).json(result);
            }

            // Başarılıysa 201 döndür
            res.status(201).json(result);

        } catch (error) {
            console.error('AuthController Register Error:', error);
            res.status(500).json({
                success: false,
                message: 'Kayıt sırasında bir hata oluştu: ' + error.message
            });
        }
    }
}

// Singleton pattern
module.exports = new AuthController();