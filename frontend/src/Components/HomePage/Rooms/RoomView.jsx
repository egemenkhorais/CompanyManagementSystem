import React, { useState, useEffect } from 'react';
import { DoorOpen, X, Calendar, Clock, CheckCircle, Briefcase, Coffee, Monitor } from 'lucide-react';
// HATA BURADAYDI: Dosya yolu RoomManagement ile aynı olmalı (../../../)
import axiosInstance from '../../../api/axiosInstance';
import './RoomManagement.css';

const RoomView = () => {
    const [rooms, setRooms] = useState([]);
    const [allMeetings, setAllMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State: Rezervasyon & Görselleştirme ---
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
    const [roomSchedule, setRoomSchedule] = useState([]);

    const [bookingData, setBookingData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0], // Bugün
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Paralel veri çekme
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

    // --- Helper: Seçili Odaya ve Tarihe Göre Doluluk Listesini Güncelle ---
    const updateRoomSchedule = (roomId, dateStr) => {
            if (!roomId || !dateStr) return;

            const dailyMeetings = allMeetings.filter(m => {
                // Backend'den gelen tarih: "2024-11-25T14:00:00.000Z" (Örnek)
                const meetingDateObj = new Date(m.start_time);

                // Seçilen tarih inputundan gelen değer: "2024-11-25" (String)
                // Bu tarihi, karşılaştırma yapabilmek için yerel tarih stringine çevirmemiz lazım.

                // HATA ÇÖZÜMÜ: toISOString() yerine, manuel formatlama veya yerel tarih kontrolü yapıyoruz.
                const year = meetingDateObj.getFullYear();
                const month = String(meetingDateObj.getMonth() + 1).padStart(2, '0');
                const day = String(meetingDateObj.getDate()).padStart(2, '0');

                const meetingDateStr = `${year}-${month}-${day}`;

                // Backend join'den bazen room_id bazen companyroomid gelebilir
                const mRoomId = m.room_id || m.companyroomid || m.roomid;

                // Hem Oda ID'si hem de Tarih (YYYY-MM-DD) eşleşmeli
                return String(mRoomId) === String(roomId) && meetingDateStr === dateStr;
            });

            dailyMeetings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            setRoomSchedule(dailyMeetings);
        };

    // ==================== REZERVASYON İŞLEMLERİ ====================

    const handleRoomClick = (room) => {
        setSelectedRoomForBooking(room);
        updateRoomSchedule(room.companyroomid, bookingData.date);
        setShowBookingModal(true);
    };

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
                meetingstartdate: bookingData.date,
                start_time: bookingData.startTime,
                end_time: bookingData.endTime
            };

            const response = await axiosInstance.post('/meetings', payload);
            if (response.data.success) {
                alert(`"${selectedRoomForBooking.companyroomname}" rezerve edildi!`);
                setShowBookingModal(false);
                setBookingData({ ...bookingData, title: '', startTime: '', endTime: '' });
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Rezervasyon yapılamadı.');
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
                    <h2>Odalar</h2>
                    <p className="page-subtitle">Müsaitlik durumunu görmek ve rezervasyon yapmak için bir odaya tıklayın.</p>
                </div>
            </div>

            {/* KROKİ GÖRÜNÜMÜ */}
            <div className="blueprint-container">
                {rooms.length === 0 ? (
                    <div style={{color:'white', margin:'auto'}}>Tanımlı oda yok.</div>
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
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- MODAL: REZERVASYON VE PROGRAM (Split View) --- */}
            {showBookingModal && selectedRoomForBooking && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedRoomForBooking.companyroomname}</h3>
                            <button className="close-btn" onClick={() => setShowBookingModal(false)}><X size={20}/></button>
                        </div>

                        <div className="modal-body-grid">
                            {/* SOL TARAF: Rezervasyon Formu */}
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
                                    <div className="modal-actions" style={{paddingBottom:0, border:0}}>
                                        <button type="submit" className="action-btn full-width">Rezervasyon Yap</button>
                                    </div>
                                </form>
                            </div>

                            {/* SAĞ TARAF: Odanın Doluluk Programı */}
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

export default RoomView;