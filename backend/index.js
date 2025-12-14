const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool } = require('./config/database');

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
app.use(express.json({ limit: '50mb' })); // JSON body limiti
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // URL encoded body limiti

// İstek loglama middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});



// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor' });
});

// Veritabanı bağlantı test endpoint
app.get('/api/pool-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT username FROM users LIMIT 3');

        res.json({
            success: true,
            message: 'Veritabanı bağlantısı başarılı',
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API route tanımlamaları
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/role-management', roleManagementRoutes);

// Geriye dönük uyumluluk için eski endpoint'ler
const authController = require('./controllers/authController');
app.post('/login', (req, res) => authController.login(req, res));
app.post('/register', (req, res) => authController.register(req, res));

// Sunucu başlatma
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});