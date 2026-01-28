const meetingService = require('../services/meetingService');

// Helper: Kullanıcı nesnesinden ID'yi çözümle
const resolveCompanyId = async (user) => {
    if (user && (user.roomid || user.companyId)) return user.roomid || user.companyId;

    // Eğer session'da yoksa DB'den sorgula (Service üzerinden)
    if (user && user.id) {
        return await meetingService.getUserCompanyId(user.id);
    }
    return null;
};

const getMeetings = async (req, res) => {
    try {
        const companyId = await resolveCompanyId(req.user);
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

    if (!departmentId) {
        return res.status(400).json({ success: false, message: "Departman ID gerekli." });
    }

    try {
        // Tüm lojik ve formatlama serviste yapıldı
        const formattedData = await meetingService.getMeetingsByDepartment(departmentId);
        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Hata Detayı:", error.message);
        res.status(500).json({
            success: false,
            message: "Toplantılar yüklenirken sunucu hatası oluştu.",
            error: error.message
        });
    }
};

const createMeeting = async (req, res) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📨 CONTROLLER - Gelen req.body:', JSON.stringify(req.body, null, 2));
        console.log('📨 CONTROLLER - req.body keys:', Object.keys(req.body));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // ✅ SORUN ÇÖZÜMÜ: Frontend camelCase gönderiyorsa, service snake_case bekleyebilir
        // Her iki formatı da destekleyelim
        const payload = {
            roomId: req.body.roomId || req.body.room_id,
            title: req.body.title || req.body.meetingsubject,
            description: req.body.description,
            meetingstartdate: req.body.meetingstartdate || req.body.meeting_date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            participants: req.body.participants,
            departmentId: req.body.departmentId || req.body.department_id,
            projectId: req.body.projectId || req.body.project_id
        };

        console.log('🔄 CONTROLLER - Normalize edilmiş payload:', JSON.stringify(payload, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const newMeeting = await meetingService.createMeeting(payload);

        console.log('✅ CONTROLLER - Oluşturulan meeting:', JSON.stringify(newMeeting, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        res.json({ success: true, data: newMeeting });
    } catch (error) {
        if (error.message === 'CONFLICT_ERROR') {
            return res.status(400).json({ success: false, message: 'Bu tarih ve saat aralığında oda dolu!' });
        }
        console.error('❌ CONTROLLER - Toplantı oluşturma hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMeeting = async (req, res) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 CONTROLLER - Update için gelen req.body:', JSON.stringify(req.body, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const { id } = req.params;

        // ✅ Update için de normalize edelim
        const payload = {
            roomId: req.body.roomId || req.body.room_id,
            title: req.body.title || req.body.meetingsubject,
            description: req.body.description,
            meetingstartdate: req.body.meetingstartdate || req.body.meeting_date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            participants: req.body.participants,
            departmentId: req.body.departmentId || req.body.department_id,
            projectId: req.body.projectId || req.body.project_id
        };

        const updatedMeeting = await meetingService.updateMeeting(id, payload);

        if (!updatedMeeting) {
            return res.status(404).json({ success: false, message: 'Toplantı bulunamadı' });
        }
        res.json({ success: true, data: updatedMeeting });
    } catch (error) {
        console.error('❌ CONTROLLER - Güncelleme hatası:', error.message);
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