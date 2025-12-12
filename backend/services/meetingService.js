const { pool } = require('../config/database');

// Tüm toplantıları getir (Şirket bazlı)
const getAllMeetings = async (companyId) => {
    const query = `
        SELECT
            m.meetingid as id,
            m.meetingsubject as title,
            m.meetingstartdate as start_time,
            m.meetingenddate as end_time,
            r.companyroomname as room_name,
            r.companyroomid as room_id,
            m.isempty
        FROM meetings m
        JOIN companyrooms r ON m.companyroomid = r.companyroomid
        WHERE r.roomid = $1
        ORDER BY m.meetingstartdate DESC
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
};

// Yeni toplantı oluştur
const createMeeting = async (roomId, title, startDate, endDate) => {
    // 1. ÇAKIŞMA KONTROLÜ
    const conflictQuery = `
        SELECT * FROM meetings
        WHERE companyroomid = $1
          AND (meetingstartdate < $3 AND meetingenddate > $2)
    `;

    const conflictResult = await pool.query(conflictQuery, [roomId, startDate, endDate]);

    if (conflictResult.rows.length > 0) {
        throw new Error('CONFLICT_ERROR');
    }

    // 2. KAYIT EKLEME
    const insertQuery = `
        INSERT INTO meetings (companyroomid, meetingsubject, meetingstartdate, meetingenddate, isempty)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const result = await pool.query(insertQuery, [roomId, title, startDate, endDate, false]);
    return result.rows[0];
};

// Toplantı güncelle
const updateMeeting = async (id, title, startDate, endDate, roomId) => {
    const query = `
        UPDATE meetings
        SET meetingsubject=$1, meetingstartdate=$2, meetingenddate=$3, companyroomid=$4
        WHERE meetingid=$5
        RETURNING *
    `;
    const result = await pool.query(query, [title, startDate, endDate, roomId, id]);
    return result.rows[0];
};

// Toplantı sil
const deleteMeeting = async (id) => {
    const query = 'DELETE FROM meetings WHERE meetingid = $1';
    await pool.query(query, [id]);
    return true;
};

module.exports = {
    getAllMeetings, // HATA BURADAYDI: getMeetings değil, getAllMeetings olmalı
    createMeeting,
    updateMeeting,
    deleteMeeting
};