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
                VALUES ($1, $2, $3, $4) 
                RETURNING * 
            `, [expectations.trim(), departmentId, companyId, createdByUser]);//trim komutu baştaki ve sondaki boslukları siler

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

    /**
     * Tüm iş ilanlarını getir
     */
    async getAllJobPosts() {
        try {
            console.log('JobPostService.getAllJobPosts - Starting query');
            const result = await pool.query(`
                SELECT 
                    jobpostid,
                    expectations,
                    departmentid,
                    companyid,
                    createdbyuser
                FROM jobposts
                ORDER BY jobpostid DESC
            `);
            console.log('JobPostService.getAllJobPosts - Query successful, found', result.rows.length, 'rows');

            return {
                success: true,
                jobPosts: result.rows || []
            };

        } catch (error) {
            console.error('JobPostService GetAllJobPosts Error:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                detail: error.detail
            });
            throw new Error('İş ilanları getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * ID'ye göre iş ilanı getir
     */
    async getJobPostById(jobPostId) {
        try {
            const result = await pool.query(`
                SELECT 
                    jobpostid,
                    expectations,
                    departmentid,
                    companyid,
                    createdbyuser
                FROM jobposts
                WHERE jobpostid = $1
            `, [jobPostId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'İş ilanı bulunamadı.'
                };
            }

            return {
                success: true,
                jobPost: result.rows[0]
            };

        } catch (error) {
            console.error('JobPostService GetJobPostById Error:', error);
            throw new Error('İş ilanı getirilirken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new JobPostService();
