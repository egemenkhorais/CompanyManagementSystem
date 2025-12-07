import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, AlertCircle } from 'lucide-react'; // AlertCircle eklendi
import axiosInstance from '../../../api/axiosInstance';
import './MeetingManagement.css';

const MeetingView = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        setError(null);

        try {
            // Yapay gecikme (800ms) + API isteği
            const [response] = await Promise.all([
                axiosInstance.get('/meetings'),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);

            if (response.data.success) {
                setMeetings(response.data.data);
            }
        } catch (err) {
            console.error('Toplantılar yüklenirken hata:', err);
            // Hata mesajını state'e atıyoruz
            setError('Veriler alınırken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
        } finally {
            // Başarılı da olsa başarısız da olsa yüklemeyi bitir
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { label: 'Bekliyor', color: '#ffa726', bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 0.4)' },
            'approved': { label: 'Onaylandı', color: '#66bb6a', bg: 'rgba(76, 175, 80, 0.2)', border: 'rgba(76, 175, 80, 0.4)' },
            'cancelled': { label: 'İptal', color: '#ef5350', bg: 'rgba(244, 67, 54, 0.2)', border: 'rgba(244, 67, 54, 0.4)' }
        };

        // status undefined gelirse patlamasın diye önlem
        const safeStatus = status || 'pending';
        const config = statusConfig[safeStatus] || statusConfig['pending'];

        return (
            <span style={{
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: config.bg,
                color: config.color,
                border: `1px solid ${config.border}`
            }}>
                {config.label}
            </span>
        );
    };

    // --- RENDER AŞAMALARI ---

    // 1. Yükleniyor Durumu
    if (loading) {
        return (
            <div className="content-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader"></div> {/* Eğer CSS'de loader class'ın yoksa düz yazı kalır */}
                    <p style={{ color: '#666', marginTop: '10px' }}>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // 2. Hata Durumu (Burası eksikti)
    if (error) {
        return (
            <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                <AlertCircle size={48} color="#ef5350" style={{ margin: '0 auto 15px' }} />
                <h3 style={{ color: '#d32f2f' }}>Bir Hata Oluştu</h3>
                <p style={{ color: '#555', marginBottom: '20px' }}>{error}</p>
                <button className="action-btn" onClick={fetchMeetings}>
                    Tekrar Dene
                </button>
            </div>
        );
    }

    // 3. Veri Listeleme Durumu
    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Toplantılar</h2>
                    <p className="page-subtitle">Planlanmış toplantıları görüntüleyebilirsiniz.</p>
                </div>
            </div>

            {meetings.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <Calendar size={48} color="#ccc" style={{ marginBottom: '10px' }} />
                    <p>Henüz planlanmış bir toplantı bulunmuyor.</p>
                </div>
            ) : (
                <div className="meetings-list">
                    {meetings.map(meeting => {
                        // Backend'den tarih 'start_time' içinde geliyor olabilir.
                        // Güvenli tarih formatı:
                        const meetingDate = meeting.start_time ? new Date(meeting.start_time) : new Date();
                        const dateStr = meetingDate.toLocaleDateString('tr-TR');

                        // Saatleri ayır (PostgreSQL timestamp geliyorsa):
                        const startTimeStr = meeting.start_time ? new Date(meeting.start_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : '--:--';
                        const endTimeStr = meeting.end_time ? new Date(meeting.end_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : '--:--';

                        return (
                            <div key={meeting.id} className="meeting-card">
                                <div className="meeting-header">
                                    <div className="meeting-title-section">
                                        <h3>{meeting.title}</h3>
                                        {getStatusBadge(meeting.status)}
                                    </div>
                                    {meeting.organizer && (
                                        <span style={{ fontSize: '12px', color: '#888' }}>Düzenleyen: {meeting.organizer}</span>
                                    )}
                                </div>

                                <div className="meeting-info">
                                    <div className="info-row">
                                        <MapPin size={16} />
                                        <span>{meeting.room_name || `Oda #${meeting.room_id}`}</span>
                                    </div>
                                    <div className="info-row">
                                        <Calendar size={16} />
                                        <span>{dateStr}</span>
                                    </div>
                                    <div className="info-row">
                                        <Clock size={16} />
                                        {/* Backend formatına göre burayı düzelttim */}
                                        <span>{startTimeStr} - {endTimeStr}</span>
                                    </div>
                                    {meeting.participants && (
                                        <div className="info-row">
                                            <Users size={16} />
                                            <span>{meeting.participants}</span>
                                        </div>
                                    )}
                                </div>

                                {meeting.description && (
                                    <p className="meeting-description">{meeting.description}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MeetingView;