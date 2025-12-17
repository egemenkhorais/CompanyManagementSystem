import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginForm from "./Components/LoginForm/LoginForm.jsx";
import HomePage from "./Components/HomePage/HomePage.jsx";

function App() {
    // localStorage'dan token kontrol et
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('token'); // ← İLK YÜKLEME
    });

    const [userRole, setUserRole] = useState(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.role || null; // ← İLK YÜKLEME
    });

    // Token varsa authenticated yap
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            setIsAuthenticated(true);
            setUserRole(user.role);
        }
    }, []);

    const handleLoginSuccess = (role) => {
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <Router>
            <Routes>
                {/* Login Sayfası */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ?
                            <Navigate to="/home" replace /> :
                            <LoginForm onLoginSuccess={handleLoginSuccess} />
                    }
                />

                {/* Ana Sayfa */}
                <Route
                    path="/home"
                    element={
                        isAuthenticated ?
                            <HomePage userRole={userRole} onLogout={handleLogout} /> :
                            <Navigate to="/login" replace />
                    }
                />

                {/* Varsayılan yönlendirme */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    )
}

export default App