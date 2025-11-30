// Auth Middleware - Token Doğrulama
const { verifyToken } = require('../utils/jwtUtils');

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Header'dan token al
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token bulunamadı! Lütfen giriş yapın.'
            });
        }

        // 2. "Bearer(tasıyıcı) TOKEN" formatından token'ı ayıkla
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        // 3. Token'ı doğrula
        const result = verifyToken(token);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz veya süresi dolmuş token!'
            });
        }

        // 4. Token'dan kullanıcı bilgilerini al ve req.user'a ekle
        req.user = result.data;  // { userid, username, roleid }

        // 5. Devam et
        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası!'
        });
    }
};

module.exports = authMiddleware;