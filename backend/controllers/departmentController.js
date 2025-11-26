const departmentService = require('../services/DepartmentService');

class DepartmentController {
    /**
     * GET /api/departments
     * Tüm departmanları getir
     */
    async getAllDepartments(req, res) {
        try {
            const result = await departmentService.getAllDepartments();
            res.json(result);

        } catch (error) {
            console.error('DepartmentController GetAll Error:', error);
            res.status(500).json({
                success: false,
                message: 'Departman listesi alınamadı: ' + error.message
            });
        }
    }
}

module.exports = new DepartmentController();