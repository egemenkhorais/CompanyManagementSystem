const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./config/supabase');

// ROUTES IMPORT
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// TEST ENDPOINTS
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor! 🚀' });
});

app.get('/api/db-test', async (req, res) => {
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

// API ROUTES (YENİ MODÜLER YAPI)
app.use('/api/auth', authRoutes);           // /api/auth/login, /api/auth/register
app.use('/api/departments', departmentRoutes); // /api/departments
app.use('/api/jobposts', jobPostRoutes);    // /api/jobposts

// ESKI ENDPOINT'LER (Geriye dönük uyumluluk için)
const authController = require('./controllers/authController');

app.post('/login', (req, res) => authController.login(req, res));
app.post('/register', (req, res) => authController.register(req, res));

// SERVER START
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 API çalışıyor: http://localhost:${PORT}`);
    console.log(`📁 Modüler yapı aktif!`);
    console.log(`   ✅ Auth: /api/auth/login, /api/auth/register`);
    console.log(`   ✅ Departments: /api/departments`);
    console.log(`   ✅ Job Posts: /api/jobposts`);
    console.log(``);
    console.log(`⚠️  Eski endpoint'ler hala çalışıyor (geriye dönük uyumluluk):`);
    console.log(`   - POST /login → POST /api/auth/login kullanın`);
    console.log(`   - POST /register → POST /api/auth/register kullanın`);
});