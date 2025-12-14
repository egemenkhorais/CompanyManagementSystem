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
 * GET /api/projects/:projectId
 * ID'ye göre proje getir
 * project:view permission'ı gereklidir
 * Kullanıcının bu projeyi görme yetkisi service katmanında kontrol ediliyor
 */
router.get('/:projectId', authMiddleware, checkPermission('project:view'), (req, res) => projectController.getProjectById(req, res));

module.exports = router;

