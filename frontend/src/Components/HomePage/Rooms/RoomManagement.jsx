import React, { useState, useEffect } from 'react';
import { DoorOpen, Users, Plus, Edit2, Trash2, X, MapPin } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './RoomManagement.css';

const RoomManagement = ({ userPermissions = [] }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomname: '',
        roomtype: '',
        roomdepartment: ''
    });

    // Yetki kontrolü
    const canCreate = userPermissions.some(p => p.permission_code === 'rooms:create');
    const canEdit = userPermissions.some(p => p.permission_code === 'rooms:edit');
    const canDelete = userPermissions.some(p => p.permission_code === 'rooms:delete');

    // Odaları yükle
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axiosInstance.get('/rooms');
            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (error) {
            console.error('Odalar yüklenirken hata:', error);
            alert('Odalar yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    // Modal aç
    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                roomname: room.roomname,
                roomtype: room.roomtype,
                roomdepartment: room.roomdepartment || ''
            });
        } else {
            setEditingRoom(null);
            setFormData({
                roomname: '',
                roomtype: '',
                roomdepartment: ''
            });
        }
        setShowModal(true);
    };

    // Modal kapat
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRoom(null);
        setFormData({
            roomname: '',
            roomtype: '',
            roomdepartment: ''
        });
    };

    // Form değişiklik
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Oda kaydet/güncelle
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingRoom) {
                // Güncelleme
                const response = await axiosInstance.put(`/rooms/${editingRoom.id}`, formData);
                if (response.data.success) {
                    alert('Oda başarıyla güncellendi!');
                    fetchRooms();
                    handleCloseModal();
                }
            } else {
                // Yeni oda
                const response = await axiosInstance.post('/rooms', formData);
                if (response.data.success) {
                    alert('Oda başarıyla oluşturuldu!');
                    fetchRooms();
                    handleCloseModal();
                }
            }
        } catch (error) {
            console.error('Oda kaydedilirken hata:', error);
            alert(error.response?.data?.message || 'Bir hata oluştu!');
        }
    };

    // Oda sil
    const handleDelete = async (roomId) => {
        if (!window.confirm('Bu odayı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/rooms/${roomId}`);
            if (response.data.success) {
                alert('Oda başarıyla silindi!');
                fetchRooms();
            }
        } catch (error) {
            console.error('Oda silinirken hata:', error);
            alert(error.response?.data?.message || 'Oda silinemedi!');
        }
    };

    // Oda tipi etiketini göster
    const getRoomTypeBadge = (type) => {
        const typeConfig = {
            'Meeting': { label: 'Toplantı', color: '#9d4edd' },
            'Workspace': { label: 'Çalışma Alanı', color: '#3b82f6' },
            'Lounge': { label: 'Dinlenme', color: '#10b981' }
        };

        const config = typeConfig[type] || { label: type, color: '#9d4edd' };

        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: `${config.color}33`,
                color: config.color,
                border: `1px solid ${config.color}66`
            }}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="content-card">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Oda Yönetimi</h2>
                    <p className="page-subtitle">Toplantı odalarını buradan yönetebilirsiniz.</p>
                </div>
                {canCreate && (
                    <button className="action-btn" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Yeni Oda Ekle
                    </button>
                )}
            </div>

            <div className="rooms-grid">
                {rooms.length === 0 ? (
                    <div className="empty-state">
                        <DoorOpen size={48} color="#666" />
                        <p>Henüz oda bulunmuyor.</p>
                    </div>
                ) : (
                    rooms.map(room => (
                        <div key={room.id} className="room-card">
                            <div className="room-header">
                                <div>
                                    <h3>{room.roomname}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                        {getRoomTypeBadge(room.roomtype)}
                                        {room.roomdepartment && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <MapPin size={14} color="#9d4edd" />
                                                <span style={{ fontSize: '12px', color: '#b8b8b8' }}>
                                                    {room.roomdepartment}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {(canEdit || canDelete) && (
                                    <div className="room-actions">
                                        {canEdit && (
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleOpenModal(room)}
                                                title="Düzenle"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDelete(room.id)}
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingRoom ? 'Oda Düzenle' : 'Yeni Oda Ekle'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Oda Adı *</label>
                                <input
                                    type="text"
                                    name="roomname"
                                    value={formData.roomname}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Örn: Toplantı Odası A"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Oda Tipi *</label>
                                    <select
                                        name="roomtype"
                                        value={formData.roomtype}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seçin...</option>
                                        <option value="Meeting">Toplantı</option>
                                        <option value="Workspace">Çalışma Alanı</option>
                                        <option value="Lounge">Dinlenme</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Departman *</label>
                                    <input
                                        type="text"
                                        name="roomdepartment"
                                        value={formData.roomdepartment}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Örn: IT, HR, Genel"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={handleCloseModal}>
                                    İptal
                                </button>
                                <button type="submit" className="action-btn">
                                    {editingRoom ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;