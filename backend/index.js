const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = require('./config/supabase');

const app = express();

app.use(cors());
app.use(express.json());

// --- TEST ENDPOINTLERİ ---
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

// --- DEPARTMAN ENDPOINTİ ---
app.get('/api/departments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('departmentid', { ascending: true });

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Departmanları çekerken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Departman listesi alınamadı: ' + (error.message || 'Bilinmeyen hata'),
            details: error.details || null,
            hint: error.hint || null,
            code: error.code || null
        });
    }
});

// --- LOGIN ENDPOINT ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı!'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                success: true,
                message: 'Giriş başarılı',
                role: user.role || 'user',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Şifre hatalı!'
            });
        }

    } catch (err) {
        console.error("Login Hatası:", err);
        res.status(500).json({
            success: false,
            message: 'Sunucu tarafında bir hata oluştu.'
        });
    }
});

// --- JOB POST OLUŞTURMA ENDPOINTİ ---
app.post('/api/jobposts', async (req, res) => {
    const { departmentId, expectations, companyId = null, createdByUser = null } = req.body;

    if (!departmentId || !expectations || !expectations.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Departman ve beklenti alanları zorunludur.'
        });
    }

    try {
        const insertPayload = {
            expectations: expectations.trim(),
            departmentid: departmentId,
            companyid: companyId,
            createdbyuser: createdByUser
        };

        const { data, error } = await supabase
            .from('jobposts')
            .insert([insertPayload])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            message: 'İş ilanı başarıyla oluşturuldu.',
            jobPost: data
        });
    } catch (error) {
        console.error('İş ilanı oluşturulamadı:', error);
        res.status(500).json({
            success: false,
            message: 'İş ilanı oluşturulurken hata oluştu: ' + error.message
        });
    }
});

// --- KAYIT OL (REGISTER) ENDPOINT - GELİŞTİRİLMİŞ ---
app.post('/register', async (req, res) => {
    const { username, email, password, fullName, phone, department } = req.body;

    try {
        // 1. Kullanıcı adı kontrolü
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu kullanıcı adı zaten kullanılıyor!'
            });
        }

        // 2. Email kontrolü
        const { data: existingEmail } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kayıtlı!'
            });
        }

        // 3. Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Supabase'e kaydet
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    username: username,
                    email: email,
                    password: hashedPassword,
                    full_name: fullName,
                    phone: phone || null,
                    department: department || null,
                    role: 'user', // Varsayılan rol
                    created_at: new Date().toISOString()
                }
            ])
            .select();
            

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu!',
            user: {
                id: data[0].id,
                username: data[0].username,
                email: data[0].email
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt sırasında bir hata oluştu: ' + error.message
        });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 API çalışıyor: http://localhost:${PORT}`);
});