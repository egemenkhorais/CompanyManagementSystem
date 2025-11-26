const jobPostService = require('../services/JobPostService');

class JobPostController {
    /**
     * POST /api/jobposts
     * Yeni iş ilanı oluştur
     */
    async createJobPost(req, res) {
        try {
            const { departmentId, expectations, companyId, createdByUser } = req.body;

            const result = await jobPostService.createJobPost({
                departmentId,
                expectations,
                companyId,
                createdByUser
            });

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);

        } catch (error) {
            console.error('JobPostController Create Error:', error);
            res.status(500).json({
                success: false,
                message: 'İş ilanı oluşturulurken hata oluştu: ' + error.message
            });
        }
    }
}

module.exports = new JobPostController();