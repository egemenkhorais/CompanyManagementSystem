const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

/**
 * GET /api/departments
 * Tüm departmanları getir
 */
router.get('/', (req, res) => departmentController.getAllDepartments(req, res));

module.exports = router;