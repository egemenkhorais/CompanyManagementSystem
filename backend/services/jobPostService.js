const { pool } = require('../config/database');

class JobPostService {
    /**
     * Yeni iş ilanı oluştur
     */
    async createJobPost(jobPostData) {
        try {
            const { departmentId, expectations, companyId = null, createdByUser = null } = jobPostData;

            // Validasyon
            if (!departmentId || !expectations || !expectations.trim()) {
                return {
                    success: false,
                    message: 'Departman ve beklenti alanları zorunludur.'
                };
            }

            // Yeni iş ilanı ekle ve eklenen kaydı geri döndür
            const result = await pool.query(`
                INSERT INTO jobposts (expectations, departmentid, companyid, createdbyuser) 
                VALUES ('${expectations.trim()}', ${departmentId}, ${companyId}, ${createdByUser}) 
                RETURNING * 
            `);//trim komutu baştaki ve sondaki boslukları siler

            const jobPost = result.rows[0];

            return {
                success: true,
                message: 'İş ilanı başarıyla oluşturuldu.',
                jobPost: jobPost
            };

        } catch (error) {
            console.error('JobPostService Create Error:', error);
            throw new Error('İş ilanı oluşturulurken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new JobPostService();