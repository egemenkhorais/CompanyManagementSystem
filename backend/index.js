const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool } = require('./config/database');

// Yeni Middleware'leri İçe Aktar
const authMiddleware = require('./middlewares/authMiddleware');
const activityMiddleware = require('./middlewares/activityMiddleware');

// Route tanımlamaları
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

// Middleware tanımlamaları
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// İstek loglama middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// --- HERKESE AÇIK (PUBLIC) ENDPOINTLER ---
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor' });
});

app.use('/api/auth', authRoutes);
const authController = require('./controllers/authController');
app.post('/login', (req, res) => authController.login(req, res));
app.post('/register', (req, res) => authController.register(req, res));
app.use(authMiddleware);
app.use(activityMiddleware);

// Veritabanı bağlantı test endpoint (Artık korumalı alanda)
app.get('/api/pool-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT username FROM users LIMIT 3');
        res.json({
            success: true,
            message: 'Veritabanı bağlantısı başarılı',
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API route tanımlamaları (Hepsi artık aktivite takibi yapıyor)
app.use('/api/departments', departmentRoutes);
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/role-management', roleManagementRoutes);

// Sunucu başlatma
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});