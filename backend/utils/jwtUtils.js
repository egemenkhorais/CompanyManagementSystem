// JWT Token Araçları
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Token oluştur
const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Token doğrula
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Token'dan kullanıcı bilgisi al
const getUserFromToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    getUserFromToken
};