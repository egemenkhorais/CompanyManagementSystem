const { pool } = require('../config/database');

const getAllRooms = async (companyId) => {
    // Görseldeki tablo yapısına göre sorgu güncellendi.
    // 'roomid' sütunu Şirket ID'si olduğu için WHERE koşulu buna göre eklendi.
    const query = `
        SELECT
            companyroomid,
            roomid, -- Bu şirket ID'si
            companyroomname,
            companyroomtype,
            companyroomdepartment
        FROM companyrooms
        WHERE roomid = $1
        ORDER BY companyroomid ASC
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows;
};

const createRoom = async (roomData, companyId) => {
    // Frontend artık veritabanı isimlerini gönderiyor (önceki adımda güncellemiştik)
    const { companyroomname, companyroomtype, companyroomdepartment } = roomData;

    const query = `
        INSERT INTO companyrooms (roomid, companyroomname, companyroomtype, companyroomdepartment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    // $1 -> companyId (Tablodaki 'roomid' sütunu)
    const result = await pool.query(query, [companyId, companyroomname, companyroomtype, companyroomdepartment]);
    return result.rows[0];
};

const updateRoom = async (id, roomData) => {
    const { companyroomname, companyroomtype, companyroomdepartment } = roomData;

    // Tabloda PK: companyroomid
    const query = `
        UPDATE companyrooms
        SET companyroomname = $1, companyroomtype = $2, companyroomdepartment = $3
        WHERE companyroomid = $4
        RETURNING *
    `;
    const result = await pool.query(query, [companyroomname, companyroomtype, companyroomdepartment, id]);
    return result.rows[0];
};

const deleteRoom = async (id) => {
    // Tabloda PK: companyroomid
    await pool.query('DELETE FROM companyrooms WHERE companyroomid = $1', [id]);
    return true;
};

module.exports = {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom
};