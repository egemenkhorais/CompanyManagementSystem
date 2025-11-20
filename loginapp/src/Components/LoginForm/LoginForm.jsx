import React, { useState } from 'react'; // 1. useState eklendi
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { IoLockClosed } from "react-icons/io5";
import axios from 'axios'; // 2. Axios eklendi (API isteği için)

const LoginForm = () => {
    // Kullanıcı verilerini tutacak değişkenler
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle

        try {
            // Backend'e (Node.js) veriyi gönderiyoruz
            const response = await axios.post('http://127.0.0.1:5001/login', {
                username: username,
                password: password
            });

            // Eğer sunucudan olumlu yanıt gelirse:
            if (response.data.success) {
                alert("Giriş Başarılı! Hoşgeldin " + username);
                // Buraya daha sonra sayfa yönlendirmesi (navigate) ekleyeceğiz.
            }
        } catch (error) {
            // Hata olursa (Şifre yanlışsa veya sunucu kapalıysa)
            if (error.response) {
                alert("Hata: " + error.response.data.message);
            } else {
                alert("Sunucuya bağlanılamadı! Backend'in çalıştığından emin ol.");
            }
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleLogin}> {/* Form gönderilince handleLogin çalışsın */}
                <h1>Giriş</h1>

                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        required
                        value={username} // Değeri state'e bağladık
                        onChange={(e) => setUsername(e.target.value)} // Yazdıkça state güncellensin
                    />
                    <FaUser className='icon' />
                </div>

                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Şifre"
                        required
                        value={password} // Değeri state'e bağladık
                        onChange={(e) => setPassword(e.target.value)} // Yazdıkça state güncellensin
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
    );
};

export default LoginForm;