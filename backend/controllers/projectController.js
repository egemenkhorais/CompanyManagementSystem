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

    /**
     * POST /api/projects/:projectId/team
     * Projeye takım üyeleri ekle
     */
    async addTeamMembers(req, res) {
        try {
            const { projectId } = req.params;
            const { userIds } = req.body;
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.addTeamMembers(projectId, userIds, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController AddTeamMembers Error:', error);
            res.status(500).json({
                success: false,
                message: 'Takım üyeleri eklenirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * PUT /api/projects/:projectId/team
     * Projeye ait takım üyelerini güncelle (ekle/çıkar)
     */
    async updateTeamMembers(req, res) {
        try {
            const { projectId } = req.params;
            const { userIds } = req.body;
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.updateTeamMembers(projectId, userIds, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController UpdateTeamMembers Error:', error);
            res.status(500).json({
                success: false,
                message: 'Takım üyeleri güncellenirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/projects/:projectId/team
     * Projeye ait takım üyelerini getir
     */
    async getTeamMembers(req, res) {
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

            const result = await projectService.getTeamMembers(projectId, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController GetTeamMembers Error:', error);
            res.status(500).json({
                success: false,
                message: 'Takım üyeleri getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * POST /api/projects/:projectId/tasks
     * Projeye task oluştur
     */
    async createTask(req, res) {
        try {
            const { projectId } = req.params;
            const taskData = req.body;
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.createTask(projectId, taskData, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);

        } catch (error) {
            console.error('ProjectController CreateTask Error:', error);
            res.status(500).json({
                success: false,
                message: 'Task oluşturulurken hata oluştu: ' + error.message
            });
        }
    }
/**
     * GET /api/projects
     * Toplantı modalı vb. için basit proje listesi (Dropdown)
     */
    async getAllProjects(req, res) {
        try {
            // Service katmanına eklediğin fonksiyonu çağırıyoruz
            const projects = await projectService.getProjectsForDropdown();

            res.status(200).json({
                success: true,
                data: projects
            });

        } catch (error) {
            console.error('ProjectController GetAllProjects Error:', error);
            res.status(500).json({
                success: false,
                message: 'Projeler listelenirken hata oluştu: ' + error.message
            });
        }
    }
    /**
     * GET /api/projects/:projectId/tasks
     * Projeye ait task'leri getir
     */
    async getTasks(req, res) {
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

            const result = await projectService.getTasks(projectId, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController GetTasks Error:', error);
            res.status(500).json({
                success: false,
                message: 'Task\'ler getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * PUT /api/projects/:projectId/tasks/:taskId
     * Task güncelle
     */
    async updateTask(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const taskData = req.body;
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.updateTask(projectId, taskId, taskData, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController UpdateTask Error:', error);
            res.status(500).json({
                success: false,
                message: 'Task güncellenirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * DELETE /api/projects/:projectId/tasks/:taskId
     * Task sil
     */
    async deleteTask(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const userId = req.user?.id;
            const userRoleId = req.user?.roleid;

            if (!userId || !userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await projectService.deleteTask(projectId, taskId, userId, userRoleId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('ProjectController DeleteTask Error:', error);
            res.status(500).json({
                success: false,
                message: 'Task silinirken hata oluştu: ' + error.message
            });
        }
    }
}

module.exports = new ProjectController();

