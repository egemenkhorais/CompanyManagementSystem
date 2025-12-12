import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './MeetingManagement.css';

const MeetingManagement = ({ userPermissions = [] }) => {
    const [meetings, setMeetings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    const [formData, setFormData] = useState({
        room_id: '',
        title: '',
        description: '',
        meeting_date: '',
        start_time: '',
        end_time: '',
        participants: ''
    });

    // Yetki kontrolü (Database'deki permission_code'lara göre)
    const canCreate = userPermissions.some(p => p.permission_code === 'meetings:create' || p.permission_code === 'meetings:management');
    const canEdit = userPermissions.some(p => p.permission_code === 'meetings:edit' || p.permission_code === 'meetings:management');
    const canDelete = userPermissions.some(p => p.permission_code === 'meetings:delete' || p.permission_code === 'meetings:management');
    const canApprove = userPermissions.some(p => p.permission_code === 'meetings:approve' || p.permission_code === 'meetings:management');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Promise.all ile odaları ve toplantıları paralel çekiyoruz
            const [meetingsRes, roomsRes] = await Promise.all([
                axiosInstance.get('/meetings'),
                axiosInstance.get('/rooms')
            ]);

            if (meetingsRes.data.success) {
                setMeetings(meetingsRes.data.data);
            }
            if (roomsRes.data.success) {
                setRooms(roomsRes.data.data);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            // alert('Veriler yüklenemedi!'); // Kullanıcıyı sürekli darlamamak için kapattım
        } finally {
            setLoading(false);
        }
    };

    // Helper: Tarih nesnesinden 'HH:mm' formatında saat alma
    const extractTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    // Helper: Tarih nesnesinden 'YYYY-MM-DD' formatında tarih alma
    const extractDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Modal aç (Düzenleme veya Yeni Ekleme)
    const handleOpenModal = (meeting = null) => {
        if (meeting) {
            setEditingMeeting(meeting);
            // Backend'den gelen TIMESTAMP verisini form inputlarına ayırıyoruz
            setFormData({
                room_id: meeting.room_id || meeting.roomId, // Bazen join'den farklı gelebilir
                title: meeting.title,
                description: meeting.description || '',
                meeting_date: extractDate(meeting.start_time), // Timestamp'ten tarihi al
                start_time: extractTime(meeting.start_time),   // Timestamp'ten saati al
                end_time: extractTime(meeting.end_time),       // Timestamp'ten saati al
                participants: meeting.participants || ''
            });
        } else {
            setEditingMeeting(null);
            setFormData({
                room_id: '',
                title: '',
                description: '',
                meeting_date: '',
                start_time: '',
                end_time: '',
                participants: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMeeting(null);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingMeeting) {
                // Güncelleme
                const response = await axiosInstance.put(`/meetings/${editingMeeting.id}`, formData);
                if (response.data.success) {
                    alert('Toplantı başarıyla güncellendi!');
                    fetchData();
                    handleCloseModal();
                }
            } else {
                // Yeni Kayıt
                // Backend controller yapımız meeting_date, start_time, end_time'ı ayrı bekleyip birleştiriyordu.
                const response = await axiosInstance.post('/rooms/book', formData); // Veya '/meetings' route yapına göre
                if (response.data.success) {
                    alert('Toplantı başarıyla oluşturuldu!');
                    fetchData();
                    handleCloseModal();
                }
            }
        } catch (error) {
            console.error('İşlem hatası:', error);
            alert(error.response?.data?.message || 'Bir hata oluştu!');
        }
    };

    const handleDelete = async (meetingId) => {
        if (!window.confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/meetings/${meetingId}`);
            if (response.data.success) {
                // alert('Silindi'); // UI'da akışkanlık için alert kapatılabilir
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Silinemedi!');
        }
    };

    const handleStatusUpdate = async (meetingId, newStatus) => {
        try {
            const response = await axiosInstance.patch(`/meetings/${meetingId}/status`, {
                status: newStatus
            });
            if (response.data.success) {
                fetchData();
            }
        } catch (error) {
            alert('Durum güncellenemedi!');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            'pending': { label: 'Bekliyor', color: '#ffa726', bg: 'rgba(255, 152, 0, 0.2)' },
            'approved': { label: 'Onaylandı', color: '#66bb6a', bg: 'rgba(76, 175, 80, 0.2)' },
            'cancelled': { label: 'İptal', color: '#ef5350', bg: 'rgba(244, 67, 54, 0.2)' }
        }[status || 'pending'];

        return (
            <span style={{
                padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                backgroundColor: config.bg, color: config.color, border: `1px solid ${config.color}40`
            }}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return <div className="content-card"><p>Yükleniyor...</p></div>;
    }

    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Toplantı Yönetimi</h2>
                    <p className="page-subtitle">Toplantıları buradan planlayabilir ve yönetebilirsiniz.</p>
                </div>
                {canCreate && (
                    <button className="action-btn" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Yeni Toplantı
                    </button>
                )}
            </div>

            {meetings.length === 0 ? (
                <div className="empty-state">
                    <Calendar size={48} color="#666" />
                    <p>Henüz kayıtlı toplantı yok.</p>
                </div>
            ) : (
                <div className="meetings-list">
                    {meetings.map(meeting => {
                        // Listeleme için tarih formatlama
                        const startDate = new Date(meeting.start_time);
                        const dateStr = startDate.toLocaleDateString('tr-TR');
                        const timeStr = `${extractTime(meeting.start_time)} - ${extractTime(meeting.end_time)}`;

                        return (
                            <div key={meeting.id} className="meeting-card">
                                <div className="meeting-header">
                                    <div className="meeting-title-section">
                                        <h3>{meeting.title}</h3>
                                        {getStatusBadge(meeting.status)}
                                    </div>
                                    <div className="meeting-actions">
                                        {canApprove && meeting.status === 'pending' && (
                                            <>
                                                <button className="icon-btn success" onClick={() => handleStatusUpdate(meeting.id, 'approved')} title="Onayla">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button className="icon-btn danger" onClick={() => handleStatusUpdate(meeting.id, 'cancelled')} title="Reddet">
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                        {canEdit && (
                                            <button className="icon-btn" onClick={() => handleOpenModal(meeting)} title="Düzenle">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button className="icon-btn delete" onClick={() => handleDelete(meeting.id)} title="Sil">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="meeting-info">
                                    <div className="info-row">
                                        <MapPin size={16} />
                                        {/* roomname -> name değiştiği için */}
                                        <span>{meeting.room_name || `Oda #${meeting.room_id}`}</span>
                                    </div>
                                    <div className="info-row">
                                        <Calendar size={16} />
                                        <span>{dateStr}</span>
                                    </div>
                                    <div className="info-row">
                                        <Clock size={16} />
                                        <span>{timeStr}</span>
                                    </div>
                                    {meeting.participants && (
                                        <div className="info-row">
                                            <Users size={16} />
                                            <span>{meeting.participants}</span>
                                        </div>
                                    )}
                                </div>
                                {meeting.organizer && (
                                    <div style={{fontSize:'12px', color:'#999', marginTop:'5px'}}>
                                        Düzenleyen: {meeting.organizer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingMeeting ? 'Toplantıyı Düzenle' : 'Yeni Toplantı Planla'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Konu *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Örn: Haftalık Planlama" />
                            </div>

                            <div className="form-group">
                                <label>Oda Seçin *</label>
                                <select name="room_id" value={formData.room_id} onChange={handleInputChange} required>
                                    <option value="">Seçiniz...</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {/* roomname -> name değişti */}
                                            {room.name} ({room.capacity} Kişilik)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tarih *</label>
                                <input type="date" name="meetingstartdate" value={formData.meeting_date} onChange={handleInputChange} required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlangıç *</label>
                                    <input type="time" name="meetingstartdate" value={formData.start_time} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Bitiş *</label>
                                    <input type="time" name="meetingenddate" value={formData.end_time} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Katılımcılar</label>
                                <input type="text" name="participants" value={formData.participants} onChange={handleInputChange} placeholder="Virgülle ayırarak girin..." />
                            </div>

                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Notlar..." />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={handleCloseModal}>İptal</button>
                                <button type="submit" className="action-btn">
                                    {editingMeeting ? 'Güncelle' : 'Planla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingManagement;