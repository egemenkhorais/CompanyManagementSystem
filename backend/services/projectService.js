const { pool } = require('../config/database');

class ProjectService {
    /**
     * Yeni proje oluştur
     * Sadece admin kullanıcılar proje oluşturabilir
     */
    async createProject(projectData, userId) {
        try {
            const { 
                projectname, 
                deadline, 
                budget, 
                startdate, 
                desc, 
                seniorid, 
                teamid,
                teamselected 
            } = projectData;

            // Validasyon
            if (!projectname || !projectname.trim()) {
                return {
                    success: false,
                    message: 'Proje adı zorunludur.'
                };
            }

            if (!startdate) {
                return {
                    success: false,
                    message: 'Proje başlangıç tarihi (startdate) zorunludur.'
                };
            }

            if (!deadline) {
                return {
                    success: false,
                    message: 'Proje son tarihi (deadline) zorunludur.'
                };
            }

            if (!seniorid) {
                return {
                    success: false,
                    message: 'Senior kullanıcı seçimi (seniorid) zorunludur.'
                };
            }

            // Kullanıcının admin olup olmadığını kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = (SELECT roleid FROM users WHERE userid = $1)',
                [userId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            if (roleName !== 'admin') {
                return {
                    success: false,
                    message: 'Sadece admin kullanıcılar proje oluşturabilir.'
                };
            }

            // yoneticiid = projeyi oluşturan admin'in ID'si (otomatik)
            // enddate = null (proje bittikten sonra işaretlenecek)

            // Yeni proje ekle
            const result = await pool.query(`
                INSERT INTO projects (
                    projectname, 
                    deadline, 
                    budget, 
                    startdate, 
                    enddate, 
                    "desc", 
                    seniorid, 
                    yoneticiid,
                    teamid,
                    teamselected
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING * 
            `, [
                projectname.trim(),
                deadline,
                budget || null,
                startdate,
                null, // enddate her zaman null (proje bittikten sonra işaretlenecek)
                desc || null,
                seniorid,
                userId, // yoneticiid = projeyi oluşturan admin'in ID'si
                teamid || null,
                teamselected || false
            ]);

            const project = result.rows[0];

            return {
                success: true,
                message: 'Proje başarıyla oluşturuldu.',
                project: project
            };

        } catch (error) {
            console.error('ProjectService Create Error:', error);
            throw new Error('Proje oluşturulurken hata oluştu: ' + error.message);
        }
    }

    /**
     * Kullanıcıya göre aktif projeleri getir
     * - Admin: Tüm projeleri görebilir
     * - Senior rolündeki kullanıcılar: Sadece kendilerine atanan projeleri görebilir
     * - Proje yöneticisi (yoneticiid, ama senior değil): Tüm projeleri görebilir
     * - Diğer kullanıcılar: Sadece kendisine atanan projeleri görebilir
     */
    async getActiveProjects(userId, userRoleId) {
        try {
            // Kullanıcının rolünü kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            let query;
            let params = [];

            if (roleName === 'admin') {
                // Admin: Tüm aktif projeleri getir
                query = `
                    SELECT 
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
                    WHERE p.enddate IS NULL OR p.enddate >= CURRENT_DATE
                    ORDER BY p.projectid DESC
                `;
            } else if (roleName && roleName.toLowerCase().includes('senior')) {
                // Senior rolündeki kullanıcılar: Sadece kendilerine atanan projeleri görebilir
                // seniorid kolonunda kendi userid'leri olan projeler veya teamforproject tablosunda olan projeler
                query = `
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
                    LEFT JOIN teamforproject tfp ON p.projectid = tfp.projectid
                    WHERE (p.enddate IS NULL OR p.enddate >= CURRENT_DATE)
                    AND (
                        p.seniorid = $1 
                        OR tfp.userid = $1
                    )
                    ORDER BY p.projectid DESC
                `;
                params = [userId];
            } else {
                // Yönetici kontrolü: yoneticiid kolonunda bu kullanıcı var mı?
                const yoneticiCheck = await pool.query(
                    'SELECT COUNT(*) as count FROM projects WHERE yoneticiid = $1',
                    [userId]
                );

                const isYonetici = yoneticiCheck.rows[0]?.count > 0;

                if (isYonetici) {
                    // Proje yöneticisi (yoneticiid, ama senior değil): Tüm aktif projeleri görebilir
                    query = `
                        SELECT 
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
                        WHERE p.enddate IS NULL OR p.enddate >= CURRENT_DATE
                        ORDER BY p.projectid DESC
                    `;
                } else {
                    // Diğer kullanıcılar: Sadece kendisine atanan projeleri görebilir
                    // teamforproject tablosunda userid kontrolü
                    query = `
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
                        LEFT JOIN teamforproject tfp ON p.projectid = tfp.projectid
                        WHERE (p.enddate IS NULL OR p.enddate >= CURRENT_DATE)
                        AND tfp.userid = $1
                        ORDER BY p.projectid DESC
                    `;
                    params = [userId];
                }
            }

            const result = await pool.query(query, params);

            return {
                success: true,
                projects: result.rows || []
            };

        } catch (error) {
            console.error('ProjectService GetActiveProjects Error:', error);
            throw new Error('Aktif projeler getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * ID'ye göre proje getir
     * Kullanıcının bu projeyi görme yetkisi olup olmadığını kontrol eder
     */
    async getProjectById(projectId, userId, userRoleId) {
        try {
            // Önce projeyi getir
            const projectResult = await pool.query(`
                SELECT 
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
                WHERE p.projectid = $1
            `, [projectId]);

            if (projectResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'Proje bulunamadı.'
                };
            }

            const project = projectResult.rows[0];

            // Kullanıcının rolünü kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin ise direkt döndür
            if (roleName === 'admin') {
                return {
                    success: true,
                    project: project
                };
            }

            // Senior rolündeki kullanıcılar: Sadece kendilerine atanan projeleri görebilir
            if (roleName && roleName.toLowerCase().includes('senior')) {
                const accessCheck = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM projects p
                    LEFT JOIN teamforproject tfp ON p.projectid = tfp.projectid
                    WHERE p.projectid = $1
                    AND (
                        p.seniorid = $2 
                        OR tfp.userid = $2
                    )
                `, [projectId, userId]);

                if (accessCheck.rows[0]?.count === '0') {
                    return {
                        success: false,
                        message: 'Bu projeyi görüntüleme yetkiniz yok.'
                    };
                }

                return {
                    success: true,
                    project: project
                };
            }

            // Proje yöneticisi (yoneticiid, ama senior değil) ise direkt döndür
            if (project.yoneticiid === userId) {
                return {
                    success: true,
                    project: project
                };
            }

            // Diğer kullanıcılar: Sadece teamforproject tablosunda olan projeleri görebilir
            const accessCheck = await pool.query(`
                SELECT COUNT(*) as count
                FROM teamforproject tfp
                WHERE tfp.projectid = $1
                AND tfp.userid = $2
            `, [projectId, userId]);

            if (accessCheck.rows[0]?.count === '0') {
                return {
                    success: false,
                    message: 'Bu projeyi görüntüleme yetkiniz yok.'
                };
            }

            return {
                success: true,
                project: project
            };

        } catch (error) {
            console.error('ProjectService GetProjectById Error:', error);
            throw new Error('Proje getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Senior rolündeki tüm kullanıcıları getir
     * Proje oluşturma pop-up'ında senior seçimi için kullanılır
     */
    async getSeniors() {
        try {
            const result = await pool.query(`
                SELECT 
                    u.userid,
                    u.username,
                    u.roleid,
                    r.rolename,
                    ud.name as fullname
                FROM users u
                JOIN roles r ON u.roleid = r.roleid
                LEFT JOIN userdetails ud ON u.userid = ud.userid
                WHERE r.rolename ILIKE 'backend_senior%'
                ORDER BY u.username ASC
            `);

            return {
                success: true,
                seniors: result.rows || []
            };

        } catch (error) {
            console.error('ProjectService GetSeniors Error:', error);
            throw new Error('Senior kullanıcılar getirilirken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new ProjectService();

