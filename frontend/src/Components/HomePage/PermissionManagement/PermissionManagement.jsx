import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Folder, File, Zap } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './PermissionManagement.css';

const PermissionManagement = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [formData, setFormData] = useState({
        permission_code: '',
        permission_type: 'menu',
        description: '',
        parent_code: ''
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/role-management/permissions');
            if (res.data.success) {
                setPermissions(res.data.data);
            }
        } catch (error) {
            console.error('Yetkiler yüklenirken hata:', error);
            alert('Yetkiler yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (permission = null) => {
        if (permission) {
            setEditingPermission(permission);
            setFormData({
                permission_code: permission.permission_code,
                permission_type: permission.permission_type,
                description: permission.description,
                parent_code: permission.parent_code || ''
            });
        } else {
            setEditingPermission(null);
            setFormData({
                permission_code: '',
                permission_type: 'menu',
                description: '',
                parent_code: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPermission(null);
        setFormData({
            permission_code: '',
            permission_type: 'menu',
            description: '',
            parent_code: ''
        });
    };

    const handleSubmit = async () => {
        if (!formData.permission_code.trim() || !formData.description.trim()) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }

        try {
            if (editingPermission) {
                const res = await axiosInstance.put(
                    `/role-management/permissions/${editingPermission.id}`,
                    formData
                );
                if (res.data.success) {
                    alert('Yetki başarıyla güncellendi!');
                }
            } else {
                const res = await axiosInstance.post('/role-management/permissions', formData);
                if (res.data.success) {
                    alert('Yetki başarıyla oluşturuldu!');
                }
            }
            handleCloseModal();
            fetchPermissions();
        } catch (error) {
            alert(error.response?.data?.message || 'Bir hata oluştu!');
        }
    };

    const handleDelete = async (permission) => {
        if (!window.confirm(`"${permission.description}" yetkisini silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const res = await axiosInstance.delete(`/role-management/permissions/${permission.id}`);
            if (res.data.success) {
                alert('Yetki başarıyla silindi!');
                fetchPermissions();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Yetki silinemedi!');
        }
    };

    const getTypeIcon = (type) => {
        if (type === 'menu_group') return Folder;
        if (type === 'menu') return File;
        return Zap;
    };

    const getTypeLabel = (type) => {
        if (type === 'menu_group') return 'Menü Grubu';
        if (type === 'menu') return 'Menü';
        return 'Aksiyon';
    };

    const menuGroups = permissions.filter(p => p.permission_type === 'menu_group');
    const menus = permissions.filter(p => p.permission_type === 'menu');
    const actions = permissions.filter(p => p.permission_type === 'action');

    const getParentOptions = () => {
        if (formData.permission_type === 'menu') {
            return menuGroups;
        } else if (formData.permission_type === 'action') {
            return menus;
        }
        return [];
    };

    if (loading) {
        return (
            <div className="permission-management-container">
                <div className="loading-state">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="permission-management-container">
            <div className="page-header">
                <h2>Yetki Yönetimi</h2>
                <div className="header-actions">
                    <div className="header-stats">
                        <span><strong>{menuGroups.length}</strong> Menü Grubu</span>
                        <span>•</span>
                        <span><strong>{menus.length}</strong> Menü</span>
                        <span>•</span>
                        <span><strong>{actions.length}</strong> Aksiyon</span>
                    </div>
                    <button className="add-permission-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        Yeni Yetki
                    </button>
                </div>
            </div>

            <div className="permissions-grid">
                {/* MENU GROUPS */}
                <div className="permission-category">
                    <div className="category-header">
                        <Folder size={20} />
                        <h3>Menü Grupları</h3>
                        <span className="count">{menuGroups.length}</span>
                    </div>
                    <div className="category-content">
                        {menuGroups.map(perm => {
                            const TypeIcon = getTypeIcon(perm.permission_type);
                            return (
                                <div key={perm.id} className="permission-card">
                                    <div className="card-icon">
                                        <TypeIcon size={20} />
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title">{perm.description}</div>
                                        <div className="card-code">{perm.permission_code}</div>
                                    </div>
                                    <div className="card-actions">
                                        <button className="edit-btn" onClick={() => handleOpenModal(perm)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(perm)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MENUS */}
                <div className="permission-category">
                    <div className="category-header">
                        <File size={20} />
                        <h3>Menüler</h3>
                        <span className="count">{menus.length}</span>
                    </div>
                    <div className="category-content">
                        {menus.map(perm => {
                            const TypeIcon = getTypeIcon(perm.permission_type);
                            const parent = permissions.find(p => p.permission_code === perm.parent_code);
                            return (
                                <div key={perm.id} className="permission-card">
                                    <div className="card-icon">
                                        <TypeIcon size={20} />
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title">{perm.description}</div>
                                        <div className="card-code">{perm.permission_code}</div>
                                        {parent && (
                                            <div className="card-parent">
                                                <Folder size={12} />
                                                {parent.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-actions">
                                        <button className="edit-btn" onClick={() => handleOpenModal(perm)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(perm)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="permission-category">
                    <div className="category-header">
                        <Zap size={20} />
                        <h3>Aksiyonlar</h3>
                        <span className="count">{actions.length}</span>
                    </div>
                    <div className="category-content">
                        {actions.map(perm => {
                            const TypeIcon = getTypeIcon(perm.permission_type);
                            const parent = permissions.find(p => p.permission_code === perm.parent_code);
                            return (
                                <div key={perm.id} className="permission-card">
                                    <div className="card-icon">
                                        <TypeIcon size={20} />
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title">{perm.description}</div>
                                        <div className="card-code">{perm.permission_code}</div>
                                        {parent && (
                                            <div className="card-parent">
                                                <File size={12} />
                                                {parent.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-actions">
                                        <button className="edit-btn" onClick={() => handleOpenModal(perm)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(perm)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingPermission ? 'Yetki Düzenle' : 'Yeni Yetki Oluştur'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Yetki Tipi</label>
                            <select
                                value={formData.permission_type}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    permission_type: e.target.value,
                                    parent_code: ''
                                })}
                            >
                                <option value="menu_group">Menü Grubu</option>
                                <option value="menu">Menü</option>
                                <option value="action">Aksiyon</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Açıklama</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Örn: Kullanıcı Yönetimi"
                            />
                        </div>

                        <div className="form-group">
                            <label>Yetki Kodu</label>
                            <input
                                type="text"
                                value={formData.permission_code}
                                onChange={(e) => setFormData({ ...formData, permission_code: e.target.value })}
                                placeholder={
                                    formData.permission_type === 'menu_group' ? 'Örn: admin:management' :
                                        formData.permission_type === 'menu' ? 'Örn: admin:users' :
                                            'Örn: users:create'
                                }
                            />
                        </div>

                        {formData.permission_type !== 'menu_group' && formData.permission_type !== 'action' && (
                            <div className="form-group">
                                <label>
                                    {formData.permission_type === 'menu' ? 'Menü Grubu (Opsiyonel)' : 'Menü (Opsiyonel)'}
                                </label>
                                <select
                                    value={formData.parent_code}
                                    onChange={(e) => setFormData({ ...formData, parent_code: e.target.value })}
                                >
                                    <option value="">Seçiniz...</option>
                                    {getParentOptions().map(parent => (
                                        <option key={parent.id} value={parent.permission_code}>
                                            {parent.description} ({parent.permission_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={handleCloseModal}>
                                İptal
                            </button>
                            <button className="save-btn" onClick={handleSubmit}>
                                <Save size={18} />
                                {editingPermission ? 'Güncelle' : 'Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionManagement;