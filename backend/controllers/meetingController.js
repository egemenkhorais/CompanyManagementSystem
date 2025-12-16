const meetingService = require('../services/meetingService');
const { pool } = require('../config/database');

// --- YARDIMCI: Şirket ID Bulma ---
const getCompanyIdFromUser = async (user) => {
    if (user && (user.roomid || user.companyId)) return user.roomid || user.companyId;

    if (user && user.id) {
        try {
            const query = 'SELECT companyid FROM userdetails WHERE userid = $1';
            const result = await pool.query(query, [user.id]);
            if (result.rows.length > 0) return result.rows[0].companyid;
        } catch (error) {
            console.error('Şirket bilgisi hatası:', error);
            return null;
        }
    }
    return null;
};

// --- CONTROLLER METODLARI ---

const getMeetings = async (req, res) => {
    try {
        const companyId = await getCompanyIdFromUser(req.user);
        if (!companyId) return res.status(400).json({ success: false, message: 'Şirket bilgisi bulunamadı.' });

        const meetings = await meetingService.getAllMeetings(companyId);
        res.json({ success: true, data: meetings });
    } catch (error) {
        console.error('GetMeetings Hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createMeeting = async (req, res) => {
    try {
        // Frontend'den gelen tüm yeni alanları alıyoruz
        const {
            room_id, title, meetingstartdate, start_time, end_time,
            description, participants, department_id, project_id
        } = req.body;

        // Tarih ve Saati PostgreSQL TIMESTAMP formatına çevir (YYYY-MM-DD HH:mm:00)
        const startDateTime = `${meetingstartdate} ${start_time}:00`;
        const endDateTime = `${meetingstartdate} ${end_time}:00`;

        // Tüm veriyi bir obje olarak servise gönderiyoruz
        const newMeeting = await meetingService.createMeeting({
            roomId: room_id,
            title,
            startDateTime,
            endDateTime,
            description,
            participants,
            departmentId: department_id,
            projectId: project_id
        });

        res.json({ success: true, data: newMeeting });
    } catch (error) {
        if (error.message === 'CONFLICT_ERROR') {
            return res.status(400).json({ success: false, message: 'Bu tarih ve saat aralığında oda dolu!' });
        }
        console.error('Toplantı oluşturma hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, meetingstartdate, start_time, end_time, room_id,
            description, participants, department_id, project_id
        } = req.body;

        const startDateTime = `${meetingstartdate} ${start_time}:00`;
        const endDateTime = `${meetingstartdate} ${end_time}:00`;

        const updatedMeeting = await meetingService.updateMeeting(id, {
            roomId: room_id,
            title,
            startDateTime,
            endDateTime,
            description,
            participants,
            departmentId: department_id,
            projectId: project_id
        });

        if (!updatedMeeting) {
            return res.status(404).json({ success: false, message: 'Toplantı bulunamadı' });
        }
        res.json({ success: true, data: updatedMeeting });
    } catch (error) {
        console.error('Güncelleme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        await meetingService.deleteMeeting(id);
        res.json({ success: true, message: 'Silindi' });
    } catch (error) {
        console.error('Silme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Yeni: Durum Güncelleme (Onayla/Reddet)
const updateMeetingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' veya 'cancelled'

        const result = await meetingService.updateStatus(id, status);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Status güncelleme hatası:', error);
        res.status(500).json({ success: false, message: 'Durum güncellenemedi.' });
    }
};

module.exports = {
    getMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus // Yeni export
};