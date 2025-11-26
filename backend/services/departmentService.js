const supabase = require('../config/supabase');

class DepartmentService {
    /**
     * Tüm departmanları getir
     */
    async getAllDepartments() {
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('departmentid', { ascending: true });

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };

        } catch (error) {
            console.error('DepartmentService GetAll Error:', error);
            throw new Error('Departman listesi alınamadı: ' + error.message);
        }
    }
}

module.exports = new DepartmentService();