const { pool } = require('../config/database');

const getMeetings = async (req, res) => {
    try {
        // Artık pool.query çalışır
        const result = await pool.query(`
            SELECT
                m.id, m.title, m.description, m.start_time, m.end_time,
                m.participants, m.status,
                r.companyroomname as room_name,
                r.id as room_id,
                u.username as organizer
            FROM meetings m
            JOIN companyrooms r ON m.room_id = r.id
            LEFT JOIN users u ON m.user_id = u.id
            ORDER BY m.start_time DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Hata:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Yeni Toplantı Oluştur
const createMeeting = async (req, res) => {
    try {
        const { room_id, title, description, meeting_date, start_time, end_time, participants } = req.body;
        const userId = req.user.id;

        // Tarih birleştirme
        const startDateTime = `${meeting_date} ${start_time}:00`;
        const endDateTime = `${meeting_date} ${end_time}:00`;

        // Çakışma Kontrolü (Conflict Check)
        const conflict = await pool.query(`
            SELECT * FROM meetings
            WHERE room_id = $1
            AND status != 'cancelled'
            AND (
                (start_time < $3 AND end_time > $2)
            )
        `, [room_id, startDateTime, endDateTime]);

        if (conflict.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Bu saat aralığında oda dolu!' });
        }

        const result = await pool.query(
            `INSERT INTO meetings (room_id, user_id, title, description, start_time, end_time, participants, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
            [room_id, userId, title, description, startDateTime, endDateTime, participants]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Toplantı oluşturma hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toplantı Güncelle
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, meeting_date, start_time, end_time, participants, room_id } = req.body;

        const startDateTime = `${meeting_date} ${start_time}:00`;
        const endDateTime = `${meeting_date} ${end_time}:00`;

        const result = await pool.query(
            `UPDATE meetings
             SET title=$1, description=$2, start_time=$3, end_time=$4, participants=$5, room_id=$6
             WHERE id=$7 RETURNING *`,
            [title, description, startDateTime, endDateTime, participants, room_id, id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Güncelleme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toplantı Sil
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM meetings WHERE id = $1', [id]);
        res.json({ success: true, message: 'Silindi' });
    } catch (error) {
        console.error('Silme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Durum Güncelle
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            'UPDATE meetings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Durum güncelleme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateStatus
};