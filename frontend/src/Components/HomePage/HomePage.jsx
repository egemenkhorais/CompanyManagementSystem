import React, { useState, useEffect } from 'react';
import './HomePage.css';
import CreateJobPost from './JobPosts/CreateJobPost';
import CVAnalyze from './CVAnalyze/CVAnalyze';
import RoomManagement from './Rooms/RoomManagement';
import MeetingManagement from './Meetings/MeetingManagement';
import MeetingView from './Meetings/MeetingView';
import UserManagementView from './UserManagement/UserManagementView';
import ProjectManagement from './Projects/ProjectManagement';
import Tasks from './Projects/Tasks';
import DepartmentManagement from './DepartmentManagement/DepartmentManagement';
import RoleManagement from './RoleManagement/RoleManagement';
import PermissionManagement from './PermissionManagement/PermissionManagement';
import logo from '../assets/logoC2.png';



import {
    Users, Settings, LogOut, LayoutDashboard, Briefcase, Calendar,
    FileText, Shield, Building, ChevronDown, ChevronRight, FileCheck,
    DoorOpen, Menu, X, Clock, MapPin, Calendar as CalendarIcon,
    User, Mail, Briefcase as BriefcaseIcon, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const DashboardView = ({ user }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!user) return;

            try {
                const response = await axiosInstance.get('/auth/my-details');
                if (response.data.success) {
                    setUserDetails(response.data.data);
                }
            } catch (error) {
                console.error("Kullanıcı detayları çekilemedi:", error);
            }
        };

        const fetchDepartmentMeetings = async () => {
            if (!user || !user.departmentid || user.departmentid === 0) {
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(`/meetings/department/${user.departmentid}`);
                if (response.data.success) {
                    setMeetings(response.data.data);
                }
            } catch (error) {
                console.error("Toplantılar çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
        fetchDepartmentMeetings();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const formatSalary = (salary) => {
        if (!salary) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(salary);
    };

    return (
        <div className="dashboard-wrapper">
            {/* Profil Kartı */}
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <User size={48} />
                    </div>
                    <div className="profile-info">
                        <h2>{user?.fullname || user?.username}</h2>
                        <p className="profile-role">{user?.departmentname || 'Departman Belirtilmemiş'}</p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <BriefcaseIcon size={18} />
                        <div>
                            <span className="stat-label">Pozisyon</span>
                            <span className="stat-value">{userDetails?.position_name || '-'}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Award size={18} />
                        <div>
                            <span className="stat-label">Maaş</span>
                            <span className="stat-value">{formatSalary(userDetails?.usersalary)}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Clock size={18} />
                        <div>
                            <span className="stat-label">Deneyim</span>
                            <span className="stat-value">{userDetails?.yearsworked || 0} Yıl</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toplantılar Bölümü */}
            <div className="content-card">
                <h3 className="section-title"> Yaklaşan Departman Toplantıları </h3>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Toplantılar yükleniyor...</p>
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>Departmanınıza ait planlanmış toplantı bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="meeting-grid">
                        {meetings.map((meeting) => (
                            <div key={meeting.meetingid} className="meeting-card">
                                <div className="meeting-header">
                                    <span className="meeting-title">{meeting.title}</span>
                                    <span className={`status-badge ${meeting.status}`}>
                                        {meeting.status === 'active' || meeting.status === 'approved'
                                            ? 'Aktif'
                                            : meeting.status === 'cancelled'
                                                ? 'İptal Edildi'
                                                : 'Pasif'}
                                    </span>
                                </div>
                                <div className="meeting-details">
                                    <div className="detail-row">
                                        <CalendarIcon size={16} />
                                        <span>{formatDate(meeting.date)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <Clock size={16} />
                                        <span>{meeting.start_time} - {meeting.end_time}</span>
                                    </div>
                                    <div className="detail-row">
                                        <MapPin size={16} />
                                        <span>{meeting.room_name || 'Toplantı Odası'}</span>
                                    </div>
                                </div>
                                {meeting.description && (
                                    <div className="meeting-description">
                                        {meeting.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const HROperationsView = ({ onNavigate }) => (
    <div className="content-card">
        <h2>İnsan Kaynakları Yönetimi</h2>
        <p>Buradan yeni işe alım talebi oluşturabilir veya izinleri onaylayabilirsiniz.</p>
        <div className="hr-actions">
            <button className="action-btn">+ İşe Alım Talebi Aç</button>
            <button className="ghost-btn" onClick={() => onNavigate('hr:job_post')}>İş İlanı Oluştur</button>
            <button className="ghost-btn" onClick={() => onNavigate('hr:cv_analyze')}>CV Analiz</button>
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

const ICON_MAP = {
    'dashboard': LayoutDashboard, 'admin:management': Shield, 'admin:users': Users,
    'admin:roles': Shield, 'admin:permissions': Shield, 'admin:departments': Building,
    'hr:operations': Briefcase, 'hr:job_post': FileText, 'hr:cv_analyze': FileCheck,
    'hr:applications': FileText, 'rooms': DoorOpen, 'rooms:view': DoorOpen,
    'rooms:management': DoorOpen, 'meetings': Calendar, 'meetings:view': Calendar,
    'meetings:management': Calendar, 'project:management': Briefcase,
    'project:view': Briefcase, 'project:task': FileText, 'reports': FileText,
    'settings': Settings
};

const HomePage = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'dashboard');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeTab');
        if (onLogout) onLogout();
        navigate('/login');
    };

    const handleMenuClick = (permissionCode) => setActiveTab(permissionCode);
    const toggleGroup = (groupCode) => setExpandedGroups(prev => ({ ...prev, [groupCode]: !prev[groupCode] }));
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const hasPermission = (permissionCode) => permissions.some(p => p.permission_code === permissionCode);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView user={user} />;
            case 'admin:users': return <UserManagementView />;
            case 'admin:roles': return <RoleManagement />;
            case 'admin:permissions': return <PermissionManagement />;
            case 'admin:departments': return <DepartmentManagement />;
            case 'hr:operations': return <HROperationsView onNavigate={handleMenuClick} />;
            case 'hr:job_post': return <CreateJobPost />;
            case 'hr:cv_analyze': return <CVAnalyze />;
            case 'hr:applications': return <ApplicationsView />;
            case 'rooms':
            case 'rooms:view':
            case 'rooms:management': return <RoomManagement userPermissions={permissions} />;
            case 'meetings:view': return <MeetingView />;
            case 'meetings:management': return <MeetingManagement userPermissions={permissions} />;
            case 'meetings': return hasPermission('meetings:management')
                ? <MeetingManagement userPermissions={permissions} />
                : <MeetingView />;
            case 'project:view': return <ProjectManagement userPermissions={permissions} user={user} />;
            case 'project:task': return <Tasks user={user} />;
            case 'reports': return <ReportsView />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView user={user} />;
        }
    };

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

    const renderSidebar = () => {
        const singleMenus = permissions.filter(p => p.permission_type === 'menu' && !p.parent_code);
        const menuGroups = permissions.filter(p => p.permission_type === 'menu_group');

        return (
            <>
                {singleMenus.filter(m => m.permission_code === 'dashboard').map(renderMenuItem)}
                {menuGroups.map(renderMenuGroup)}
                {singleMenus.filter(m => m.permission_code !== 'dashboard').map(renderMenuItem)}
            </>
        );
    };

    if (loading) {
        return (
            <div className="home-page-wrapper">
                <div className="home-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
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
                        {/* LOGO VE YAZI EKLENDİ */}
                        <div className="logo-area">
                            <img src={logo} alt="Connectage" className="header-logo" />
                            <span className="header-title">Connectage</span>
                        </div>
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