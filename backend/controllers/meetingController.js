const { pool } = require('../config/database');

const getMeetings = async (req, res) => {
    try {
        // RESİMLERE GÖRE DÜZELTİLDİ:
        // meetings tablosu: meetingid, companyroomid, meetingdate, meetingsubject, isempty
        // companyrooms tablosu: companyroomid, companyroomname

        const result = await pool.query(`
            SELECT
                m.meetingid as id,
                m.meetingsubject as title,
                m.meetingdate as start_time, -- Veritabanında sadece tek tarih alanı var
                r.companyroomname as room_name,
                r.companyroomid as room_id,
                m.isempty
            FROM meetings m
                     JOIN companyrooms r ON m.companyroomid = r.companyroomid
            ORDER BY m.meetingdate DESC
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
        // Frontend'den gelen veriler (Değişken isimleri React tarafıyla aynı kalabilir)
        const { room_id, title, meeting_date, start_time } = req.body;

        // NOT: Veritabanı resminde 'description', 'end_time', 'participants', 'user_id' sütunları GÖRÜNMÜYOR.
        // Bu yüzden sadece resimde olan sütunlara insert yapıyoruz.

        // Tarih ve saati birleştirip timestamp formatına çeviriyoruz
        const fullDateTime = `${meeting_date} ${start_time}:00`;

        /* Çakışma Kontrolü (Conflict Check)
           Not: End_time olmadığı için sadece o saatte başka kayıt var mı diye tam eşleşme bakabiliriz
           veya veritabanına end_time sütunu eklemelisin. Şimdilik basit kontrol:
        */
        const conflict = await pool.query(`
            SELECT * FROM meetings
            WHERE companyroomid = $1
              AND meetingdate = $2
        `, [room_id, fullDateTime]);

        if (conflict.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Bu tarih ve saatte oda dolu!' });
        }

        // INSERT işlemi (Sütun isimleri resimdeki gibi güncellendi)
        const result = await pool.query(
            `INSERT INTO meetings (companyroomid, meetingsubject, meetingdate, isempty)
             VALUES ($1, $2, $3, $4)
                 RETURNING *`,
            [room_id, title, fullDateTime, false]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Toplantı oluşturma hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toplantı Sil
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        // id -> meetingid olarak güncellendi
        await pool.query('DELETE FROM meetings WHERE meetingid = $1', [id]);
        res.json({ success: true, message: 'Silindi' });
    } catch (error) {
        console.error('Silme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toplantı Güncelle (Basitleştirilmiş)
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params; // Bu meetingid olacak
        const { title, meeting_date, start_time, room_id } = req.body;

        const fullDateTime = `${meeting_date} ${start_time}:00`;

        const result = await pool.query(
            `UPDATE meetings
             SET meetingsubject=$1, meetingdate=$2, companyroomid=$3
             WHERE meetingid=$4 RETURNING *`,
            [title, fullDateTime, room_id, id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Güncelleme hatası:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
};