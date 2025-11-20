const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'egemenkeles',
    host: 'localhost',
    database: 'deneme',
    password: '1525Egos35.',
    port: 5432,
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("--------------------------------------------------");
    console.log("1. İSTEK GELDİ -> Username:", username, " | Şifre:", password);

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        console.log("2. DB SONUCU -> Bulunan Satır Sayısı:", result.rows.length);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log("3. DB'DEKİ HASH:", user.password);

            const isMatch = await bcrypt.compare(password, user.password);
            console.log("4. KARŞILAŞTIRMA SONUCU (isMatch):", isMatch);

            if (isMatch) {
                console.log("SONUÇ: BAŞARILI!");
                res.json({ success: true, message: "Giriş Başarılı" });
            } else {
                console.log("SONUÇ: HASH EŞLEŞMEDİ (Şifre Yanlış)");
                res.status(401).json({ success: false, message: "Hatalı Şifre" });
            }
        } else {
            console.log("SONUÇ: KULLANICI BULUNAMADI (Tabloda yok)");
            res.status(404).json({ success: false, message: "Kullanıcı Bulunamadı" });
        }
    } catch (err) {
        console.error("KRİTİK HATA:", err);
        res.status(500).send("Server Hatası");
    }
});

app.listen(5001, () => {
    console.log("Server 5001 portunda çalışıyor... (Debug Modu)");
});