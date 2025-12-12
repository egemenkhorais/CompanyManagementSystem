const jobPostService = require('../services/jobPostService');

class JobPostController {
    /**
     * POST /api/jobposts
     * Yeni iş ilanı oluştur
     */
    async createJobPost(req, res) {
        try {
            const { departmentId, expectations, companyId, jobPostName } = req.body;

            // createdByUser her zaman oturum açmış kullanıcının kimliği olmalı
            const createdByUser = req.user?.id;

            const result = await jobPostService.createJobPost({
                departmentId,
                expectations,
                companyId,
                createdByUser,
                jobPostName
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

    /**
     * GET /api/jobposts
     * Tüm iş ilanlarını getir
     */
    async getAllJobPosts(req, res) {
        try {
            console.log('GET /api/jobposts - Request received');
            const result = await jobPostService.getAllJobPosts();
            console.log('JobPostService result:', result);

            if (!result.success) {
                console.error('JobPostService returned success: false');
                return res.status(400).json(result);
            }

            console.log('Sending response with', result.jobPosts?.length || 0, 'job posts');
            res.status(200).json(result);

        } catch (error) {
            console.error('JobPostController GetAllJobPosts Error:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'İş ilanları getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/jobposts/:jobPostId
     * ID'ye göre iş ilanı getir
     */
    async getJobPostById(req, res) {
        try {
            const { jobPostId } = req.params;

            const result = await jobPostService.getJobPostById(jobPostId);

            if (!result.success) {
                return res.status(404).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('JobPostController GetJobPostById Error:', error);
            res.status(500).json({
                success: false,
                message: 'İş ilanı getirilirken hata oluştu: ' + error.message
            });
        }
    }
}

module.exports = new JobPostController();