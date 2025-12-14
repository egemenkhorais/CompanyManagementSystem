import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Plus, Save, Users, Zap } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './RoleManagement.css';
import PermissionTree from './PermissionTree';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [showNewRoleModal, setShowNewRoleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRoleName, setEditingRoleName] = useState(false);
    const [tempRoleName, setTempRoleName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                axiosInstance.get('/role-management/roles'),
                axiosInstance.get('/role-management/permissions')
            ]);

            if (rolesRes.data.success) {
                setRoles(rolesRes.data.data);
                if (rolesRes.data.data.length > 0) {
                    handleRoleSelect(rolesRes.data.data[0]);
                }
            }

            if (permsRes.data.success) {
                setPermissions(permsRes.data.data);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            alert('Veriler yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        setTempRoleName(role.rolename);
        setEditingRoleName(false);
        setActiveTab('info');

        try {
            const res = await axiosInstance.get(`/role-management/roles/${role.roleid}/permissions`);
            if (res.data.success) {
                const permIds = res.data.data.map(p => p.id);
                setSelectedPermissions(permIds);
            }
        } catch (error) {
            console.error('Permission yüklenirken hata:', error);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            alert('Rol adı boş olamaz!');
            return;
        }

        try {
            const res = await axiosInstance.post('/role-management/roles', {
                rolename: newRoleName.trim()
            });

            if (res.data.success) {
                alert('Rol başarıyla oluşturuldu!');
                setShowNewRoleModal(false);
                setNewRoleName('');
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Rol oluşturulamadı!');
        }
    };

    const handleUpdateRoleName = async () => {
        if (!tempRoleName.trim()) {
            alert('Rol adı boş olamaz!');
            return;
        }

        try {
            const res = await axiosInstance.put(`/role-management/roles/${selectedRole.roleid}`, {
                rolename: tempRoleName.trim()
            });

            if (res.data.success) {
                alert('Rol adı güncellendi!');
                setEditingRoleName(false);
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Rol güncellenemedi!');
        }
    };

    const handleDeleteRole = async (roleId, roleName) => {
        if (!window.confirm(`"${roleName}" rolünü silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const res = await axiosInstance.delete(`/role-management/roles/${roleId}`);

            if (res.data.success) {
                alert('Rol başarıyla silindi!');
                setSelectedRole(null);
                setSelectedPermissions([]);
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Rol silinemedi!');
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;

        try {
            const res = await axiosInstance.put(
                `/role-management/roles/${selectedRole.roleid}/permissions`,
                { permissionIds: selectedPermissions }
            );

            if (res.data.success) {
                alert('Yetkiler başarıyla güncellendi!');
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Yetkiler güncellenemedi!');
        }
    };

    if (loading) {
        return (
            <div className="role-management-container">
                <div className="loading-state">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="role-management-container">
            <div className="page-header">
                <h2>Rol & Yetki Yönetimi</h2>
                <div className="header-actions">
                    <div className="header-stats">
                        <span><strong>{roles.length}</strong> Rol</span>
                        <span>•</span>
                        <span><strong>{permissions.length}</strong> Yetki</span>
                    </div>
                    <button className="add-role-btn-header" onClick={() => setShowNewRoleModal(true)}>
                        <Plus size={18} />
                        Yeni Rol
                    </button>
                </div>
            </div>

            <div className="role-content">
                <div className="roles-sidebar">
                    <div className="sidebar-header">
                        <h3>Roller</h3>
                    </div>

                    <div className="roles-list">
                        {roles.map(role => (
                            <div
                                key={role.roleid}
                                className={`role-item ${selectedRole?.roleid === role.roleid ? 'active' : ''}`}
                                onClick={() => handleRoleSelect(role)}
                            >
                                <div className="role-info">
                                    <div className="role-name">{role.rolename}</div>
                                    <div className="role-meta">
                                        <span className="role-meta-badge">
                                            <Users size={12} />
                                            {role.user_count}
                                        </span>
                                        <span className="role-meta-badge">
                                            <Zap size={12} />
                                            {role.permission_count}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="edit-role-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRole(role);
                                        setTempRoleName(role.rolename);
                                        setEditingRoleName(true);
                                        setShowEditModal(true);
                                    }}
                                    title="Düzenle"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="delete-role-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRole(role.roleid, role.rolename);
                                    }}
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="role-details">
                    {selectedRole ? (
                        <>
                            <div className="tabs">
                                <button
                                    className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('info')}
                                >
                                    Rol Bilgileri
                                </button>
                                <button
                                    className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('permissions')}
                                >
                                    Yetkiler
                                </button>
                            </div>

                            <div className="tab-content">
                                {activeTab === 'info' && (
                                    <div className="info-tab">
                                        <div className="form-group">
                                            <label>ROL ADI</label>
                                            <div className="role-name-display">
                                                {selectedRole.rolename}
                                            </div>
                                        </div>

                                        <div className="info-stats-grid">
                                            <div className="info-stat-card">
                                                <div className="stat-icon">
                                                    <Users size={20} />
                                                </div>
                                                <div className="stat-content">
                                                    <div className="stat-value">{selectedRole.user_count}</div>
                                                    <div className="stat-label">Kullanıcı</div>
                                                </div>
                                            </div>
                                            <div className="info-stat-card">
                                                <div className="stat-icon">
                                                    <Zap size={20} />
                                                </div>
                                                <div className="stat-content">
                                                    <div className="stat-value">{selectedRole.permission_count}</div>
                                                    <div className="stat-label">Yetki</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'permissions' && (
                                    <div className="permissions-tab">
                                        <PermissionTree
                                            permissions={permissions}
                                            selectedPermissions={selectedPermissions}
                                            setSelectedPermissions={setSelectedPermissions}
                                        />
                                        <div className="permission-actions">
                                            <button className="save-permissions-btn" onClick={handleSavePermissions}>
                                                <Save size={18} />
                                                Yetkileri Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">Sol taraftan bir rol seçin</div>
                    )}
                </div>
            </div>

            {showNewRoleModal && (
                <div className="modal-overlay" onClick={() => setShowNewRoleModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Yeni Rol Oluştur</h3>
                            <button className="close-btn" onClick={() => setShowNewRoleModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Rol Adı</label>
                            <input
                                type="text"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Örn: DevOps Engineer"
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowNewRoleModal(false)}>
                                İptal
                            </button>
                            <button className="save-btn" onClick={handleCreateRole}>
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Rol Düzenle</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Rol Adı</label>
                            <input
                                type="text"
                                value={tempRoleName}
                                onChange={(e) => setTempRoleName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                                İptal
                            </button>
                            <button className="save-btn" onClick={() => {
                                handleUpdateRoleName();
                                setShowEditModal(false);
                            }}>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;