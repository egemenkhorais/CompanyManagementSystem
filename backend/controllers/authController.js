const authService = require('../services/AuthService');
// DİKKAT: pool (database) require'ı buradan kaldırıldı. Controller veritabanını bilmez.

class AuthController {
    /**
     * Login İşlemi
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Basit Validasyon (Controller seviyesinde kalabilir)
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı adı ve şifre gereklidir!'
                });
            }

            // İş mantığı servise devredildi
            const result = await authService.login(username, password);

            if (!result.success) {
                return res.status(401).json(result);
            }

            res.json(result);

        } catch (error) {
            // Servis katmanında loglanıyor ama HTTP yanıtı için burada catch şart
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
            res.status(500).json({
                success: false,
                message: 'Yetkiler alınamadı.'
            });
        }
    }

    /**
     * Kullanıcı detaylarını getir (Dashboard için)
     * REFACTOR NOTU: SQL sorgusu buradan tamamen temizlendi.
     */
    async getUserDetails(req, res) {
        try {
            const userId = req.user.id;

            // Service çağrısı
            const userDetails = await authService.getUserDetails(userId);

            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Kullanıcı detayları bulunamadı'
                });
            }

            res.json({
                success: true,
                data: userDetails
            });

        } catch (error) {
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
            res.status(500).json({
                success: false,
                message: 'Kayıt sırasında bir hata oluştu.'
            });
        }
    }
}

module.exports = new AuthController();