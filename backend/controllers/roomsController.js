const roomService = require('../services/roomService');
// Veritabanı sorgusu atacağımız için pool'u import etmemiz şart
const { pool } = require('../config/database');

// Yardımcı Fonksiyon: Kullanıcının Şirket ID'sini (roomid olarak geçiyor) bul
const getCompanyIdFromUser = async (user) => {
    // 1. Önce token'da (req.user içinde) hazır var mı diye bak
    if (user && (user.roomid || user.companyid)) {
        return user.roomid || user.companyid;
    }

    // 2. Yoksa veritabanından 'userdetails' tablosundan çek
    if (user && user.id) {
        try {
            const query = 'SELECT companyid FROM userdetails WHERE userid = $1';
            const result = await pool.query(query, [user.id]);

            if (result.rows.length > 0) {
                // Tabloda companyid olarak geçiyor ama biz bunu roomlogic'te roomid (şirket id) olarak kullanıyoruz
                return result.rows[0].companyid;
            }
        } catch (error) {
            console.error('Şirket bilgisi çekilirken hata:', error);
            return null;
        }
    }
    return null;
};

const getRooms = async (req, res) => {
    try {
        // Dinamik şirket ID bulma
        const companyId = await getCompanyIdFromUser(req.user);

        if (!companyId) {
            return res.status(400).json({ success: false, message: 'Kullanıcıya ait şirket bilgisi bulunamadı.' });
        }

        const rooms = await roomService.getAllRooms(companyId);
        res.json({ success: true, data: rooms });
    } catch (error) {
        console.error('Odalar çekilemedi:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createRoom = async (req, res) => {
    try {
        // HATA ÇÖZÜMÜ: Otomatik 1 yerine veritabanından gerçek ID'yi buluyoruz
        const companyId = await getCompanyIdFromUser(req.user);

        console.log("Oda Oluşturuluyor - Şirket ID:", companyId);

        if (!companyId) {
            return res.status(400).json({ success: false, message: 'Şirket (roomid) bilgisi bulunamadı, işlem yapılamaz.' });
        }

        const result = await roomService.createRoom(req.body, companyId);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error("Oda oluşturma hatası:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const result = await roomService.updateRoom(req.params.id, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        await roomService.deleteRoom(req.params.id);
        res.json({ success: true, message: 'Silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };