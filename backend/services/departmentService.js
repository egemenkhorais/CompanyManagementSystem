const { pool } = require('../config/database');

class DepartmentService {
    /**
     * Tüm departmanları getir
     */
    async getAllDepartments() {
        try {
            // Tüm departmanları ID'ye göre sıralı getir
            const result = await pool.query(`
                SELECT * 
                FROM departments 
                ORDER BY departmentid ASC
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
}

module.exports = new DepartmentService();