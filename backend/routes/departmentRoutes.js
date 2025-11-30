const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
//Sadece token'ı olanlar erişebilir
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * GET /api/departments
 * Tüm departmanları getir
 */
router.get('/', authMiddleware, (req, res) => departmentController.getAllDepartments(req, res));

module.exports = router;