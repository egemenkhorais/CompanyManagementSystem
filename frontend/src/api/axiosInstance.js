import axios from 'axios';

// DOCKER İÇİN: Relative path kullan (Nginx proxy ile çalışır)
const API_URL = '/api';

// Özelleştirilmiş axios oluştur
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 60000,  // 60 saniye timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor - Her istekte token ekle
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token eklendi:', token.substring(0, 20) + '...');
        } else {
            console.warn('⚠️ Token bulunamadı!');
        }
        console.log('📤 Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor - Hataları yakala
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('❌ Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });

        if (error.response?.status === 401) {
            console.error('⚠️ 401 Unauthorized - Token geçersiz veya süresi dolmuş!');
            // Opsiyonel: Kullanıcıyı login sayfasına yönlendir
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            console.error('⚠️ 403 Forbidden - Bu işlem için yetkiniz yok!');
        }

        if (error.response?.status === 500) {
            console.error('⚠️ 500 Server Error - Backend hatası!');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;