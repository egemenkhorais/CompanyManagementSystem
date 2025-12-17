import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Clock, Users, MapPin, Plus, Edit2, Trash2,
    X, CheckCircle, XCircle, Briefcase, Building, RefreshCw
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './MeetingManagement.css';

const MeetingManagement = ({ userPermissions = [] }) => {
    // --- LİSTE STATE'LERİ ---
    const [meetings, setMeetings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- MODAL STATE'LERİ ---
    const [showModal, setShowModal] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    // --- FORM VERİSİ ---
    const [formData, setFormData] = useState({
        room_id: '',
        title: '',
        description: '',
        meeting_date: '',
        start_time: '',
        end_time: '',
        participants: '',
        department_id: '',
        project_id: ''
    });

    // --- YETKİ KONTROLLERİ ---
    const canCreate = userPermissions.some(p => p.permission_code === 'meetings:create' || p.permission_code === 'meetings:management');
    const canEdit = userPermissions.some(p => p.permission_code === 'meetings:edit' || p.permission_code === 'meetings:management');
    const canDelete = userPermissions.some(p => p.permission_code === 'meetings:delete' || p.permission_code === 'meetings:management');
    const canApprove = userPermissions.some(p => p.permission_code === 'meetings:approve' || p.permission_code === 'meetings:management');

    // --- VERİ ÇEKME FONKSİYONU ---
    const fetchData = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            // 1. Toplantılar
            try {
                const meetingsRes = await axiosInstance.get('/meetings');
                if (meetingsRes.data.success) {
                    setMeetings(meetingsRes.data.data);
                }
            } catch (err) { console.error("Toplantı listesi hatası:", err); }

            // 2. Odalar
            try {
                const roomsRes = await axiosInstance.get('/rooms');
                if (roomsRes.data.success) setRooms(roomsRes.data.data);
            } catch (err) { console.error("Oda listesi hatası:", err); }

            // 3. Departmanlar
            try {
                const deptsRes = await axiosInstance.get('/departments');
                if (deptsRes.data.success) setDepartments(deptsRes.data.data);
            } catch (err) { console.warn("Departmanlar çekilemedi."); }

            // 4. Projeler
            try {
                const projsRes = await axiosInstance.get('/projects');
                if (projsRes.data.success) setProjects(projsRes.data.data);
            } catch (err) { console.warn("Projeler çekilemedi."); }

        } catch (error) {
            console.error('Genel veri yükleme hatası:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HELPER FONKSİYONLAR ---
    const extractTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toTimeString().substring(0, 5);
    };

    const extractDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // --- MODAL İŞLEMLERİ ---
    const handleOpenModal = (meeting = null) => {
        if (meeting) {
            setEditingMeeting(meeting);
            setFormData({
                room_id: meeting.companyroomid || meeting.room_id || meeting.company_id,
                title: meeting.meetingsubject || meeting.title,
                description: meeting.description || '',
                meeting_date: extractDate(meeting.meetingstartdate || meeting.start_time),
                start_time: extractTime(meeting.meetingstartdate || meeting.start_time),
                end_time: extractTime(meeting.meetingenddate || meeting.end_time),
                participants: meeting.participants || '',
                department_id: meeting.meetingdepartmentid || '',
                project_id: meeting.relatedprojectid || ''
            });
        } else {
            setEditingMeeting(null);
            setFormData({
                room_id: '',
                title: '',
                description: '',
                meeting_date: new Date().toISOString().split('T')[0],
                start_time: '',
                end_time: '',
                participants: '',
                department_id: '',
                project_id: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMeeting(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- KAYIT / GÜNCELLEME ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.start_time >= formData.end_time) {
            alert("Bitiş saati, başlangıç saatinden ileri olmalıdır.");
            return;
        }

        const payload = {
            companyroomid: formData.room_id,
            room_id: formData.room_id,
            title: formData.title,
            description: formData.description,
            meetingstartdate: formData.meeting_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            participants: formData.participants,
            department_id: formData.department_id || null,
            project_id: formData.project_id || null
        };

        try {
            if (editingMeeting) {
                const mId = editingMeeting.meetingid || editingMeeting.id;
                const response = await axiosInstance.put(`/meetings/${mId}`, payload);

                if (response.data.success) {
                    alert('Güncelleme başarılı!');
                    handleCloseModal();
                    await fetchData();
                }
            } else {
                const response = await axiosInstance.post('/meetings', payload);

                if (response.data.success) {
                    alert('Toplantı oluşturuldu!');
                    handleCloseModal();
                    await fetchData();
                }
            }
        } catch (error) {
            console.error('İşlem hatası:', error);
            alert(error.response?.data?.message || 'İşlem başarısız oldu.');
        }
    };

    // --- SİLME ---
    const handleDelete = async (id) => {
        if(!window.confirm("Bu toplantıyı silmek istediğinize emin misiniz?")) return;
        try {
            await axiosInstance.delete(`/meetings/${id}`);
            alert('Toplantı silindi!');
            await fetchData();
        } catch(e){
            alert("Silinemedi!");
        }
    };

    // --- DURUM GÜNCELLEME (CONFIRM İLE) ---
    const handleStatusUpdate = async (id, status) => {
        const confirmMessage = status === 'approved'
            ? 'Bu toplantıyı onaylamak istediğinize emin misiniz?'
            : 'Bu toplantıyı iptal etmek istediğinize emin misiniz?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await axiosInstance.patch(`/meetings/${id}/status`, {status});

            const successMessage = status === 'approved'
                ? 'Toplantı onaylandı!'
                : 'Toplantı iptal edildi!';
            alert(successMessage);

            await fetchData();
        } catch(e) {
            alert("Durum güncellenemedi!");
        }
    };

    if (loading && !refreshing && meetings.length === 0) return <div className="content-card"><p>Yükleniyor...</p></div>;

    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Toplantı Yönetimi</h2>
                    <p className="page-subtitle">Toplantıları planlayın ve yönetin.</p>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <button
                        className="action-btn"
                        style={{backgroundColor: '#6c757d', minWidth:'40px', padding:'0 10px'}}
                        onClick={() => fetchData(true)}
                        title="Listeyi Yenile"
                    >
                        <RefreshCw size={20} className={refreshing ? "spin-anim" : ""} />
                    </button>

                    {canCreate && (
                        <button className="action-btn" onClick={() => handleOpenModal()}>
                            <Plus size={20} /> Yeni Toplantı
                        </button>
                    )}
                </div>
            </div>

            {meetings.length === 0 ? (
                <div className="empty-state">
                    <Calendar size={48} color="#666" />
                    <p>Kayıtlı toplantı bulunamadı.</p>
                    <button className="ghost-btn" onClick={() => fetchData(true)}>Tekrar Dene</button>
                </div>
            ) : (
                <div className="meetings-list">
                    {meetings.map(meeting => {
                        const mId = meeting.meetingid || meeting.id;
                        const mSubject = meeting.meetingsubject || meeting.title || 'Başlıksız';
                        const mDate = meeting.meetingstartdate || meeting.start_time;
                        const mEnd = meeting.meetingenddate || meeting.end_time;

                        const dateStr = new Date(mDate).toLocaleDateString('tr-TR');
                        const timeStr = `${extractTime(mDate)} - ${extractTime(mEnd)}`;
                        const roomName = meeting.companyroomname || meeting.room_name || 'Oda ?';

                        return (
                            <div key={mId} className="meeting-card">
                                <div className="meeting-header">
                                    <div className="meeting-title-section">
                                        <h3>{mSubject}</h3>
                                        <span className={`status-badge ${meeting.status || 'pending'}`}>
                                            {meeting.status === 'approved' ? 'Onaylı' :
                                                meeting.status === 'cancelled' ? 'İptal' : 'Bekliyor'}
                                        </span>
                                    </div>
                                    <div className="meeting-actions">
                                        {canApprove && (meeting.status === 'pending' || !meeting.status) && (
                                            <>
                                                <button className="icon-btn success" onClick={() => handleStatusUpdate(mId, 'approved')} title="Onayla">
                                                    <CheckCircle size={16}/>
                                                </button>
                                                <button className="icon-btn danger" onClick={() => handleStatusUpdate(mId, 'cancelled')} title="İptal Et">
                                                    <XCircle size={16}/>
                                                </button>
                                            </>
                                        )}
                                        {canEdit && (
                                            <button className="icon-btn" onClick={() => handleOpenModal(meeting)}>
                                                <Edit2 size={16}/>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button className="icon-btn delete" onClick={() => handleDelete(mId)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="meeting-info">
                                    <div className="info-row"><MapPin size={16} /><span>{roomName}</span></div>
                                    <div className="info-row"><Calendar size={16} /><span>{dateStr}</span></div>
                                    <div className="info-row"><Clock size={16} /><span>{timeStr}</span></div>
                                </div>
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
                            <h3>{editingMeeting ? 'Toplantı Düzenle' : 'Yeni Toplantı'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Konu *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Oda *</label>
                                <select name="room_id" value={formData.room_id} onChange={handleInputChange} required>
                                    <option value="">Seçiniz...</option>
                                    {rooms.map(r => (
                                        <option key={r.companyroomid || r.id} value={r.companyroomid || r.id}>
                                            {r.companyroomname || r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tarih *</label>
                                <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleInputChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlangıç *</label>
                                    <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Bitiş *</label>
                                    <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><Briefcase size={14}/> İlgili Departman</label>
                                    <select name="department_id" value={formData.department_id} onChange={handleInputChange}>
                                        <option value="">(Opsiyonel) Seçiniz...</option>
                                        {departments.map(d => (
                                            <option key={d.departmentid || d.id} value={d.departmentid || d.id}>
                                                {d.departmentname || d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label><Building size={14}/> İlgili Proje</label>
                                    <select name="project_id" value={formData.project_id} onChange={handleInputChange}>
                                        <option value="">(Opsiyonel) Seçiniz...</option>
                                        {projects.map(p => (
                                            <option key={p.projectid || p.id} value={p.projectid || p.id}>
                                                {p.projectname || p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Katılımcılar</label>
                                <input type="text" name="participants" value={formData.participants} onChange={handleInputChange} placeholder="Örn: Ahmet, Ayşe, Mehmet" />
                            </div>
                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={handleCloseModal}>İptal</button>
                                <button type="submit" className="action-btn">{editingMeeting ? 'Güncelle' : 'Planla'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingManagement;