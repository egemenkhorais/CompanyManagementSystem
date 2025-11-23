import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { IoLockClosed } from "react-icons/io5";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Hook eklendi

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5001/login', {
                username: username,
                password: password
            });

            if (response.data.success) {
                alert("Giriş Başarılı! Hoşgeldin " + username);

                // Kullanıcı rolünü backend'den alıyoruz (varsa)
                const userRole = response.data.role || 'user';

                onLoginSuccess(userRole);

                // HomePage'e yönlendiriyoruz
                navigate('/home');
            }
        } catch (error) {
            if (error.response) {
                alert("Hata: " + error.response.data.message);
            } else {
                alert("Sunucuya bağlanılamadı! Backend'in çalıştığından emin ol.");
            }
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
                    />
                    <IoLockClosed className='icon' />
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox"/>Beni Hatırla </label>
                    <a href="#">Şifremi Unuttum</a>
                </div>

                <button type="submit">Giriş</button>

                <div className="register-link">
                    <p>Hesabın yok mu? <a href="#">Kaydol.</a></p>
                </div>
            </form>
        </div>
        </div>
    );
};

export default LoginForm;