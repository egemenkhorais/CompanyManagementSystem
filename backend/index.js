const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor! 🚀' });
});

// Supabase bağlantı testi
app.get('/api/db-test', async (req, res) => {
    const supabase = require('./config/supabase');

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .limit(1);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Supabase bağlantısı başarılı!',
            sample: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 API çalışıyor: http://localhost:${PORT}`);
});
