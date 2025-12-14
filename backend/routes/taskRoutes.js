const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
//Sadece token'ı olanlar erişebilir
const authMiddleware = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/checkPermission');

/**
 * GET /api/tasks/my-projects
 * Kullanıcının atandığı projeleri getir
 * project:task permission'ı gereklidir
 */
router.get('/my-projects', authMiddleware, checkPermission('project:task'), (req, res) => taskController.getMyProjects(req, res));

/**
 * GET /api/tasks/my-tasks/:projectId
 * Kullanıcının bir projede kendisine atanmış task'lerini getir
 * project:task permission'ı gereklidir
 */
router.get('/my-tasks/:projectId', authMiddleware, checkPermission('project:task'), (req, res) => taskController.getMyTasks(req, res));

/**
 * PUT /api/tasks/my-tasks/:taskId
 * Kullanıcı kendi task'ini güncelle
 * project:task permission'ı gereklidir
 */
router.put('/my-tasks/:taskId', authMiddleware, checkPermission('project:task'), (req, res) => taskController.updateMyTask(req, res));

module.exports = router;
