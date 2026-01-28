const AuthService = require('../services/authService');

class AuthController {
    /**
     * Login İşlemi
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            console.log('📥 Login request:', { username });

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı adı ve şifre gereklidir!'
                });
            }

            const result = await AuthService.login(username, password);

            if (!result.success) {
                console.log('❌ Login failed:', result.message);
                return res.status(401).json(result);
            }

            console.log('✅ Login successful for:', username);
            res.json(result);

        } catch (error) {
            console.error('❌ Login Controller Hatası:', error);
            console.error('Stack:', error.stack);

            res.status(500).json({
                success: false,
                message: 'Sunucu tarafında bir hata oluştu.',
                error: error.message
            });
        }
    }

    /**
     * Kullanıcının yetkilerini getir
     */
    async getMyPermissions(req, res) {
        try {
            console.log('📥 Get permissions for user:', req.user?.id);

            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bulunamadı'
                });
            }

            const userId = req.user.id;
            const permissions = await AuthService.getUserPermissions(userId);

            console.log('✅ Permissions found:', permissions);

            res.json({
                success: true,
                permissions: permissions
            });

        } catch (error) {
            console.error('❌ Get Permissions Error:', error);
            console.error('Stack:', error.stack);

            res.status(500).json({
                success: false,
                message: 'Yetkiler alınamadı.',
                error: error.message
            });
        }
    }

    /**
     * Kullanıcı detaylarını getir
     */
    async getUserDetails(req, res) {
        try {
            console.log('📥 Get user details for:', req.user?.id);

            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bulunamadı'
                });
            }

            const userId = req.user.id;
            const userDetails = await AuthService.getUserDetails(userId);

            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Kullanıcı detayları bulunamadı'
                });
            }

            console.log('✅ User details found for:', userDetails.username);

            res.json({
                success: true,
                data: userDetails
            });

        } catch (error) {
            console.error('❌ Get User Details Error:', error);
            console.error('Stack:', error.stack);

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

            const result = await AuthService.register({
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
            console.error('❌ Register Error:', error);
            res.status(500).json({
                success: false,
                message: 'Kayıt sırasında bir hata oluştu.',
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();