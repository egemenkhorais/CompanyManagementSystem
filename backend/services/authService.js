const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

class AuthService {
    /**
     * Kullanıcı girişi
     */
    async login(username, password) {
        try {
            // 1. Kullanıcıyı bul
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !user) {
                return {
                    success: false,
                    message: 'Kullanıcı adı veya şifre hatalı!'
                };
            }

            // 2. Şifre kontrolü
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return {
                    success: false,
                    message: 'Şifre hatalı!'
                };
            }

            // 3. Başarılı giriş
            return {
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
            };

        } catch (error) {
            console.error('AuthService Login Error:', error);
            throw error;
        }
    }

    /**
     * Kullanıcı kaydı
     */
    async register(userData) {
        try {
            const { username, email, password, fullName, phone, department } = userData;

            // 1. Kullanıcı adı kontrolü
            const { data: existingUser } = await supabase
                .from('users')
                .select('username')
                .eq('username', username)
                .single();

            if (existingUser) {
                return {
                    success: false,
                    message: 'Bu kullanıcı adı zaten kullanılıyor!'
                };
            }

            // 2. Email kontrolü
            const { data: existingEmail } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (existingEmail) {
                return {
                    success: false,
                    message: 'Bu e-posta adresi zaten kayıtlı!'
                };
            }

            // 3. Şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 10);

            // 4. Supabase'e kaydet
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        username,
                        email,
                        password: hashedPassword,
                        full_name: fullName,
                        phone: phone || null,
                        department: department || null,
                        role: 'user',
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Kullanıcı başarıyla oluşturuldu!',
                user: {
                    id: data.id,
                    username: data.username,
                    email: data.email
                }
            };

        } catch (error) {
            console.error('AuthService Register Error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();