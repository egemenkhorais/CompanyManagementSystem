import React, { useState, useEffect } from 'react';
import { DoorOpen, Plus, Edit2, Trash2, X, Calendar, Clock, CheckCircle, Briefcase, Coffee, Monitor } from 'lucide-react';
// DİKKAT: Dosya yolunu kendi proje yapınıza göre kontrol edin (örn: ../../api/axiosInstance)
import axiosInstance from '../../../api/axiosInstance';
import './RoomManagement.css';

const RoomManagement = ({ userPermissions = [] }) => {
    const [rooms, setRooms] = useState([]);
    const [allMeetings, setAllMeetings] = useState([]); // Timeline için tüm toplantılar
    const [loading, setLoading] = useState(true);

    // --- State: Oda Ekleme/Düzenleme (Admin) ---
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    // Veritabanı sütun isimleriyle birebir uyumlu state
    const [roomFormData, setRoomFormData] = useState({
        companyroomname: '',
        companyroomtype: '',
        companyroomdepartment: ''
    });

    // --- State: Rezervasyon & Görselleştirme (Kullanıcı) ---
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
    const [roomSchedule, setRoomSchedule] = useState([]); // Seçili odanın programı

    const [bookingData, setBookingData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0], // Bugünün tarihi
        startTime: '',
        endTime: ''
    });

    // İzin Kontrolleri
    const canCreate = userPermissions.some(p => p.permission_code === 'rooms:create' || p.permission_code === 'rooms:management');
    const canEdit = userPermissions.some(p => p.permission_code === 'rooms:edit' || p.permission_code === 'rooms:management');
    const canDelete = userPermissions.some(p => p.permission_code === 'rooms:delete' || p.permission_code === 'rooms:management');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Odaları ve Toplantıları paralel çekiyoruz
            const [roomsRes, meetingsRes] = await Promise.all([
                axiosInstance.get('/rooms'),
                axiosInstance.get('/meetings')
            ]);

            if (roomsRes.data.success) setRooms(roomsRes.data.data);
            if (meetingsRes.data.success) setAllMeetings(meetingsRes.data.data);

        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Helper: Timeline Güncelleme ---
    const updateRoomSchedule = (roomId, dateStr) => {
        if (!roomId || !dateStr) return;

        const dailyMeetings = allMeetings.filter(m => {
            const mDate = new Date(m.start_time).toISOString().split('T')[0];
            // Backend'den dönen veri bazen join ile farklı isimlerde gelebilir, hepsini kontrol et
            const mRoomId = m.room_id || m.companyroomid || m.roomid;

            return String(mRoomId) === String(roomId) && mDate === dateStr;
        });

        // Saate göre sırala
        dailyMeetings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        setRoomSchedule(dailyMeetings);
    };

    // ==================== ODA YÖNETİMİ (ADMIN) ====================

    const handleOpenRoomModal = (room = null, e) => {
        if (e) e.stopPropagation();
        if (room) {
            setEditingRoom(room);
            setRoomFormData({
                companyroomname: room.companyroomname,
                companyroomtype: room.companyroomtype,
                companyroomdepartment: room.companyroomdepartment || ''
            });
        } else {
            setEditingRoom(null);
            setRoomFormData({ companyroomname: '', companyroomtype: '', companyroomdepartment: '' });
        }
        setShowRoomModal(true);
    };

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                // Update: companyroomid kullanılıyor
                await axiosInstance.put(`/rooms/${editingRoom.companyroomid}`, roomFormData);
            } else {
                // Create
                await axiosInstance.post('/rooms', roomFormData);
            }
            alert('İşlem başarılı!');
            fetchData();
            setShowRoomModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu!');
        }
    };

    const handleDeleteRoom = async (roomId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Bu odayı silmek istediğinize emin misiniz?')) return;
        try {
            await axiosInstance.delete(`/rooms/${roomId}`);
            fetchData();
        } catch (error) {
            alert('Silinemedi! (Odaya bağlı toplantılar olabilir)');
        }
    };

    // ==================== REZERVASYON İŞLEMLERİ ====================

    // Odaya tıklandığında
    const handleRoomClick = (room) => {
        setSelectedRoomForBooking(room);
        // Modalı açarken o günün programını hesapla
        updateRoomSchedule(room.companyroomid, bookingData.date);
        setShowBookingModal(true);
    };

    // Tarih değiştiğinde
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setBookingData(prev => ({ ...prev, date: newDate }));
        if (selectedRoomForBooking) {
            updateRoomSchedule(selectedRoomForBooking.companyroomid, newDate);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                room_id: selectedRoomForBooking.companyroomid,
                title: bookingData.title,
                meetingstartdate: bookingData.date, // Controller bu ismi bekliyor
                start_time: bookingData.startTime,
                end_time: bookingData.endTime
            };

            const response = await axiosInstance.post('/meetings', payload);
            if (response.data.success) {
                alert(`"${selectedRoomForBooking.companyroomname}" rezerve edildi!`);
                setShowBookingModal(false);
                setBookingData({ ...bookingData, title: '', startTime: '', endTime: '' });
                fetchData(); // Listeyi yenile ki timeline güncellensin
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Rezervasyon yapılamadı (Çakışma olabilir).');
        }
    };

    // Görsel Helper
    const getRoomStyle = (type) => {
        switch (type) {
            case 'Meeting': return { color: '#a78bfa', icon: <Briefcase size={20}/> };
            case 'Workspace': return { color: '#60a5fa', icon: <Monitor size={20}/> };
            case 'Lounge': return { color: '#34d399', icon: <Coffee size={20}/> };
            default: return { color: '#94a3b8', icon: <DoorOpen size={20}/> };
        }
    };

    if (loading) return <div className="content-card"><p>Yükleniyor...</p></div>;

    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Ofis Planı & Yönetim</h2>
                    <p className="page-subtitle">Odalara tıklayarak doluluk durumunu görün ve rezervasyon yapın.</p>
                </div>
                {canCreate && (
                    <button className="action-btn" onClick={() => handleOpenRoomModal()}>
                        <Plus size={20} /> Oda Ekle
                    </button>
                )}
            </div>

            {/* KROKİ / BLUEPRINT ALANI */}
            <div className="blueprint-container">
                {rooms.length === 0 ? (
                    <div className="empty-state">Tanımlı oda yok.</div>
                ) : (
                    rooms.map(room => {
                        const styleInfo = getRoomStyle(room.companyroomtype);
                        return (
                            <div
                                key={room.companyroomid}
                                className="blueprint-room"
                                style={{ borderLeftColor: styleInfo.color }}
                                onClick={() => handleRoomClick(room)}
                            >
                                <div className="room-content">
                                    <div className="room-header">
                                        <span className="room-dept-badge">{room.companyroomdepartment || 'Genel'}</span>
                                        <div style={{color: styleInfo.color}}>{styleInfo.icon}</div>
                                    </div>

                                    <div>
                                        <h3 className="bp-room-name">{room.companyroomname}</h3>
                                        <span style={{color: styleInfo.color, fontSize:'0.85rem'}}>{room.companyroomtype}</span>
                                    </div>

                                    <div className="hover-indicator">
                                        <CheckCircle size={16} /> Programı Gör / Rezerve Et
                                    </div>
                                </div>

                                {(canEdit || canDelete) && (
                                    <div className="bp-actions">
                                        {canEdit && (
                                            <button className="bp-icon-btn" onClick={(e) => handleOpenRoomModal(room, e)}>
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button className="bp-icon-btn delete" onClick={(e) => handleDeleteRoom(room.companyroomid, e)}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- MODAL 1: ODA EKLE/DÜZENLE (ADMIN) --- */}
            {showRoomModal && (
                <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingRoom ? 'Odayı Düzenle' : 'Yeni Oda Tanımla'}</h3>
                            <button className="close-btn" onClick={() => setShowRoomModal(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleRoomSubmit}>
                            <div className="form-group">
                                <label>Oda Adı</label>
                                <input type="text" value={roomFormData.companyroomname} onChange={e => setRoomFormData({...roomFormData, companyroomname: e.target.value})} required placeholder="Örn: Toplantı A" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tip</label>
                                    <select value={roomFormData.companyroomtype} onChange={e => setRoomFormData({...roomFormData, companyroomtype: e.target.value})} required>
                                        <option value="">Seçiniz...</option>
                                        <option value="Meeting">Toplantı</option>
                                        <option value="Workspace">Çalışma</option>
                                        <option value="Lounge">Dinlenme</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Departman</label>
                                    <input type="text" value={roomFormData.companyroomdepartment} onChange={e => setRoomFormData({...roomFormData, companyroomdepartment: e.target.value})} placeholder="IT, HR..." />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="action-btn">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: REZERVASYON VE PROGRAM (SPLIT VIEW) --- */}
            {showBookingModal && selectedRoomForBooking && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedRoomForBooking.companyroomname}</h3>
                            <button className="close-btn" onClick={() => setShowBookingModal(false)}><X size={20}/></button>
                        </div>

                        <div className="modal-body-grid">
                            {/* SOL: Form */}
                            <div className="booking-form-section">
                                <form onSubmit={handleBookingSubmit} style={{padding:0}}>
                                    <div className="form-group">
                                        <label>Toplantı Başlığı</label>
                                        <input type="text" value={bookingData.title} onChange={e => setBookingData({...bookingData, title: e.target.value})} required placeholder="Konu..." />
                                    </div>
                                    <div className="form-group">
                                        <label><Calendar size={14}/> Tarih</label>
                                        <input type="date" value={bookingData.date} onChange={handleDateChange} required />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><Clock size={14}/> Başlangıç</label>
                                            <input type="time" value={bookingData.startTime} onChange={e => setBookingData({...bookingData, startTime: e.target.value})} required />
                                        </div>
                                        <div className="form-group">
                                            <label><Clock size={14}/> Bitiş</label>
                                            <input type="time" value={bookingData.endTime} onChange={e => setBookingData({...bookingData, endTime: e.target.value})} required />
                                        </div>
                                    </div>
                                    <div className="modal-actions" style={{paddingBottom:0, border:0, marginTop:'20px'}}>
                                        <button type="submit" className="action-btn full-width">Rezervasyon Yap</button>
                                    </div>
                                </form>
                            </div>

                            {/* SAĞ: Timeline */}
                            <div className="room-schedule-section">
                                <div className="schedule-title">
                                    <Calendar size={16}/>
                                    {new Date(bookingData.date).toLocaleDateString('tr-TR')} Programı
                                </div>
                                <div className="schedule-list">
                                    {roomSchedule.length === 0 ? (
                                        <div className="empty-schedule">Bu tarihte planlanmış toplantı yok.<br/>Tüm gün müsait.</div>
                                    ) : (
                                        roomSchedule.map((meeting, index) => (
                                            <div key={index} className="schedule-item busy">
                                                <span className="schedule-time">
                                                    {new Date(meeting.start_time).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} -
                                                    {new Date(meeting.end_time).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                                <span className="schedule-event">{meeting.title || meeting.meetingsubject}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;