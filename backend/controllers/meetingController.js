const meetingService = require('../services/meetingService');
const { pool } = require('../config/database'); // Pool'u import etmeyi unutmayın

// YARDIMCI FONKSİYON: Kullanıcının gerçek Şirket ID'sini bul
const getCompanyIdFromUser = async (user) => {
    // 1. Token'da varsa kullan
    if (user && (user.roomid || user.companyId)) {
        return user.roomid || user.companyId;
    }
    // 2. Yoksa DB'den 'userdetails' tablosundan çek
    if (user && user.id) {
        try {
            const query = 'SELECT companyid FROM userdetails WHERE userid = $1';
            const result = await pool.query(query, [user.id]);
            if (result.rows.length > 0) {
                return result.rows[0].companyid;
            }
        } catch (error) {
            console.error('Şirket bilgisi çekilirken hata:', error);
            return null;
        }
    }
    // 3. Hiçbiri yoksa varsayılan (Sadece dev ortamı için 1, prod için null dönmeli)
    return 1;
};

const getMeetings = async (req, res) => {
    try {
        // HATA ÇÖZÜMÜ: Şirket ID'sini veritabanından doğrulayarak al
        const companyId = await getCompanyIdFromUser(req.user);

        // Debug için konsola yazdıralım (Server terminalinde görünür)
        console.log(`[getMeetings] User: ${req.user?.username}, CompanyID: ${companyId}`);

        const meetings = await meetingService.getAllMeetings(companyId);
        res.json({ success: true, data: meetings });
    } catch (error) {
        console.error('Hata:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createMeeting = async (req, res) => {
    try {
        const { room_id, title, meetingstartdate, start_time, end_time } = req.body;

        // Tarih ve Saati Birleştir
        const startDateTime = `${meetingstartdate} ${start_time}:00`;
        let endDateTime = null;
        if (end_time) {
            endDateTime = `${meetingstartdate} ${end_time}:00`;
        }

        const newMeeting = await meetingService.createMeeting(room_id, title, startDateTime, endDateTime);
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
        const { title, meetingstartdate, start_time, end_time, room_id } = req.body;

        const startDateTime = `${meetingstartdate} ${start_time}:00`;
        let endDateTime = null;
        if (end_time) {
            endDateTime = `${meetingstartdate} ${end_time}:00`;
        }

        const updatedMeeting = await meetingService.updateMeeting(id, title, startDateTime, endDateTime, room_id);

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

module.exports = {
    getMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
};