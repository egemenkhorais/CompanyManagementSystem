import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001/api';

// Özelleştirilmiş axios oluştur
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,  // 10 saniye bekle, cevap gelmezse hata ver
    headers: {
        'Content-Type': 'application/json' // JSON gönderiyoruz
    }
});

// Request Interceptor - Her istekte token ekle
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - 401 hatalarını yakala
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token geçersiz veya süresi dolmuş
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;