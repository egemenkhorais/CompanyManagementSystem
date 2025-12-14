const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm route'lar auth gerektirir
router.use(authMiddleware);

// Department Routes
router.get('/', (req, res) => departmentController.getAllDepartments(req, res));
router.get('/:id', (req, res) => departmentController.getDepartmentById(req, res));
router.post('/', (req, res) => departmentController.createDepartment(req, res));
router.put('/:id', (req, res) => departmentController.updateDepartment(req, res));
router.delete('/:id', (req, res) => departmentController.deleteDepartment(req, res));

// Department Positions Routes
router.get('/:id/positions', (req, res) => departmentController.getDepartmentPositions(req, res));
router.post('/:id/positions', (req, res) => departmentController.addPositionToDepartment(req, res));

// Position Names & Operations (DİKKAT: Bu route'lar /departments altında ama positions ile ilgili)
router.get('/positions/names', (req, res) => departmentController.getAllPositionNames(req, res));
router.put('/positions/:positionId', (req, res) => departmentController.updatePosition(req, res));
router.delete('/positions/:positionId', (req, res) => departmentController.deletePosition(req, res));

module.exports = router;