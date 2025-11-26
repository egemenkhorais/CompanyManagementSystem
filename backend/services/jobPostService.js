const supabase = require('../config/supabase');

class JobPostService {
    /**
     * Yeni iş ilanı oluştur
     */
    async createJobPost(jobPostData) {
        try {
            const { departmentId, expectations, companyId = null, createdByUser = null } = jobPostData;

            // Validasyon
            if (!departmentId || !expectations || !expectations.trim()) {
                return {
                    success: false,
                    message: 'Departman ve beklenti alanları zorunludur.'
                };
            }

            // Supabase'e kaydet
            const { data, error } = await supabase
                .from('jobposts')
                .insert([
                    {
                        expectations: expectations.trim(),
                        departmentid: departmentId,
                        companyid: companyId,
                        createdbyuser: createdByUser
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'İş ilanı başarıyla oluşturuldu.',
                jobPost: data
            };

        } catch (error) {
            console.error('JobPostService Create Error:', error);
            throw new Error('İş ilanı oluşturulurken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new JobPostService();