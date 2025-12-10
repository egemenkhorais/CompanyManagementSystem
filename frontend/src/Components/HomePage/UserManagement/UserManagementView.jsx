import React, { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, X, Search, Building, Briefcase } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './UserManagementView.css';

const UserManagementView = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
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
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            alert('Veriler yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    // Modal aç (düzenleme)
    const handleOpenModal = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            roleid: user.roleid || '',
            fullname: user.fullname || '',
            departmentid: user.departmentid || '',
            positionid: user.positionid || '',
            usersalary: user.usersalary || '',
            yearsworked: user.yearsworked || ''
        });
        setShowModal(true);
    };

    // Modal kapat
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            username: '',
            roleid: '',
            fullname: '',
            departmentid: '',
            positionid: '',
            usersalary: '',
            yearsworked: ''
        });
    };

    // Form değişiklik
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Kullanıcı güncelle
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
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
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            alert(error.response?.data?.message || 'Güncelleme başarısız!');
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

    // Arama filtresi
    const filteredUsers = users.filter(user =>
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.fullname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.rolename?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.departmentname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.position_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Rol badge rengi
    const getRoleBadgeClass = (rolename) => {
        if (rolename === 'admin') return 'badge-admin';
        if (rolename === 'hr') return 'badge-hr';
        if (rolename?.startsWith('backend_')) return 'badge-backend';
        if (rolename?.startsWith('qa_')) return 'badge-qa';
        return 'badge-default';
    };

    // Rol ismini güzelleştir
    const formatRoleName = (rolename) => {
        if (!rolename) return '-';
        return rolename
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    // Maaş formatla
    const formatSalary = (salary) => {
        if (!salary) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(salary);
    };

    // Pozisyon gösterimi
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
                        <th>ID</th>
                        <th>İsim</th>
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
                            <td colSpan="9" className="empty-state">
                                Kullanıcı bulunamadı
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map(user => (
                            <tr key={user.userid} className={user.userid === currentUser?.id ? 'current-user-row' : ''}>
                                <td>{user.userid}</td>
                                <td>
                                    <span className="fullname-cell">
                                        {user.fullname || '-'}
                                    </span>
                                </td>
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
                                                onClick={() => handleOpenModal(user)}
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
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Düzenleme Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Kullanıcı Düzenle</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ad Soyad</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        placeholder="Ad Soyad"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kullanıcı Adı</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

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
                                    >
                                        <option value="">Pozisyon Seçin</option>
                                        {positions.map(pos => (
                                            <option key={pos.id} value={pos.id}>
                                                {pos.display_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sistem Rolü</label>
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
                                        step="100"
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
                                <div className="form-group">
                                    {/* Boş alan - düzen için */}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                                    İptal
                                </button>
                                <button type="submit" className="save-btn">
                                    Kaydet
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