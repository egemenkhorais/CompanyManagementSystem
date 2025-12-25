const meetingService = require('../services/meetingService');
const { pool } = require('../config/database');

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

const getMeetingsByDepartment = async (req, res) => {
    const { departmentId } = req.params;

    console.log('📥 Gelen departmentId:', departmentId);

    if (!departmentId) {
        return res.status(400).json({ success: false, message: "Departman ID gerekli." });
    }

    try {
        console.log('🔍 SQL Query hazırlanıyor...');

        const query = `
            SELECT
                meetingid,
                meetingsubject,
                description,
                meetingstartdate,
                meetingenddate,
                status,
                meetingdepartmentid
            FROM meetings
            WHERE meetingdepartmentid = $1
            AND meetingstartdate IS NOT NULL
            ORDER BY meetingstartdate ASC
        `;

        console.log('⚡ Query çalıştırılıyor...');
        const result = await pool.query(query, [departmentId]);

        console.log(`✅ ${result.rows.length} adet toplantı bulundu`);
        console.log('📊 Ham veri:', result.rows);

        const formattedData = result.rows.map(meeting => {
            console.log('🔄 İşlenen toplantı:', meeting.meetingid);

            const startDate = new Date(meeting.meetingstartdate);

            let endTime = '-';
            if (meeting.meetingenddate) {
                const endDate = new Date(meeting.meetingenddate);
                endTime = endDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                });
            }

            return {
                meetingid: meeting.meetingid,
                title: meeting.meetingsubject || 'Başlıksız Toplantı',
                description: meeting.description || '',
                status: meeting.status === 'pending' ? 'passive' :meeting.status === 'cancelled' ? 'cancelled' : 'active',
                start_time: startDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                }),
                end_time: endTime,
                date: startDate.toISOString(),
                room_name: 'Toplantı Odası',
                department_id: meeting.meetingdepartmentid
            };
        });

        console.log('📤 Frontend\'e gönderilen data:', formattedData);

        res.json({ success: true, data: formattedData });

    } catch (error) {
        console.error("❌❌❌ HATA DETAYI ❌❌❌");
        console.error("Hata mesajı:", error.message);
        console.error("Hata kodu:", error.code);
        console.error("Stack trace:", error.stack);

        res.status(500).json({
            success: false,
            message: "Toplantılar yüklenirken sunucu hatası oluştu.",
            error: error.message,
            code: error.code
        });
    }
};

const createMeeting = async (req, res) => {
    try {
        const {
            room_id, title, meetingstartdate, start_time, end_time,
            description, participants, department_id, project_id
        } = req.body;

        const startDateTime = `${meetingstartdate} ${start_time}:00`;
        const endDateTime = `${meetingstartdate} ${end_time}:00`;

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

const updateMeetingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await meetingService.updateStatus(id, status);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Status güncelleme hatası:', error);
        res.status(500).json({ success: false, message: 'Durum güncellenemedi.' });
    }
};

module.exports = {
    getMeetings,
    getMeetingsByDepartment,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus
};