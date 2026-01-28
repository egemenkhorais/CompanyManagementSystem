require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { pool } = require('./config/database');

// Middleware'ler
const authMiddleware = require('./middlewares/authMiddleware');
const activityMiddleware = require('./middlewares/activityMiddleware');

// Route'lar
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');
const cvRoutes = require('./routes/cvRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const roomsRoutes = require('./routes/roomsRoutes');
const managementRoutes = require('./routes/managementRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const roleManagementRoutes = require('./routes/roleManagementRoutes');

const app = express();

// 1. CORS Ayarı (Frontend Docker'da olduğu için origin'i serbest bırakıyoruz)
app.use(cors());

// 2. CACHE KILLER MIDDLEWARE (Senin asıl sorununun çözümü)
// Bu middleware, tarayıcıya ve Docker network'üne "bu veriyi saklama, her seferinde DB'den çek" der.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// İstek loglama
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- PUBLIC ENDPOINTLER ---
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);

// Auth Middleware öncesi Login/Register
const authController = require('./controllers/authController');
app.post('/login', (req, res) => authController.login(req, res));
app.post('/register', (req, res) => authController.register(req, res));

// --- PROTECTED ENDPOINTLER ---
app.use(authMiddleware);
app.use(activityMiddleware);

// Veritabanı test (Korumalı)
app.get('/api/pool-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT username FROM users LIMIT 3');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route Tanımlamaları
app.use('/api/departments', departmentRoutes);
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/role-management', roleManagementRoutes);

// 3. DOCKER İÇİN HOST AYARI (0.0.0.0)
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu ${PORT} portunda ve 0.0.0.0 adresinde (Docker uyumlu) çalışıyor`);
});