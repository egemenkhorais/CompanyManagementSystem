import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { IoLockClosed } from "react-icons/io5";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../Assets/logoC2.png'; // ← LOGO IMPORT

const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:5001/api/auth/login', {
                username: username,
                password: password
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                alert("Giriş Başarılı! Hoşgeldin " + username);

                const userRole = response.data.user?.role || 'user';
                onLoginSuccess(userRole);
                navigate('/home');
            } else {
                alert("Hata: " + response.data.message);
            }
        } catch (error) {
            if (error.response) {
                alert("Hata: " + error.response.data.message);
            } else if (error.request) {
                alert("Sunucuya bağlanılamadı!");
            } else {
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
                    {/* LOGO EKLENDI */}
                    <div className="logo-container">
                        <img src={logo} alt="Connectage Logo" className="login-logo" />
                    </div>

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