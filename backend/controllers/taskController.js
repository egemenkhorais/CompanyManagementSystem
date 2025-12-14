const taskService = require('../services/taskService');

class TaskController {
    /**
     * GET /api/tasks/my-projects
     * Kullanıcının atandığı projeleri getir
     */
    async getMyProjects(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await taskService.getMyProjects(userId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('TaskController GetMyProjects Error:', error);
            res.status(500).json({
                success: false,
                message: 'Projeler getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * GET /api/tasks/my-tasks/:projectId
     * Kullanıcının bir projede kendisine atanmış task'lerini getir
     */
    async getMyTasks(req, res) {
        try {
            const { projectId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await taskService.getMyTasks(projectId, userId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('TaskController GetMyTasks Error:', error);
            res.status(500).json({
                success: false,
                message: 'Task\'ler getirilirken hata oluştu: ' + error.message
            });
        }
    }

    /**
     * PUT /api/tasks/my-tasks/:taskId
     * Kullanıcı kendi task'ini güncelle
     */
    async updateMyTask(req, res) {
        try {
            const { taskId } = req.params;
            const taskData = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const result = await taskService.updateMyTask(taskId, taskData, userId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('TaskController UpdateMyTask Error:', error);
            res.status(500).json({
                success: false,
                message: 'Task güncellenirken hata oluştu: ' + error.message
            });
        }
    }
}

module.exports = new TaskController();

