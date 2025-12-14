import React, { useState, useEffect } from 'react';
import './DepartmentManagement.css';
import axiosInstance from '../../../api/axiosInstance';
import { Trash2, Edit2, Plus, X, Save } from 'lucide-react';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [positions, setPositions] = useState([]);

    // Modals
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [showEditDepartment, setShowEditDepartment] = useState(false);
    const [showAddPosition, setShowAddPosition] = useState(false);
    const [showEditPosition, setShowEditPosition] = useState(false);

    // Form states
    const [departmentForm, setDepartmentForm] = useState({ name: '' });
    const [positionForm, setPositionForm] = useState({});

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axiosInstance.get('/departments');
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error('Departmanlar yüklenemedi:', error);
        }
    };

    const fetchDepartmentPositions = async (departmentId) => {
        try {
            const response = await axiosInstance.get(`/departments/${departmentId}/positions`);
            if (response.data.success) {
                setPositions(response.data.data);
            }
        } catch (error) {
            console.error('Pozisyonlar yüklenemedi:', error);
            setPositions([]);
        }
    };

    const handleSelectDepartment = (dept) => {
        setSelectedDepartment(dept);
        fetchDepartmentPositions(dept.departmentid);
    };

    // Departman İşlemleri
    const handleAddDepartment = async () => {
        if (!departmentForm.name.trim()) {
            alert('Departman adı boş olamaz!');
            return;
        }

        try {
            const response = await axiosInstance.post('/departments', {
                departmentname: departmentForm.name
            });

            if (response.data.success) {
                alert('Departman eklendi!');
                setShowAddDepartment(false);
                setDepartmentForm({ name: '' });
                fetchDepartments();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Departman eklenemedi!');
        }
    };

    const handleEditDepartment = async () => {
        if (!departmentForm.name.trim()) {
            alert('Departman adı boş olamaz!');
            return;
        }

        try {
            const response = await axiosInstance.put(`/departments/${selectedDepartment.departmentid}`, {
                departmentname: departmentForm.name
            });

            if (response.data.success) {
                alert('Departman güncellendi!');
                setShowEditDepartment(false);
                fetchDepartments();
                setSelectedDepartment({ ...selectedDepartment, departmentname: departmentForm.name });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Departman güncellenemedi!');
        }
    };

    const handleDeleteDepartment = async (deptId, e) => {
        e.stopPropagation();
        if (!window.confirm('Bu departmanı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/departments/${deptId}`);
            if (response.data.success) {
                alert(response.data.message);
                fetchDepartments();
                if (selectedDepartment?.departmentid === deptId) {
                    setSelectedDepartment(null);
                    setPositions([]);
                }
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Departman silinemedi!');
        }
    };

    // Pozisyon İşlemleri
    const handleAddPosition = async () => {
        if (!positionForm.position_name?.trim() || !positionForm.level?.trim()) {
            alert('Pozisyon adı ve seviye zorunludur!');
            return;
        }

        try {
            const response = await axiosInstance.post(
                `/departments/${selectedDepartment.departmentid}/positions`,
                {
                    position_name: positionForm.position_name,
                    level: positionForm.level,
                    description: positionForm.description || '',
                    quota: positionForm.quota || 1
                }
            );

            if (response.data.success) {
                alert('Pozisyon eklendi!');
                setShowAddPosition(false);
                setPositionForm({});
                fetchDepartmentPositions(selectedDepartment.departmentid);
                fetchDepartments();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Pozisyon eklenemedi!');
        }
    };

    const handleEditPosition = async () => {
        if (!positionForm.position_name?.trim() || !positionForm.level?.trim()) {
            alert('Pozisyon adı ve seviye zorunludur!');
            return;
        }

        try {
            const response = await axiosInstance.put(
                `/departments/positions/${positionForm.id}`,
                {
                    position_name: positionForm.position_name,
                    level: positionForm.level,
                    description: positionForm.description || '',
                    quota: positionForm.quota || 1
                }
            );

            if (response.data.success) {
                alert('Pozisyon güncellendi!');
                setShowEditPosition(false);
                setPositionForm({});
                fetchDepartmentPositions(selectedDepartment.departmentid);
                fetchDepartments();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Pozisyon güncellenemedi!');
        }
    };

    const handleDeletePosition = async (positionId) => {
        if (!window.confirm('Bu pozisyonu silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/departments/positions/${positionId}`);
            if (response.data.success) {
                alert(response.data.message);
                fetchDepartmentPositions(selectedDepartment.departmentid);
                fetchDepartments();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Pozisyon silinemedi!');
        }
    };

    return (
        <div className="dept-management">
            <div className="dept-content">
                {/* Sol Panel - Departmanlar */}
                <div className="dept-sidebar">
                    <div className="sidebar-header">
                        <h3>Departmanlar</h3>
                        <button className="add-dept-btn" onClick={() => setShowAddDepartment(true)}>
                            <Plus size={18} />
                            <span>Ekle</span>
                        </button>
                    </div>

                    <div className="dept-list">
                        {departments.map(dept => (
                            <div
                                key={dept.departmentid}
                                className={`dept-item ${selectedDepartment?.departmentid === dept.departmentid ? 'active' : ''}`}
                                onClick={() => handleSelectDepartment(dept)}
                            >
                                <div className="dept-info">
                                    <div className="dept-name">{dept.departmentname}</div>
                                </div>
                                <button
                                    className="edit-dept-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDepartmentForm({ name: dept.departmentname });
                                        setShowEditDepartment(true);
                                    }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="delete-dept-icon"
                                    onClick={(e) => handleDeleteDepartment(dept.departmentid, e)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ Panel - Pozisyonlar */}
                <div className="pos-details">
                    {selectedDepartment ? (
                        <>
                            <div className="pos-header">
                                <h3>{selectedDepartment.departmentname} - Pozisyonlar</h3>
                                <button className="add-pos-btn" onClick={() => setShowAddPosition(true)}>
                                    <Plus size={18} /> Ekle
                                </button>
                            </div>

                            <div className="pos-table-container">
                                <table className="pos-table">
                                    <thead>
                                    <tr>
                                        <th>Pozisyon</th>
                                        <th>Seviye</th>
                                        <th>Kontenjan</th>
                                        <th>Mevcut</th>
                                        <th>İşlemler</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {positions.length > 0 ? positions.map(pos => (
                                        <tr key={pos.id}>
                                            <td>{pos.position_name}</td>
                                            <td>{pos.level}</td>
                                            <td>{pos.quota}</td>
                                            <td>{pos.current_count || 0}</td>
                                            <td>
                                                <div className="pos-actions">
                                                    <button
                                                        className="edit-pos-icon"
                                                        onClick={() => {
                                                            setPositionForm({
                                                                id: pos.id,
                                                                position_name_id: pos.position_name_id,
                                                                position_name: pos.position_name,
                                                                level: pos.level,
                                                                description: pos.description || '',
                                                                quota: pos.quota
                                                            });
                                                            setShowEditPosition(true);
                                                        }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="delete-pos-icon"
                                                        onClick={() => handleDeletePosition(pos.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="empty">Pozisyon bulunamadı</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>Pozisyonları görmek için bir departman seçin</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Department Modal */}
            {showAddDepartment && (
                <div className="modal-overlay" onClick={() => setShowAddDepartment(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Yeni Departman</h3>
                            <button className="close-btn" onClick={() => setShowAddDepartment(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Departman Adı</label>
                            <input
                                type="text"
                                value={departmentForm.name}
                                onChange={(e) => setDepartmentForm({ name: e.target.value })}
                                placeholder="Departman adı"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowAddDepartment(false)}>İptal</button>
                            <button className="save-btn" onClick={handleAddDepartment}>
                                <Save size={16} /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Department Modal */}
            {showEditDepartment && (
                <div className="modal-overlay" onClick={() => setShowEditDepartment(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Departman Düzenle</h3>
                            <button className="close-btn" onClick={() => setShowEditDepartment(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Departman Adı</label>
                            <input
                                type="text"
                                value={departmentForm.name}
                                onChange={(e) => setDepartmentForm({ name: e.target.value })}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowEditDepartment(false)}>İptal</button>
                            <button className="save-btn" onClick={handleEditDepartment}>
                                <Save size={16} /> Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Position Modal */}
            {showAddPosition && (
                <div className="modal-overlay" onClick={() => setShowAddPosition(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Pozisyon Ekle - {selectedDepartment.departmentname}</h3>
                            <button className="close-btn" onClick={() => setShowAddPosition(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Pozisyon Adı *</label>
                            <input
                                type="text"
                                value={positionForm.position_name || ''}
                                onChange={(e) => setPositionForm({...positionForm, position_name: e.target.value})}
                                placeholder="Örn: Backend Developer"
                            />
                        </div>

                        <div className="form-group">
                            <label>Seviye *</label>
                            <input
                                type="text"
                                value={positionForm.level || ''}
                                onChange={(e) => setPositionForm({...positionForm, level: e.target.value})}
                                placeholder="Örn: Junior, Mid, Senior, Lead"
                            />
                        </div>

                        <div className="form-group">
                            <label>Açıklama (Opsiyonel)</label>
                            <textarea
                                value={positionForm.description || ''}
                                onChange={(e) => setPositionForm({...positionForm, description: e.target.value})}
                                placeholder="Pozisyon açıklaması"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Kontenjan *</label>
                            <input
                                type="number"
                                min="1"
                                value={positionForm.quota || 1}
                                onChange={(e) => setPositionForm({...positionForm, quota: parseInt(e.target.value) || 1})}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => {
                                setShowAddPosition(false);
                                setPositionForm({});
                            }}>İptal</button>
                            <button className="save-btn" onClick={handleAddPosition}>
                                <Save size={16} /> Ekle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Position Modal */}
            {showEditPosition && (
                <div className="modal-overlay" onClick={() => setShowEditPosition(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Pozisyon Düzenle</h3>
                            <button className="close-btn" onClick={() => setShowEditPosition(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Pozisyon Adı *</label>
                            <input
                                type="text"
                                value={positionForm.position_name || ''}
                                onChange={(e) => setPositionForm({...positionForm, position_name: e.target.value})}
                                placeholder="Pozisyon adı"
                            />
                        </div>

                        <div className="form-group">
                            <label>Seviye *</label>
                            <input
                                type="text"
                                value={positionForm.level || ''}
                                onChange={(e) => setPositionForm({...positionForm, level: e.target.value})}
                                placeholder="Seviye"
                            />
                        </div>

                        <div className="form-group">
                            <label>Açıklama</label>
                            <textarea
                                value={positionForm.description || ''}
                                onChange={(e) => setPositionForm({...positionForm, description: e.target.value})}
                                placeholder="Açıklama"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Kontenjan *</label>
                            <input
                                type="number"
                                min="1"
                                value={positionForm.quota || 1}
                                onChange={(e) => setPositionForm({...positionForm, quota: parseInt(e.target.value) || 1})}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowEditPosition(false)}>İptal</button>
                            <button className="save-btn" onClick={handleEditPosition}>
                                <Save size={16} /> Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagement;