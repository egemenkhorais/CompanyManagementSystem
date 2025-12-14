import React, { useState, useEffect } from 'react';
import './HomePage.css';
import CreateJobPost from './JobPosts/CreateJobPost';
import CVAnalyze from './CVAnalyze/CVAnalyze';
import RoomManagement from './Rooms/RoomManagement';
import RoomView from './Rooms/RoomView';
import MeetingManagement from './Meetings/MeetingManagement';
import MeetingView from './Meetings/MeetingView';
import UserManagementView from './UserManagement/UserManagementView';
import ProjectManagement from './Projects/ProjectManagement';
import Tasks from './Projects/Tasks';

import {
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    Briefcase,
    Calendar,
    FileText,
    Shield,
    Building,
    ChevronDown,
    ChevronRight,
    FileCheck,
    DoorOpen,
    Menu,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

// ==================== VIEW COMPONENTS ====================

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


const RoleManagementView = () => (
    <div className="content-card">
        <h2>Rol & Yetki Yönetimi</h2>
        <p>Rolleri ve yetkileri buradan yönetebilirsiniz.</p>
    </div>
);

const DepartmentManagementView = () => (
    <div className="content-card">
        <h2>Departman Yönetimi</h2>
        <p>Departmanları buradan yönetebilirsiniz.</p>
    </div>
);

const HROperationsView = ({ onNavigate }) => (
    <div className="content-card">
        <h2>İnsan Kaynakları Yönetimi</h2>
        <p>Buradan yeni işe alım talebi oluşturabilir veya izinleri onaylayabilirsiniz.</p>
        <div className="hr-actions">
            <button className="action-btn">+ İşe Alım Talebi Aç</button>
            <button className="ghost-btn" onClick={() => onNavigate('hr:job_post')}>
                İş İlanı Oluştur
            </button>
            <button className="ghost-btn" onClick={() => onNavigate('hr:cv_analyze')}>
                CV Analiz
            </button>
        </div>
        <div className="request-list">
            <p>• Talep #1: Yazılım Uzmanı (Onay Bekliyor)</p>
            <p>• Talep #2: Pazarlama Asistanı (İşleme Alındı)</p>
        </div>
    </div>
);

const ApplicationsView = () => (
    <div className="content-card">
        <h2>Başvurular</h2>
        <p>İş başvurularını buradan görüntüleyebilirsiniz.</p>
    </div>
);

const ReportsView = () => (
    <div className="content-card">
        <h2>Raporlar</h2>
        <p>Sistem raporlarını buradan görüntüleyebilirsiniz.</p>
    </div>
);

const SettingsView = () => (
    <div className="content-card">
        <h2>Sistem Ayarları</h2>
        <p>Kullanıcı tercihlerinizi buradan değiştirebilirsiniz.</p>
    </div>
);

// ==================== ICON MAPPING ====================

const ICON_MAP = {
    'dashboard': LayoutDashboard,
    'admin:management': Shield,
    'admin:users': Users,
    'admin:roles': Shield,
    'admin:departments': Building,
    'hr:operations': Briefcase,
    'hr:job_post': FileText,
    'hr:cv_analyze': FileCheck,
    'hr:applications': FileText,
    'rooms': DoorOpen,
    'rooms:view': DoorOpen,
    'rooms:management': DoorOpen,
    'meetings': Calendar,
    'meetings:view': Calendar,
    'meetings:management': Calendar,
    'project:management': Briefcase,
    'project:view': Briefcase,
    'project:task': FileText,
    'reports': FileText,
    'settings': Settings
};

// ==================== MAIN COMPONENT ====================

const HomePage = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Kullanıcı bilgisi ve yetkilerini çek
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);

                const response = await axiosInstance.get('/auth/my-permissions');
                if (response.data.success) {
                    setPermissions(response.data.permissions);
                }
            } catch (error) {
                console.error('Veri çekme hatası:', error);
                if (error.response?.status === 401) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Çıkış
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onLogout) onLogout();
        navigate('/login');
    };

    // Menü tıklama
    const handleMenuClick = (permissionCode) => {
        setActiveTab(permissionCode);
    };

    // Grup açma/kapama
    const toggleGroup = (groupCode) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupCode]: !prev[groupCode]
        }));
    };

    // Sidebar açma/kapama
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // Yetki kontrolü helper fonksiyonu
    const hasPermission = (permissionCode) => {
        return permissions.some(p => p.permission_code === permissionCode);
    };

    // İçerik render
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardView />;
            case 'admin:users':
                return <UserManagementView />;
            case 'admin:roles':
                return <RoleManagementView />;
            case 'admin:departments':
                return <DepartmentManagementView />;
            case 'hr:operations':
                return <HROperationsView onNavigate={handleMenuClick} />;
            case 'hr:job_post':
                return <CreateJobPost />;
            case 'hr:cv_analyze':
                return <CVAnalyze />;
            case 'hr:applications':
                return <ApplicationsView />;


            case 'rooms': // Menü ana başlığı
            case 'rooms:view': // Alt menü: Görüntüle
                return <RoomView />;

            case 'rooms:management': // Alt menü: Yönetim
                return <RoomManagement userPermissions={permissions} />;

            case 'meetings:view':
                // Kullanıcı özellikle "Görüntüle"ye bastıysa, yetkisi olsa bile View aç
                return <MeetingView />;

            case 'meetings:management':
                // Yönetim butonuna bastıysa Management aç
                return <MeetingManagement userPermissions={permissions} />;

            case 'meetings':
                // Eğer menüde direkt ana başlığa (meetings) tıklanıyorsa varsayılan davranış:
                return hasPermission('meetings:management')
                  ? <MeetingManagement userPermissions={permissions} />
                  : <MeetingView />;

            case 'project:view':
                return <ProjectManagement userPermissions={permissions} user={user} />;

            case 'project:task':
                return <Tasks user={user} />;

            case 'reports':
                return <ReportsView />;
            case 'settings':
                return <SettingsView />;
            default:
                return <DashboardView />;
        }
    };

    // Menü öğesi render
    const renderMenuItem = (permission) => {
        const Icon = ICON_MAP[permission.permission_code] || FileText;
        const isActive = activeTab === permission.permission_code;

        return (
            <button
                key={permission.id}
                className={`menu-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleMenuClick(permission.permission_code)}
            >
                <Icon size={20} />
                <span>{permission.description}</span>
            </button>
        );
    };

    // Grup menüsü render
    const renderMenuGroup = (group) => {
        const Icon = ICON_MAP[group.permission_code] || FileText;
        const isExpanded = expandedGroups[group.permission_code];
        const children = permissions.filter(p => p.parent_code === group.permission_code);

        return (
            <div key={group.id}>
                <button
                    className={`menu-btn ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleGroup(group.permission_code)}
                >
                    <Icon size={20} />
                    <span>{group.description}</span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isExpanded && children.map(child => (
                    <button
                        key={child.id}
                        className={`submenu-btn ${activeTab === child.permission_code ? 'active' : ''}`}
                        onClick={() => handleMenuClick(child.permission_code)}
                    >
                        {child.description}
                    </button>
                ))}
            </div>
        );
    };

    // Sidebar render
    const renderSidebar = () => {
        const singleMenus = permissions.filter(
            p => p.permission_type === 'menu' && !p.parent_code
        );

        const menuGroups = permissions.filter(
            p => p.permission_type === 'menu_group'
        );

        return (
            <>
                {singleMenus
                    .filter(m => m.permission_code === 'dashboard')
                    .map(renderMenuItem)}

                {menuGroups.map(renderMenuGroup)}

                {singleMenus
                    .filter(m => m.permission_code !== 'dashboard')
                    .map(renderMenuItem)}
            </>
        );
    };

    if (loading) {
        return (
            <div className="home-page-wrapper">
                <div className="home-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page-wrapper">
            <div className="home-container">
                <header className="main-header">
                    <div className="header-left">
                        <button className="menu-toggle-btn" onClick={toggleSidebar}>
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="logo-area">Şirket Yönetim Sistemi</div>
                    </div>
                    <div className="user-info">
                        <span>Hoşgeldin, {user?.username || 'Kullanıcı'}</span>
                    </div>
                </header>

                <div className="main-body">
                    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                        <div className="menu-title">MENÜ</div>

                        {renderSidebar()}

                        <div className="spacer"></div>

                        <button className="menu-btn logout" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Çıkış Yap</span>
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