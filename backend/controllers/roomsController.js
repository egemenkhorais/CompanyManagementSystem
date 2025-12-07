const pool = require('../config/database');

// Odaları Getir
const getRooms = async (req, res) => {
    try {
        // user_id'den şirketi bulup sadece o şirketin odalarını getirmek istersen:
        // const userId = req.user.id;
        // ... user'ın şirketini bulma kodu ...

        // Şimdilik tüm odaları listeliyoruz (Senin tablo sütun isimlerine göre)
        const result = await pool.query(`
            SELECT
                id,
                companyroomname as name,      -- Frontend 'name' bekliyor
                companyroomtype as type,      -- Frontend 'type' bekliyor
                companyroomdepartment as features, -- Frontend 'features' bekliyor
                roomid as company_id          -- Senin 'roomid' sütunun
            FROM companyrooms
            ORDER BY id ASC
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Odalar getirilirken hata:', error.message);
        res.status(500).json({ success: false, message: 'Veritabanı hatası: ' + error.message });
    }
};

// Oda Oluştur
const createRoom = async (req, res) => {
    try {
        const { name, type, features } = req.body;

        // "roomid" sütunu şirketi belirtiyor demiştin.
        // Normalde bunu req.user'dan alırız. Test için 1 veriyoruz.
        const companyId = req.user ? req.user.companyId : 1;

        const result = await pool.query(
            `INSERT INTO companyrooms (roomid, companyroomname, companyroomtype, companyroomdepartment)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [companyId, name, type, features]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Oda oluşturulurken hata:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Oda Güncelle
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, features } = req.body;

        const result = await pool.query(
            `UPDATE companyrooms
             SET companyroomname = $1, companyroomtype = $2, companyroomdepartment = $3
             WHERE id = $4
             RETURNING *`,
            [name, type, features, id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Oda güncellenirken hata:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Oda Sil
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM companyrooms WHERE id = $1', [id]);
        res.json({ success: true, message: 'Oda silindi' });
    } catch (error) {
        console.error('Oda silinirken hata:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
};