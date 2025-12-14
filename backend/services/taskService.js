const { pool } = require('../config/database');

class TaskService {
    /**
     * Kullanıcının atandığı projeleri getir
     * teamforproject tablosuna göre kullanıcının takım üyesi olduğu projeler
     */
    async getMyProjects(userId) {
        try {
            const result = await pool.query(`
                SELECT DISTINCT
                    p.projectid,
                    p.projectname,
                    p.deadline,
                    p.budget,
                    p.startdate,
                    p.enddate,
                    p.desc,
                    p.seniorid,
                    p.yoneticiid,
                    p.teamid,
                    p.teamselected,
                    u_senior.username as senior_username,
                    u_yonetici.username as yonetici_username
                FROM projects p
                LEFT JOIN users u_senior ON p.seniorid = u_senior.userid
                LEFT JOIN users u_yonetici ON p.yoneticiid = u_yonetici.userid
                JOIN teamforproject tfp ON p.projectid = tfp.projectid
                WHERE tfp.userid = $1
                AND (p.enddate IS NULL OR p.enddate >= CURRENT_DATE)
                ORDER BY p.projectid DESC
            `, [userId]);

            return {
                success: true,
                projects: result.rows || []
            };

        } catch (error) {
            console.error('TaskService GetMyProjects Error:', error);
            throw new Error('Projeler getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Kullanıcının bir projede kendisine atanmış task'lerini getir
     */
    async getMyTasks(projectId, userId) {
        try {
            // Kullanıcının bu projede takım üyesi olup olmadığını kontrol et
            const teamMemberCheck = await pool.query(`
                SELECT COUNT(*) as count
                FROM teamforproject
                WHERE projectid = $1 AND userid = $2
            `, [projectId, userId]);

            if (teamMemberCheck.rows[0]?.count === '0') {
                return {
                    success: false,
                    message: 'Bu projede takım üyesi değilsiniz.'
                };
            }

            // Projeyi kontrol et
            const projectResult = await pool.query(
                'SELECT * FROM projects WHERE projectid = $1',
                [projectId]
            );

            if (projectResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'Proje bulunamadı.'
                };
            }

            // Kullanıcıya atanmış task'leri getir
            const result = await pool.query(`
                SELECT 
                    t.taskid,
                    t.projectid,
                    t.userid,
                    t.title,
                    t.desc,
                    t.status,
                    t.priority,
                    t.deudate,
                    t.updates,
                    p.projectname
                FROM tasks t
                JOIN projects p ON t.projectid = p.projectid
                WHERE t.projectid = $1 AND t.userid = $2
                ORDER BY t.taskid DESC
            `, [projectId, userId]);

            return {
                success: true,
                tasks: result.rows || []
            };

        } catch (error) {
            console.error('TaskService GetMyTasks Error:', error);
            throw new Error('Task\'ler getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Kullanıcı kendi task'ini güncelle
     * Kullanıcı sadece kendisine atanmış task'leri güncelleyebilir
     * Sadece status, priority, deudate, updates gibi alanları güncelleyebilir (title, desc, userid gibi alanları değiştiremez)
     */
    async updateMyTask(taskId, taskData, userId) {
        try {
            const { status, priority, deudate, updates } = taskData;

            // Task'ı kontrol et ve kullanıcıya ait olup olmadığını kontrol et
            const taskResult = await pool.query(
                'SELECT * FROM tasks WHERE taskid = $1',
                [taskId]
            );

            if (taskResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'Task bulunamadı.'
                };
            }

            const task = taskResult.rows[0];

            // Task kullanıcıya ait mi kontrol et
            if (task.userid !== userId) {
                return {
                    success: false,
                    message: 'Bu task\'i güncelleme yetkiniz yok. Sadece size atanmış task\'leri güncelleyebilirsiniz.'
                };
            }

            // Güncelleme için sadece izin verilen alanları güncelle
            const updateFields = [];
            const updateValues = [];
            let paramIndex = 1;

            if (status !== undefined) {
                updateFields.push(`status = $${paramIndex++}`);
                updateValues.push(status);
            }
            if (priority !== undefined) {
                updateFields.push(`priority = $${paramIndex++}`);
                updateValues.push(priority);
            }
            if (deudate !== undefined) {
                updateFields.push(`deudate = $${paramIndex++}`);
                updateValues.push(deudate || null);
            }
            if (updates !== undefined) {
                updateFields.push(`updates = $${paramIndex++}`);
                updateValues.push(updates || null);
            }

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'Güncellenecek alan bulunamadı.'
                };
            }

            updateValues.push(taskId);

            const result = await pool.query(`
                UPDATE tasks
                SET ${updateFields.join(', ')}
                WHERE taskid = $${paramIndex++}
                RETURNING *
            `, updateValues);

            return {
                success: true,
                message: 'Task başarıyla güncellendi.',
                task: result.rows[0]
            };

        } catch (error) {
            console.error('TaskService UpdateMyTask Error:', error);
            throw new Error('Task güncellenirken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new TaskService();

