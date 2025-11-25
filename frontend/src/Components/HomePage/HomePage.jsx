import React, { useState } from 'react';
import './HomePage.css';
import CreateJobPost from './JobPosts/CreateJobPost';
import { Users, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardView = () => (
    <div className="content-card">
        <h2>Genel Bakış</h2>
        <div className="stats-grid">
            <div className="stat-box">Toplam Çalışan: 120</div>
            <div className="stat-box">Aktif Projeler: 5</div>
            <div className="stat-box">Bekleyen Talepler: 3</div>
        </div>
    </div>
);
//burası henüz overview. asset tiplerinin hepsi için bir profil oluşturacağız buraya üstteki gibi
//ardından yetkiye göre assetleri göstereceğiz click işlevleri ve gösterimi unutmayın.

const HROperationsView = ({ onOpenJobPost }) => (
    <div className="content-card">
        <h2>İnsan Kaynakları Yönetimi</h2>
        <p>Buradan yeni işe alım talebi oluşturabilir veya izinleri onaylayabilirsiniz.</p>
        <div className="hr-actions">
            <button className="action-btn"> + İşe Alım Talebi Aç</button>
            <button className="ghost-btn" onClick={onOpenJobPost}>
                İş İlanı Oluştur
            </button>
        </div>
        <div className="request-list">
            <p>• Talep #1: Yazılım Uzmanı (Onay Bekliyor)</p>
            <p>• Talep #2: Pazarlama Asistanı (İşleme Alındı)</p>
        </div>
    </div>
);
//gösterim için aynı şekilde


const SettingsView = () => (
    <div className="content-card">
        <h2>Sistem Ayarları</h2>
        <p>Kullanıcı tercihlerinizi buradan değiştirebilirsiniz.</p>
    </div>
);

const HomePage = ({ userRole, onLogout }) => { // onLogout prop'u eklendi
    const [activeTab, setActiveTab] = useState('dashboard');
    const [hrView, setHrView] = useState('overview');
    const navigate = useNavigate(); // Hook eklendi

    // Çıkış
    const handleLogout = () => {
        onLogout(); // App.jsx'teki state'i temizle
        navigate('/login'); // Login sayfasına yönlendir
    };

    const handleTabChange = (tab, options = {}) => {
        const { resetHrView = false } = options;
        setActiveTab(tab);
        if (tab !== 'hr' || resetHrView) {
            setHrView('overview');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardView />;
            case 'hr':
                return hrView === 'jobPost' ? (
                    <CreateJobPost />
                ) : (
                    <HROperationsView onOpenJobPost={() => setHrView('jobPost')} />
                );
            case 'settings':
                return <SettingsView />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="home-page-wrapper">
            <div className="home-container">
            <header className="main-header">
                <div className="logo-area">Şirket Yönetim Sistemi</div>
                <div className="user-info">
                    <span>Hoşgeldin, Yönetici</span>
                </div>
            </header>

            <div className="main-body">
                <aside className="sidebar">
                    <div className="menu-title">MENÜ</div>

                    <button
                        className={`menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleTabChange('dashboard')}
                    >
                        <LayoutDashboard size={20} /> Ana Panel
                    </button>

                    <button
                        className={`menu-btn ${activeTab === 'hr' ? 'active' : ''}`}
                        onClick={() => handleTabChange('hr', { resetHrView: true })}
                    >
                        <Users size={20} /> İK İşlemleri
                    </button>

                    {activeTab === 'hr' && (
                        <button
                            className={`submenu-btn ${hrView === 'jobPost' ? 'active' : ''}`}
                            onClick={() => setHrView('jobPost')}
                        >
                            İş İlanı Oluştur
                        </button>
                    )}

                    <button
                        className={`menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => handleTabChange('settings')}
                    >
                        <Settings size={20} /> Ayarlar
                    </button>

                    <div className="spacer"></div>

                    <button className="menu-btn logout" onClick={handleLogout}>
                        <LogOut size={20} /> Çıkış Yap
                    </button>
                </aside>

                <main className="content-area">
                    {renderContent()}
                </main>
            </div>
        </div>
        </div>
    );
};

export default HomePage;