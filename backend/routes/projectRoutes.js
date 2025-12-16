const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
//Sadece token'ı olanlar erişebilir
const authMiddleware = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/checkPermission');

/**
 * GET /api/projects/seniors
 * Senior rolündeki tüm kullanıcıları getir
 */
router.get('/seniors', authMiddleware, (req, res) => projectController.getSeniors(req, res));

/**
 * GET /api/projects/active
 * Aktif projeleri getir (Detaylı liste)
 */
router.get('/active', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getActiveProjects(req, res));

/** * --- YENİ EKLENEN KISIM ---
 * GET /api/projects
 * Toplantı modalı vb. için basit proje listesi (Dropdown için)
 * Bu route eksikti, bu yüzden dropdown dolmuyordu.
 */
router.get('/', authMiddleware, (req, res) => projectController.getAllProjects(req, res));

/**
 * POST /api/projects
 * Yeni proje oluştur
 */
router.post('/', authMiddleware, (req, res) => projectController.createProject(req, res));

/**
 * POST /api/projects/:projectId/team
 * Projeye takım üyeleri ekle
 */
router.post('/:projectId/team', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.addTeamMembers(req, res));

/**
 * PUT /api/projects/:projectId/team
 * Takım üyelerini güncelle
 */
router.put('/:projectId/team', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.updateTeamMembers(req, res));

/**
 * GET /api/projects/:projectId/team
 * Takım üyelerini getir
 */
router.get('/:projectId/team', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getTeamMembers(req, res));

/**
 * POST /api/projects/:projectId/tasks
 * Task oluştur
 */
router.post('/:projectId/tasks', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.createTask(req, res));

/**
 * GET /api/projects/:projectId/tasks
 * Taskleri getir
 */
router.get('/:projectId/tasks', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getTasks(req, res));

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 * Task güncelle
 */
router.put('/:projectId/tasks/:taskId', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.updateTask(req, res));

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 * Task sil
 */
router.delete('/:projectId/tasks/:taskId', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.deleteTask(req, res));

/**
 * GET /api/projects/:projectId
 * ID'ye göre proje getir (EN SONDA OLMALI)
 */
router.get('/:projectId', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getProjectById(req, res));

module.exports = router;