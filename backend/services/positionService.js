const { pool } = require('../config/database');

class PositionService {

    /**
     * Departmana pozisyon ekle (YENİ MANTIK - Manuel giriş)
     */
    async addPositionToDepartment(positionData) {
        const conn = await pool.connect();

        try {
            const { departmentid, position_name, level, description, quota } = positionData;

            if (!departmentid || !position_name || !level) {
                return {
                    success: false,
                    message: 'Departman, pozisyon adı ve seviye zorunludur'
                };
            }

            await conn.query('BEGIN');

            // 1. Önce positionnames tablosuna ekle (ID otomatik oluşur)
            const positionNameResult = await conn.query(`
                INSERT INTO positionnames (position_name, level, description, is_active)
                VALUES ($1, $2, $3, true)
                    RETURNING id
            `, [position_name.trim(), level.trim(), description?.trim() || null]);

            const positionNameId = positionNameResult.rows[0].id;

            // 2. Sonra positions tablosuna ekle (departman ile ilişkilendir)
            const positionResult = await conn.query(`
                INSERT INTO positions (departmentid, position_name_id, quota, is_active)
                VALUES ($1, $2, $3, true)
                    RETURNING *
            `, [departmentid, positionNameId, quota || 1]);

            await conn.query('COMMIT');

            return {
                success: true,
                message: 'Pozisyon başarıyla eklendi',
                data: positionResult.rows[0]
            };

        } catch (error) {
            await conn.query('ROLLBACK');
            console.error('PositionService Add Error:', error);

            // Detaylı hata mesajı
            if (error.code === '23505') { // Unique constraint violation
                return {
                    success: false,
                    message: 'Bu pozisyon adı zaten kullanılıyor'
                };
            }

            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * Position güncelle (İSİM, SEVİYE, AÇIKLAMA, QUOTA)
     */
    async updatePosition(positionId, positionData) {
        const conn = await pool.connect();

        try {
            const { position_name, level, description, quota } = positionData;

            if (!position_name || !level || !quota || quota < 1) {
                return {
                    success: false,
                    message: 'Tüm alanlar zorunludur ve quota en az 1 olmalıdır'
                };
            }

            await conn.query('BEGIN');

            // 1. position_name_id'yi al
            const posResult = await conn.query(`
                SELECT position_name_id FROM positions WHERE id = $1 AND is_active = true
            `, [positionId]);

            if (posResult.rows.length === 0) {
                await conn.query('ROLLBACK');
                return {
                    success: false,
                    message: 'Pozisyon bulunamadı'
                };
            }

            const positionNameId = posResult.rows[0].position_name_id;

            // 2. positionnames tablosunu güncelle
            await conn.query(`
                UPDATE positionnames
                SET position_name = $1, level = $2, description = $3, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
            `, [position_name.trim(), level.trim(), description?.trim() || null, positionNameId]);

            // 3. positions tablosunda quota'yı güncelle
            const updateResult = await conn.query(`
                UPDATE positions
                SET quota = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND is_active = true
                    RETURNING *
            `, [quota, positionId]);

            if (updateResult.rows.length === 0) {
                await conn.query('ROLLBACK');
                return {
                    success: false,
                    message: 'Pozisyon güncellenemedi'
                };
            }

            await conn.query('COMMIT');

            return {
                success: true,
                message: 'Pozisyon başarıyla güncellendi',
                data: updateResult.rows[0]
            };

        } catch (error) {
            await conn.query('ROLLBACK');
            console.error('PositionService Update Error:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * Position sil (soft delete)
     */
    async deletePosition(positionId) {
        const conn = await pool.connect();

        try {
            // Kontrol: Bu pozisyonda çalışan var mı?
            const userCheck = await conn.query(`
                SELECT COUNT(*) as user_count
                FROM userdetails ud
                         JOIN positions p ON ud.positionnames_id = p.position_name_id
                    AND ud.departmentid = p.departmentid
                WHERE p.id = $1
            `, [positionId]);

            const userCount = parseInt(userCheck.rows[0].user_count);

            if (userCount > 0) {
                return {
                    success: false,
                    canDelete: false,
                    message: `Bu pozisyonda ${userCount} kullanıcı bulunuyor. Silmek için önce kullanıcıları başka pozisyona taşımalısınız.`,
                    userCount: userCount
                };
            }

            await conn.query('BEGIN');

            // position_name_id'yi al
            const posResult = await conn.query(`
                SELECT position_name_id FROM positions WHERE id = $1
            `, [positionId]);

            if (posResult.rows.length === 0) {
                await conn.query('ROLLBACK');
                return {
                    success: false,
                    canDelete: false,
                    message: 'Pozisyon bulunamadı'
                };
            }

            const positionNameId = posResult.rows[0].position_name_id;

            // Soft delete - positions tablosu
            await conn.query(`
                UPDATE positions
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [positionId]);

            // Soft delete - positionnames tablosu
            await conn.query(`
                UPDATE positionnames
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [positionNameId]);

            await conn.query('COMMIT');

            return {
                success: true,
                canDelete: true,
                message: 'Pozisyon başarıyla kaldırıldı'
            };

        } catch (error) {
            await conn.query('ROLLBACK');
            console.error('PositionService Delete Error:', error);
            throw error;
        } finally {
            conn.release();
        }
    }
}

module.exports = new PositionService();