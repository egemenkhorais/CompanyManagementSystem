import React, { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, X, Search, Building, Briefcase, Plus, RefreshCw } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './UserManagementView.css';

const UserManagementView = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [filteredPositions, setFilteredPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        roleid: '',
        fullname: '',
        departmentid: '',
        positionid: '',
        usersalary: '',
        yearsworked: ''
    });

    // Mevcut kullanıcı bilgisi (localStorage'dan)
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Verileri yükle
    useEffect(() => {
        fetchData();
    }, []);

    // Departman değiştiğinde pozisyonları filtrele
    useEffect(() => {
        if (formData.departmentid) {
            fetchPositionsByDepartment(formData.departmentid);
        } else {
            setFilteredPositions(positions);
        }
    }, [formData.departmentid]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes, deptsRes, posRes] = await Promise.all([
                axiosInstance.get('/management/users'),
                axiosInstance.get('/management/roles'),
                axiosInstance.get('/management/departments'),
                axiosInstance.get('/management/positions')
            ]);

            if (usersRes.data.success) {
                setUsers(usersRes.data.data);
            }
            if (rolesRes.data.success) {
                setRoles(rolesRes.data.data);
            }
            if (deptsRes.data.success) {
                setDepartments(deptsRes.data.data);
            }
            if (posRes.data.success) {
                setPositions(posRes.data.data);
                setFilteredPositions(posRes.data.data);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            alert('Veriler yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchData();
    };

    // Departmana göre pozisyonları getir
    const fetchPositionsByDepartment = async (departmentId) => {
        try {
            const response = await axiosInstance.get(`/management/positions/${departmentId}`);
            if (response.data.success && response.data.data.length > 0) {
                setFilteredPositions(response.data.data);
            } else {
                setFilteredPositions(positions);
            }
        } catch (error) {
            console.error('Pozisyonlar yüklenirken hata:', error);
            setFilteredPositions(positions);
        }
    };

    // Yeni kullanıcı modal aç
    const handleOpenAddModal = () => {
        setIsNewUser(true);
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            roleid: '',
            fullname: '',
            departmentid: '',
            positionid: '',
            usersalary: '',
            yearsworked: ''
        });
        setFilteredPositions(positions);
        setShowModal(true);
    };

    // Düzenleme modal aç
    const handleOpenEditModal = (user) => {
        setIsNewUser(false);
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            password: '',
            roleid: user.roleid || '',
            fullname: user.fullname || '',
            departmentid: user.departmentid || '',
            positionid: user.positionid || '',
            usersalary: user.usersalary || '',
            yearsworked: user.yearsworked || ''
        });

        if (user.departmentid) {
            fetchPositionsByDepartment(user.departmentid);
        } else {
            setFilteredPositions(positions);
        }

        setShowModal(true);
    };

    // Modal kapat
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setIsNewUser(false);
        setFormData({
            username: '',
            password: '',
            roleid: '',
            fullname: '',
            departmentid: '',
            positionid: '',
            usersalary: '',
            yearsworked: ''
        });
        setFilteredPositions(positions);
    };

    // Form değişiklik
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'departmentid') {
            setFormData(prev => ({
                ...prev,
                departmentid: value,
                positionid: ''
            }));
        }
    };

    // Form gönder
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isNewUser) {
                if (!formData.password) {
                    alert('Şifre zorunludur!');
                    return;
                }

                const response = await axiosInstance.post('/management/users', {
                    username: formData.username,
                    password: formData.password,
                    roleid: parseInt(formData.roleid),
                    fullname: formData.fullname,
                    departmentid: formData.departmentid ? parseInt(formData.departmentid) : null,
                    positionid: formData.positionid ? parseInt(formData.positionid) : null,
                    usersalary: formData.usersalary ? parseFloat(formData.usersalary) : null,
                    yearsworked: formData.yearsworked ? parseInt(formData.yearsworked) : null
                });

                if (response.data.success) {
                    alert('Kullanıcı başarıyla oluşturuldu!');
                    fetchData();
                    handleCloseModal();
                } else {
                    alert(response.data.message || 'Bir hata oluştu!');
                }
            } else {
                const response = await axiosInstance.put(`/management/users/${editingUser.userid}`, {
                    username: formData.username,
                    roleid: parseInt(formData.roleid),
                    fullname: formData.fullname,
                    departmentid: formData.departmentid ? parseInt(formData.departmentid) : null,
                    positionid: formData.positionid ? parseInt(formData.positionid) : null,
                    usersalary: formData.usersalary ? parseFloat(formData.usersalary) : null,
                    yearsworked: formData.yearsworked ? parseInt(formData.yearsworked) : null
                });

                if (response.data.success) {
                    alert('Kullanıcı başarıyla güncellendi!');
                    fetchData();
                    handleCloseModal();
                }
            }
        } catch (error) {
            console.error('İşlem hatası:', error);
            alert(error.response?.data?.message || 'İşlem başarısız!');
        }
    };

    // Kullanıcı sil
    const handleDelete = async (userId, username) => {
        if (!window.confirm(`"${username}" kullanıcısını silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/management/users/${userId}`);
            if (response.data.success) {
                alert('Kullanıcı silindi!');
                fetchData();
            }
        } catch (error) {
            console.error('Silme hatası:', error);
            alert(error.response?.data?.message || 'Silme başarısız!');
        }
    };

    const filteredUsers = users.filter(user =>
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.fullname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.rolename?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.departmentname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.position_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeClass = (rolename) => {
        if (rolename === 'admin') return 'badge-admin';
        if (rolename === 'hr') return 'badge-hr';
        if (rolename?.startsWith('backend_')) return 'badge-backend';
        if (rolename?.startsWith('qa_')) return 'badge-qa';
        return 'badge-default';
    };

    const formatRoleName = (rolename) => {
        if (!rolename) return '-';
        return rolename
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatSalary = (salary) => {
        if (!salary) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(salary);
    };

    const formatPosition = (position_name, position_level) => {
        if (!position_name) return '-';
        return `${position_name} ${position_level ? `(${position_level})` : ''}`;
    };

    if (loading) {
        return (
            <div className="user-management-container">
                <div className="loading-state">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <Users size={28} />
                    <h2>Kullanıcı Yönetimi</h2>
                </div>
                <div className="header-right">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Kullanıcı, departman, pozisyon ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        title="Listeyi Yenile"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'icon-spin' : ''} />
                    </button>
                    <button className="add-user-btn" onClick={handleOpenAddModal}>
                        <Plus size={18} />
                        <span>Yeni Kullanıcı</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-item">
                    <span className="stat-number">{users.length}</span>
                    <span className="stat-label">Toplam Kullanıcı</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{users.filter(u => u.rolename === 'admin').length}</span>
                    <span className="stat-label">Admin</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{users.filter(u => u.rolename?.startsWith('backend_')).length}</span>
                    <span className="stat-label">Backend</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{users.filter(u => u.rolename?.startsWith('qa_')).length}</span>
                    <span className="stat-label">QA</span>
                </div>
            </div>

            {/* Tablo */}
            <div className="table-container">
                <table className="user-table">
                    <thead>
                    <tr>
                        {/* BAŞLIK SIRALAMASI: ID -> İSİM -> DURUM -> ... */}
                        <th>ID</th>
                        <th>İsim</th>
                        <th>Durum</th>
                        <th>Kullanıcı Adı</th>
                        <th>Departman</th>
                        <th>Pozisyon</th>
                        <th>Rol</th>
                        <th>Maaş</th>
                        <th>Kıdem</th>
                        <th>İşlemler</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="empty-state">
                                Kullanıcı bulunamadı
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map(user => {
                            let tooltipText = 'Bilinmiyor';
                            if (user.is_online) {
                                tooltipText = 'Şu an Aktif';
                            } else if (user.last_activity) {
                                try {
                                    const date = new Date(user.last_activity);
                                    if (!isNaN(date.getTime())) {
                                        tooltipText = `Son görülme: ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
                                    }
                                } catch (e) {
                                    console.log("Tarih hatası:", e);
                                }
                            }

                            return (
                                <tr key={user.userid} className={user.userid === currentUser?.id ? 'current-user-row' : ''}>
                                    {/* 1. SÜTUN: ID */}
                                    <td>{user.userid}</td>

                                    {/* 2. SÜTUN: İSİM (Önceki kodda burası Durum'du, şimdi düzeltildi) */}
                                    <td>
                                        <span className="fullname-cell">
                                            {user.fullname || '-'}
                                        </span>
                                    </td>

                                    {/* 3. SÜTUN: DURUM (Önceki kodda burası İsim'di, şimdi düzeltildi) */}
                                    <td style={{ textAlign: 'center', width: '80px' }}>
                                        <div className="status-cell" style={{ justifyContent: 'center' }}>
                                            <span
                                                className={`status-indicator ${user.is_online ? 'status-online' : 'status-offline'}`}
                                                title={tooltipText}
                                            ></span>
                                        </div>
                                    </td>

                                    {/* 4. SÜTUN: KULLANICI ADI */}
                                    <td>
                                        <div className="username-cell">
                                            {user.username}
                                            {user.userid === currentUser?.id && (
                                                <span className="you-badge">Sen</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="department-cell">
                                            {user.departmentname ? (
                                                <>
                                                    <Building size={14} />
                                                    <span>{user.departmentname}</span>
                                                </>
                                            ) : '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="position-cell">
                                            {user.position_name ? (
                                                <>
                                                    <Briefcase size={14} />
                                                    <span>{formatPosition(user.position_name, user.position_level)}</span>
                                                </>
                                            ) : '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadgeClass(user.rolename)}`}>
                                            {formatRoleName(user.rolename)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="salary-cell">
                                            {formatSalary(user.usersalary)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="years-cell">
                                            {user.yearsworked ? `${user.yearsworked} yıl` : '-'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.userid !== currentUser?.id ? (
                                            <div className="action-buttons">
                                                <button
                                                    className="icon-btn edit-btn"
                                                    onClick={() => handleOpenEditModal(user)}
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn delete-btn"
                                                    onClick={() => handleDelete(user.userid, user.username)}
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="no-action">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{isNewUser ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ad Soyad *</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        placeholder="Ad Soyad"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kullanıcı Adı *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="kullanici_adi"
                                        required
                                    />
                                </div>
                            </div>

                            {isNewUser && (
                                <div className="form-group">
                                    <label>Şifre *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Minimum 6 karakter"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Departman</label>
                                    <select
                                        name="departmentid"
                                        value={formData.departmentid}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Departman Seçin</option>
                                        {departments.map(dept => (
                                            <option key={dept.departmentid} value={dept.departmentid}>
                                                {dept.departmentname}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pozisyon</label>
                                    <select
                                        name="positionid"
                                        value={formData.positionid}
                                        onChange={handleInputChange}
                                        disabled={!formData.departmentid}
                                    >
                                        <option value="">
                                            {formData.departmentid ? 'Pozisyon Seçin' : 'Önce departman seçin'}
                                        </option>
                                        {filteredPositions.map(pos => (
                                            <option key={pos.id} value={pos.id}>
                                                {pos.display_name || `${pos.position_name} - ${pos.level}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sistem Rolü *</label>
                                    <select
                                        name="roleid"
                                        value={formData.roleid}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Rol Seçin</option>
                                        {roles.map(role => (
                                            <option key={role.roleid} value={role.roleid}>
                                                {formatRoleName(role.rolename)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Maaş (TL)</label>
                                    <input
                                        type="number"
                                        name="usersalary"
                                        value={formData.usersalary}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Çalışma Süresi (Yıl)</label>
                                    <input
                                        type="number"
                                        name="yearsworked"
                                        value={formData.yearsworked}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        max="50"
                                    />
                                </div>
                                <div className="form-group"></div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                                    İptal
                                </button>
                                <button type="submit" className="save-btn">
                                    {isNewUser ? 'Kullanıcı Oluştur' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementView;