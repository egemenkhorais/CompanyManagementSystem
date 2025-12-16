import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Clock, Users, MapPin, AlertCircle,
    Briefcase, Building, RefreshCw
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './MeetingManagement.css'; // Aynı CSS dosyasını kullanıyoruz (Dark Theme)

const MeetingView = () => {
    const [meetings, setMeetings] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- HELPER: Tarih ve Saat Ayrıştırma ---
    const extractTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toTimeString().substring(0, 5); // "14:30"
    };

    const extractDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR'); // "16.12.2025"
    };

    // --- VERİ ÇEKME ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Toplantıları Çek
            const meetingsReq = axiosInstance.get('/meetings');

            // 2. Departmanları Çek (Hata verirse boş dizi dön)
            const deptsReq = axiosInstance.get('/departments').catch(() => ({ data: { success: false, data: [] } }));

            // 3. Projeleri Çek (Hata verirse boş dizi dön)
            const projsReq = axiosInstance.get('/projects').catch(() => ({ data: { success: false, data: [] } }));

            // Hepsini bekle
            const [meetingsRes, deptsRes, projsRes] = await Promise.all([meetingsReq, deptsReq, projsReq]);

            if (meetingsRes.data.success) {
                setMeetings(meetingsRes.data.data);
            }

            if (deptsRes.data?.success) setDepartments(deptsRes.data.data);
            if (projsRes.data?.success) setProjects(projsRes.data.data);

        } catch (err) {
            console.error('Veri yükleme hatası:', err);
            setError('Veriler alınırken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HELPERS: ID'den İsim Bulma ---
    const getDepartmentName = (id) => {
        if (!id) return null;
        const dept = departments.find(d => d.id === id || d.departmentid === id);
        return dept ? (dept.name || dept.departmentname) : null;
    };

    const getProjectName = (id) => {
        if (!id) return null;
        const proj = projects.find(p => p.id === id || p.projectid === id);
        return proj ? (proj.name || proj.projectname) : null;
    };

    const getStatusBadge = (status) => {
        const config = {
            'pending': { label: 'Bekliyor', color: '#ffa726', bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 0.4)' },
            'approved': { label: 'Onaylandı', color: '#66bb6a', bg: 'rgba(76, 175, 80, 0.2)', border: 'rgba(76, 175, 80, 0.4)' },
            'cancelled': { label: 'İptal', color: '#ef5350', bg: 'rgba(244, 67, 54, 0.2)', border: 'rgba(244, 67, 54, 0.4)' }
        }[status || 'pending'];

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

    // --- RENDER ---

    if (loading) return <div className="content-card"><p>Yükleniyor...</p></div>;

    if (error) {
        return (
            <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                <AlertCircle size={48} color="#ef5350" style={{ margin: '0 auto 15px' }} />
                <h3 style={{ color: '#ef5350' }}>Hata</h3>
                <p style={{ color: '#b8b8b8', marginBottom: '20px' }}>{error}</p>
                <button className="action-btn" onClick={fetchData} style={{margin:'0 auto'}}>
                    <RefreshCw size={18} /> Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Toplantı Listesi</h2>
                    <p className="page-subtitle">Planlanmış tüm toplantıları buradan takip edebilirsiniz.</p>
                </div>
                <button className="ghost-btn" onClick={fetchData} title="Yenile">
                    <RefreshCw size={20} />
                </button>
            </div>

            {meetings.length === 0 ? (
                <div className="empty-state">
                    <Calendar size={48} color="#666" />
                    <p>Henüz planlanmış bir toplantı bulunmuyor.</p>
                </div>
            ) : (
                <div className="meetings-list">
                    {meetings.map(meeting => {
                        // Veri Ayrıştırma
                        const mDate = meeting.meetingstartdate || meeting.start_time;
                        const mEnd = meeting.meetingenddate || meeting.end_time;

                        const dateStr = extractDate(mDate);
                        const timeStr = `${extractTime(mDate)} - ${extractTime(mEnd)}`;

                        // İsimlendirmeler
                        const roomName = meeting.companyroomname || meeting.room_name || `Oda #${meeting.room_id}`;
                        const deptName = getDepartmentName(meeting.meetingdepartmentid || meeting.department_id);
                        const projName = getProjectName(meeting.relatedprojectid || meeting.project_id);

                        return (
                            <div key={meeting.meetingid || meeting.id} className="meeting-card">
                                <div className="meeting-header">
                                    <div className="meeting-title-section">
                                        <h3>{meeting.meetingsubject || meeting.title}</h3>
                                        {getStatusBadge(meeting.status)}
                                    </div>
                                    {meeting.organizer && (
                                        <span style={{ fontSize: '12px', color: '#888' }}>
                                            Organizatör: {meeting.organizer}
                                        </span>
                                    )}
                                </div>

                                <div className="meeting-info">
                                    {/* Oda */}
                                    <div className="info-row">
                                        <MapPin size={16} />
                                        <span>{roomName}</span>
                                    </div>

                                    {/* Tarih */}
                                    <div className="info-row">
                                        <Calendar size={16} />
                                        <span>{dateStr}</span>
                                    </div>

                                    {/* Saat */}
                                    <div className="info-row">
                                        <Clock size={16} />
                                        <span>{timeStr}</span>
                                    </div>

                                    {/* Katılımcılar */}
                                    {meeting.participants && (
                                        <div className="info-row">
                                            <Users size={16} />
                                            <span>{meeting.participants}</span>
                                        </div>
                                    )}

                                    {/* Departman (Varsa) */}
                                    {deptName && (
                                        <div className="info-row">
                                            <Briefcase size={16} />
                                            <span>{deptName}</span>
                                        </div>
                                    )}

                                    {/* Proje (Varsa) */}
                                    {projName && (
                                        <div className="info-row">
                                            <Building size={16} />
                                            <span>{projName}</span>
                                        </div>
                                    )}
                                </div>

                                {meeting.description && (
                                    <div style={{
                                        marginTop: '15px',
                                        paddingTop: '15px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '14px',
                                        color: '#b8b8b8'
                                    }}>
                                        {meeting.description}
                                    </div>
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