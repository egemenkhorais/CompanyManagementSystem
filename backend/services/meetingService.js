const { pool } = require('../config/database');

// Tüm toplantıları getir (Detaylı)
const getAllMeetings = async (companyId) => {
    const query = `
        SELECT
            m.meetingid as id,
            m.meetingsubject as title,
            m.meetingstartdate as start_time,
            m.meetingenddate as end_time,
            m.description,
            m.participants,
            m.status,
            m.meetingdepartmentid,  -- Edit modalı için
            m.relatedprojectid,     -- Edit modalı için 
            r.companyroomname,      -- Tabloda göstermek icin
            r.companyroomid,
            r.roomid as company_id
        FROM meetings m
                 JOIN companyrooms r ON m.companyroomid = r.companyroomid
        WHERE r.roomid = $1
        ORDER BY m.meetingstartdate DESC
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
};

// Yeni toplantı oluştur
const createMeeting = async (data) => {
    const {
        roomId, title, startDateTime, endDateTime,
        description, participants, departmentId, projectId
    } = data;

    // 1. ÇAKIŞMA KONTROLÜ
    // Aynı odada, zaman aralığı çakışan başka toplantı var mı?
    // (İptal edilenler hariç)
    const conflictQuery = `
        SELECT * FROM meetings
        WHERE companyroomid = $1
          AND (status != 'cancelled' OR status IS NULL)
          AND (meetingstartdate < $3 AND meetingenddate > $2)
    `;

    const conflictResult = await pool.query(conflictQuery, [roomId, startDateTime, endDateTime]);

    if (conflictResult.rows.length > 0) {
        throw new Error('CONFLICT_ERROR');
    }

    // 2. KAYIT EKLEME
    const insertQuery = `
        INSERT INTO meetings (
            companyroomid, meetingsubject, meetingstartdate, meetingenddate, 
            description, participants, meetingdepartmentid, relatedprojectid, 
            isempty, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;

    const values = [
        roomId,
        title,
        startDateTime,
        endDateTime,
        description || null,
        participants || null,
        departmentId || null,
        projectId || null,
        false,
        'pending' // Varsayılan durum
    ];

    const result = await pool.query(insertQuery, values);
    return result.rows[0];
};

// Toplantı güncelle
const updateMeeting = async (id, data) => {
    const {
        roomId, title, startDateTime, endDateTime,
        description, participants, departmentId, projectId
    } = data;

    // Not: Güncelleme yaparken de çakışma kontrolü yapılabilir ancak
    // kendi ID'sini hariç tutmak gerekir. Basitlik adına şu an atlıyoruz.

    const query = `
        UPDATE meetings
        SET 
            companyroomid = $1,
            meetingsubject = $2, 
            meetingstartdate = $3, 
            meetingenddate = $4,
            description = $5,
            participants = $6,
            meetingdepartmentid = $7,
            relatedprojectid = $8
        WHERE meetingid = $9
        RETURNING *
    `;

    const values = [
        roomId, title, startDateTime, endDateTime,
        description || null, participants || null,
        departmentId || null, projectId || null,
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// Toplantı sil
const deleteMeeting = async (id) => {
    const query = 'DELETE FROM meetings WHERE meetingid = $1';
    await pool.query(query, [id]);
    return true;
};

// Durum Güncelle (Onayla/İptal Et)
const updateStatus = async (id, status) => {
    const query = 'UPDATE meetings SET status = $1 WHERE meetingid = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
};

module.exports = {
    getAllMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateStatus
};