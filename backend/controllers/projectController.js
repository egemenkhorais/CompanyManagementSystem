const projectService = require('../services/projectService');

class ProjectController {
    /**
     * POST /api/projects
     * Yeni proje oluştur
     * Sadece admin kullanıcılar proje oluşturabilir
     */
    async createProject(req, res) {
        try {
            const projectData = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.createProject(projectData, userId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);

        } catch (error) {
            console.error('ProjectController Create Error:', error);
            res.status(500).json({
                success: false,
                message: 'Proje oluşturulurken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/projects/active
     * Aktif projeleri getir
     * Kullanıcının rolüne göre filtreleme yapılır
     */
    async getActiveProjects(req, res) {
        try {
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.getActiveProjects(userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController GetActiveProjects Error:', error);
            res.status(500).json({
                success: false,
                message: 'Aktif projeler getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/projects/:projectId
     * ID'ye göre proje getir
     * Kullanıcının bu projeyi görme yetkisi kontrol edilir
     */
    async getProjectById(req, res) {
        try {
            const { projectId } = req.params;
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.getProjectById(projectId, userId, userRoleId);

            if (!result.success) {
                return res.status(404).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController GetProjectById Error:', error);
            res.status(500).json({
                success: false,
                message: 'Proje getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/projects/seniors
     * Senior rolündeki tüm kullanıcıları getir
     * Proje oluşturma pop-up'ında senior seçimi için kullanılır
     */
    async getSeniors(req, res) {
        try {
            const result = await projectService.getSeniors();

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController GetSeniors Error:', error);
            res.status(500).json({
                success: false,
                message: 'Senior kullanıcılar getirilirken hata oluştu: ' + error.message
            });
        }
    }
}

module.exports = new ProjectController();

