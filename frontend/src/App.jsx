import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginForm from "./Components/LoginForm/LoginForm.jsx";
import HomePage from "./Components/HomePage/HomePage.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };
      /*Loginler burası */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
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