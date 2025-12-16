const { pool } = require('../config/database');

const updateLastActivity = async (req, res, next) => {
    // JWT'den gelen veride bazen 'id' bazen 'userid' olabiliyor, ikisini de kontrol edelim
    const userId = req.user?.userid || req.user?.id;

    if (userId) {
        try {
            // Logu temiz tutmak için sadece başarılı olduğunda yazmayalım, gerekirse açarsın
            await pool.query(
                'UPDATE users SET last_activity = NOW() WHERE userid = $1',
                [userId]
            );
            // console.log(`>>> UserID ${userId} güncellendi.`);
        } catch (error) {
            console.error('Activity Middleware Error:', error.message);
        }
    }
    next();
};

module.exports = updateLastActivity;