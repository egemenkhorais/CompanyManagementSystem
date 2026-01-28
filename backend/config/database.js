const { Pool } = require('pg');

// .env zaten index.js'de yüklendi ama double-check için:
if (!process.env.DB_HOST) {
    console.error('❌ HATA: .env dosyası yüklenmedi!');
    console.error('Mevcut env variables:', Object.keys(process.env).filter(k => k.startsWith('DB_')));
    process.exit(1);
}

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

// Bağlantı logları
pool.on('connect', () => {
    console.log('✅ Supabase veritabanı bağlantısı başarılı');
});

pool.on('error', (err) => {
    console.error('❌ Veritabanı hatası:', err.message);
});

// Test sorgusu
pool.query('SELECT NOW() as current_time', (err, res) => {
    if (err) {
        console.error('❌ Veritabanı bağlantı testi BAŞARISIZ:', err.message);
    } else {
        console.log('✅ Veritabanı test sorgusu başarılı:', res.rows[0].current_time);
    }
});

module.exports = { pool };