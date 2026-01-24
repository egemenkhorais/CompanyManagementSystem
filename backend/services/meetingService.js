const { pool } = require('../config/database');

// Yardımcı Fonksiyon: Kullanıcı ID'sinden Company ID bulma
const getUserCompanyId = async (userId) => {
    try {
        const query = 'SELECT companyid FROM userdetails WHERE userid = $1';
        const result = await pool.query(query, [userId]);
        if (result.rows.length > 0) return result.rows[0].companyid;
        return null;
    } catch (error) {
        console.error('Service - Şirket bilgisi hatası:', error);
        throw error;
    }
};

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
            m.meetingdepartmentid,
            m.relatedprojectid,
            r.companyroomname,
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

// Departmana göre toplantıları getir ve formatla
const getMeetingsByDepartment = async (departmentId) => {
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

    const result = await pool.query(query, [departmentId]);

    // Veri formatlama işlemleri Service katmanında yapılır
    return result.rows.map(meeting => {
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

        // Status mapping
        let statusMap = 'active';
        if (meeting.status === 'pending') statusMap = 'passive';
        if (meeting.status === 'cancelled') statusMap = 'cancelled';

        return {
            meetingid: meeting.meetingid,
            title: meeting.meetingsubject || 'Başlıksız Toplantı',
            description: meeting.description || '',
            status: statusMap,
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
};

const createMeeting = async (data) => {
    const {
        roomId, title, meetingstartdate, start_time, end_time,
        description, participants, departmentId, projectId
    } = data;

    // Tarih birleştirme işlemi Service'te yapılır
    const startDateTime = `${meetingstartdate}T${start_time}:00+03:00`;
    const endDateTime = `${meetingstartdate}T${end_time}:00+03:00`;

    // Çakışma Kontrolü
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
        'pending'
    ];

    const result = await pool.query(insertQuery, values);
    return result.rows[0];
};

const updateMeeting = async (id, data) => {
    const {
        roomId, title, meetingstartdate, start_time, end_time,
        description, participants, departmentId, projectId
    } = data;

    // Tarih birleştirme
    const startDateTime = `${meetingstartdate}T${start_time}:00+03:00`;
    const endDateTime = `${meetingstartdate}T${end_time}:00+03:00`;

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

const deleteMeeting = async (id) => {
    const query = 'DELETE FROM meetings WHERE meetingid = $1';
    await pool.query(query, [id]);
    return true;
};

const updateStatus = async (id, status) => {
    const query = 'UPDATE meetings SET status = $1 WHERE meetingid = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
};

module.exports = {
    getAllMeetings,
    getMeetingsByDepartment,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateStatus,
    getUserCompanyId
};