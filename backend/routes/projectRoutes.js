const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
//Sadece token'ı olanlar erişebilir
const authMiddleware = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/checkPermission');

/**
 * GET /api/projects/seniors
 * Senior rolündeki tüm kullanıcıları getir
 * Proje oluşturma pop-up'ında senior seçimi için kullanılır
 */
router.get('/seniors', authMiddleware, (req, res) => projectController.getSeniors(req, res));

/**
 * GET /api/projects/active
 * Aktif projeleri getir
 * project:view permission'ı gereklidir
 * Kullanıcının rolüne göre filtreleme service katmanında yapılıyor
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.get('/active', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getActiveProjects(req, res));

/**
 * POST /api/projects
 * Yeni proje oluştur
 * Sadece admin kullanıcılar proje oluşturabilir (service katmanında kontrol ediliyor)
 */
router.post('/', authMiddleware, (req, res) => projectController.createProject(req, res));

/**
 * POST /api/projects/:projectId/team
 * Projeye takım üyeleri ekle
 * project:senior permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.post('/:projectId/team', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.addTeamMembers(req, res));

/**
 * PUT /api/projects/:projectId/team
 * Projeye ait takım üyelerini güncelle (ekle/çıkar)
 * project:senior permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.put('/:projectId/team', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.updateTeamMembers(req, res));

/**
 * GET /api/projects/:projectId/team
 * Projeye ait takım üyelerini getir
 * project:view permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.get('/:projectId/team', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getTeamMembers(req, res));

/**
 * POST /api/projects/:projectId/tasks
 * Projeye task oluştur
 * project:senior permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.post('/:projectId/tasks', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.createTask(req, res));

/**
 * GET /api/projects/:projectId/tasks
 * Projeye ait task'leri getir
 * project:view permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.get('/:projectId/tasks', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getTasks(req, res));

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 * Task güncelle
 * project:senior permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.put('/:projectId/tasks/:taskId', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.updateTask(req, res));

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 * Task sil
 * project:senior permission'ı gereklidir
 * Bu route'u /:projectId'den ÖNCE tanımlamak önemli!
 */
router.delete('/:projectId/tasks/:taskId', authMiddleware, checkPermission('project:senior'), (req, res) => projectController.deleteTask(req, res));

/**
 * GET /api/projects/:projectId
 * ID'ye göre proje getir
 * project:view permission'ı gereklidir
 * Kullanıcının bu projeyi görme yetkisi service katmanında kontrol ediliyor
 * Bu route EN SONDA olmalı (diğer route'larla çakışmaması için)
 */
router.get('/:projectId', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getProjectById(req, res));

module.exports = router;

