import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { IoLockClosed } from "react-icons/io5";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // YENİ ENDPOINT (önce bunu dene)
            const response = await axios.post('http://127.0.0.1:5001/api/auth/login', {
                username: username,
                password: password
            });

            console.log('Backend Response:', response.data); // Debug için

            if (response.data.success) {
                alert("Giriş Başarılı! Hoşgeldin " + username);

                // YENİ FORMAT: response.data.user.role
                const userRole = response.data.user?.role || 'user';

                onLoginSuccess(userRole);
                navigate('/home');
            } else {
                alert("Hata: " + response.data.message);
            }

        } catch (error) {
            console.error('Login Error:', error); // Debug için

            if (error.response) {
                // Backend'den hata mesajı geldi
                alert("Hata: " + error.response.data.message);
            } else if (error.request) {
                // İstek gitti ama cevap gelmedi
                alert("Sunucuya bağlanılamadı! Backend çalışıyor mu kontrol et.");
            } else {
                // Başka bir hata
                alert("Bir hata oluştu: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <div className='wrapper'>
                <form onSubmit={handleLogin}>
                    <h1>CONNECTAGE</h1>

                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Kullanıcı Adı"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        <FaUser className='icon' />
                    </div>

                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Şifre"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <IoLockClosed className='icon' />
                    </div>

                    <div className="remember-forgot">
                        <label>
                            <input type="checkbox" />
                            Beni Hatırla
                        </label>
                        <a href="#">Şifremi Unuttum</a>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş'}
                    </button>

                    <div className="register-link">
                        <p>Hesabın yok mu? <a href="#">Kaydol.</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;