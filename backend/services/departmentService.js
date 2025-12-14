const { pool } = require('../config/database');

class DepartmentService {
    /**
     * Tüm departmanları getir (toplam pozisyon ve çalışan sayısı ile)
     */
    async getAllDepartments() {
        try {
            const result = await pool.query(`
                SELECT
                    d.departmentid,
                    d.departmentname,
                    d.is_active,
                    COUNT(DISTINCT p.id) as total_positions,
                    COUNT(DISTINCT ud.userid) as total_employees
                FROM departments d
                         LEFT JOIN positions p ON d.departmentid = p.departmentid AND p.is_active = true
                         LEFT JOIN userdetails ud ON d.departmentid = ud.departmentid
                WHERE d.is_active = true
                GROUP BY d.departmentid, d.departmentname, d.is_active
                ORDER BY d.departmentname ASC
            `);

            return {
                success: true,
                data: result.rows
            };

        } catch (error) {
            console.error('DepartmentService GetAll Error:', error);
            throw new Error('Departman listesi alınamadı: ' + error.message);
        }
    }

    /**
     * Tek bir departmanı getir
     */
    async getDepartmentById(departmentId) {
        try {
            const result = await pool.query(`
                SELECT * FROM departments
                WHERE departmentid = $1 AND is_active = true
            `, [departmentId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Departman bulunamadı'
                };
            }

            return {
                success: true,
                data: result.rows[0]
            };

        } catch (error) {
            console.error('DepartmentService GetById Error:', error);
            throw error;
        }
    }

    /**
     * Departman oluştur
     */
    async createDepartment(departmentData) {
        try {
            const { departmentname } = departmentData;

            if (!departmentname || !departmentname.trim()) {
                return {
                    success: false,
                    message: 'Departman adı zorunludur'
                };
            }

            const result = await pool.query(`
                INSERT INTO departments (departmentname, is_active)
                VALUES ($1, true)
                    RETURNING *
            `, [departmentname.trim()]);

            return {
                success: true,
                message: 'Departman başarıyla oluşturuldu',
                data: result.rows[0]
            };

        } catch (error) {
            console.error('DepartmentService Create Error:', error);
            throw error;
        }
    }

    /**
     * Departman güncelle
     */
    async updateDepartment(departmentId, departmentData) {
        try {
            const { departmentname } = departmentData;

            if (!departmentname || !departmentname.trim()) {
                return {
                    success: false,
                    message: 'Departman adı zorunludur'
                };
            }

            const result = await pool.query(`
                UPDATE departments
                SET departmentname = $1
                WHERE departmentid = $2 AND is_active = true
                    RETURNING *
            `, [departmentname.trim(), departmentId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Departman bulunamadı'
                };
            }

            return {
                success: true,
                message: 'Departman başarıyla güncellendi',
                data: result.rows[0]
            };

        } catch (error) {
            console.error('DepartmentService Update Error:', error);
            throw error;
        }
    }

    /**
     * Departman sil (SOFT DELETE - is_active = false)
     */
    async deleteDepartment(departmentId) {
        try {
            // Kontrol 1: Bu departmanda kullanıcı var mı?
            const userCheck = await pool.query(`
                SELECT COUNT(*) as user_count
                FROM userdetails
                WHERE departmentid = $1
            `, [departmentId]);

            const userCount = parseInt(userCheck.rows[0].user_count);

            if (userCount > 0) {
                return {
                    success: false,
                    canDelete: false,
                    message: `Bu departmanda ${userCount} kullanıcı bulunuyor. Silmek için önce kullanıcıları başka departmana taşımalısınız.`,
                    userCount: userCount
                };
            }

            // Kontrol 2: Bu departmanda pozisyon var mı?
            const positionCheck = await pool.query(`
                SELECT COUNT(*) as position_count
                FROM positions
                WHERE departmentid = $1 AND is_active = true
            `, [departmentId]);

            const positionCount = parseInt(positionCheck.rows[0].position_count);

            if (positionCount > 0) {
                return {
                    success: false,
                    canDelete: false,
                    message: `Bu departmanda ${positionCount} aktif pozisyon bulunuyor. Silmek için önce pozisyonları kaldırmalısınız.`,
                    positionCount: positionCount
                };
            }

            // SOFT DELETE - is_active = false yap
            const result = await pool.query(`
                UPDATE departments
                SET is_active = false
                WHERE departmentid = $1
                    RETURNING *
            `, [departmentId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    canDelete: false,
                    message: 'Departman bulunamadı'
                };
            }

            return {
                success: true,
                canDelete: true,
                message: 'Departman başarıyla kaldırıldı',
                data: result.rows[0]
            };

        } catch (error) {
            console.error('DepartmentService Delete Error:', error);
            throw error;
        }
    }

    /**
     * Departmanın pozisyonlarını getir (DETAYLI)
     */
    async getDepartmentPositions(departmentId) {
        try {
            const result = await pool.query(`
                SELECT
                    p.id,
                    p.position_name_id,
                    pn.position_name,
                    pn.level,
                    pn.description,
                    p.quota,
                    p.is_active,
                    COUNT(ud.userid) as current_count
                FROM positions p
                         JOIN positionnames pn ON p.position_name_id = pn.id
                         LEFT JOIN userdetails ud ON ud.positionnames_id = pn.id
                    AND ud.departmentid = p.departmentid
                WHERE p.departmentid = $1 AND p.is_active = true
                GROUP BY p.id, p.position_name_id, pn.position_name, pn.level,
                         pn.description, p.quota, p.is_active
                ORDER BY pn.level, pn.position_name
            `, [departmentId]);

            return {
                success: true,
                data: result.rows
            };

        } catch (error) {
            console.error('DepartmentService GetPositions Error:', error);
            throw error;
        }
    }
}

module.exports = new DepartmentService();