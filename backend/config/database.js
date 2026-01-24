// PostgreSQL bağlantı havuzu
const { Pool } = require('pg');
require('dotenv').config();

// Bağlantı havuzu oluşturma
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 3,                    // Maksimum 3 client (Supabase free tier için güvenli)
    idleTimeoutMillis: 30000,  // 30 saniye boşta kalırsa kapat
    connectionTimeoutMillis: 5000 // 5 saniye içinde bağlanamazsa hata ver
});

// İlk bağlantı kontrolü
let isConnected = false;
pool.on('connect', () => {
    if (!isConnected) {
        console.log('Veritabanı bağlantısı başarılı');
        isConnected = true;
    }
});

// Hata yakalama
pool.on('error', (err) => {
    console.error('Veritabanı hatası:', err);
});

module.exports = { pool };