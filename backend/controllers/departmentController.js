const departmentService = require('../services/departmentService');
const positionService = require('../services/positionService');

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

    /**
     * GET /api/departments/:id
     * Tek departman getir
     */
    async getDepartmentById(req, res) {
        try {
            const { id } = req.params;
            const result = await departmentService.getDepartmentById(id);
            res.json(result);
        } catch (error) {
            console.error('DepartmentController GetById Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * POST /api/departments
     * Departman oluştur
     */
    async createDepartment(req, res) {
        try {
            const result = await departmentService.createDepartment(req.body);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            console.error('DepartmentController Create Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * PUT /api/departments/:id
     * Departman güncelle
     */
    async updateDepartment(req, res) {
        try {
            const { id } = req.params;
            const result = await departmentService.updateDepartment(id, req.body);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('DepartmentController Update Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * DELETE /api/departments/:id
     * Departman sil
     */
    async deleteDepartment(req, res) {
        try {
            const { id } = req.params;
            const result = await departmentService.deleteDepartment(id);

            if (!result.canDelete) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('DepartmentController Delete Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * GET /api/departments/:id/positions
     * Departmanın pozisyonlarını getir
     */
    async getDepartmentPositions(req, res) {
        try {
            const { id } = req.params;
            const result = await departmentService.getDepartmentPositions(id);
            res.json(result);
        } catch (error) {
            console.error('DepartmentController GetPositions Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * GET /api/departments/positions/names
     * Position name'lerini getir (dropdown için)
     */
    async getAllPositionNames(req, res) {
        try {
            const result = await positionService.getAllPositionNames();
            res.json(result);
        } catch (error) {
            console.error('DepartmentController GetPositionNames Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * POST /api/departments/:id/positions
     * Departmana pozisyon ekle
     */
    async addPositionToDepartment(req, res) {
        try {
            const { id } = req.params;
            const positionData = { ...req.body, departmentid: id };

            const result = await positionService.addPositionToDepartment(positionData);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            console.error('DepartmentController AddPosition Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * PUT /api/departments/positions/:positionId
     * Pozisyon güncelle
     */
    async updatePosition(req, res) {
        try {
            const { positionId } = req.params;
            const result = await positionService.updatePosition(positionId, req.body);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('DepartmentController UpdatePosition Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }

    /**
     * DELETE /api/departments/positions/:positionId
     * Pozisyon sil
     */
    async deletePosition(req, res) {
        try {
            const { positionId } = req.params;
            const result = await positionService.deletePosition(positionId);

            if (!result.canDelete) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('DepartmentController DeletePosition Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası: ' + error.message
            });
        }
    }
}

module.exports = new DepartmentController();