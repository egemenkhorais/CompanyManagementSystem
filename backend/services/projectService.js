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

    /**
     * Projeye takım üyeleri güncelle (ekle/çıkar)
     * Sadece projenin senior'ı veya yöneticisi takım düzenleyebilir
     */
    async updateTeamMembers(projectId, userIds, userId, userRoleId) {
        try {
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

            const project = projectResult.rows[0];

            // Kullanıcının bu projeye takım düzenleme yetkisi var mı kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin, yönetici veya senior kontrolü
            const isAuthorized = roleName === 'admin' || 
                                project.yoneticiid === userId || 
                                project.seniorid === userId;

            if (!isAuthorized) {
                return {
                    success: false,
                    message: 'Bu projenin takımını düzenleme yetkiniz yok.'
                };
            }

            // Validasyon
            if (!userIds || !Array.isArray(userIds)) {
                return {
                    success: false,
                    message: 'Geçerli bir kullanıcı listesi gönderilmelidir.'
                };
            }

            // Transaction başlat
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Mevcut takım üyelerini sil
                await client.query(
                    'DELETE FROM teamforproject WHERE projectid = $1',
                    [projectId]
                );

                // Yeni takım üyelerini ekle (eğer varsa)
                if (userIds.length > 0) {
                    for (const memberUserId of userIds) {
                        await client.query(`
                            INSERT INTO teamforproject (projectid, userid)
                            VALUES ($1, $2)
                        `, [projectId, memberUserId]);
                    }
                }

                // teamselected durumunu güncelle
                await client.query(`
                    UPDATE projects 
                    SET teamselected = $1
                    WHERE projectid = $2
                `, [userIds.length > 0, projectId]);

                await client.query('COMMIT');

                return {
                    success: true,
                    message: 'Takım üyeleri başarıyla güncellendi.'
                };

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            console.error('ProjectService UpdateTeamMembers Error:', error);
            throw new Error('Takım üyeleri güncellenirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Projeye takım üyeleri ekle
     * Sadece projenin senior'ı veya yöneticisi takım ekleyebilir
     * teamselected false ise takım eklenebilir
     */
    async addTeamMembers(projectId, userIds, userId, userRoleId) {
        try {
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

            const project = projectResult.rows[0];

            // Kullanıcının bu projeye takım ekleme yetkisi var mı kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin, yönetici veya senior kontrolü
            const isAuthorized = roleName === 'admin' || 
                                project.yoneticiid === userId || 
                                project.seniorid === userId;

            if (!isAuthorized) {
                return {
                    success: false,
                    message: 'Bu projeye takım ekleme yetkiniz yok.'
                };
            }

            // teamselected kontrolü
            if (project.teamselected) {
                return {
                    success: false,
                    message: 'Bu projenin takımı zaten oluşturulmuş.'
                };
            }

            // Validasyon
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return {
                    success: false,
                    message: 'En az bir takım üyesi seçmelisiniz.'
                };
            }

            // Transaction başlat
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Mevcut takım üyelerini kontrol et (varsa sil)
                await client.query(
                    'DELETE FROM teamforproject WHERE projectid = $1',
                    [projectId]
                );

                // Yeni takım üyelerini ekle
                for (const memberUserId of userIds) {
                    await client.query(`
                        INSERT INTO teamforproject (projectid, userid)
                        VALUES ($1, $2)
                    `, [projectId, memberUserId]);
                }

                // teamselected'ı true yap
                await client.query(`
                    UPDATE projects 
                    SET teamselected = true 
                    WHERE projectid = $1
                `, [projectId]);

                await client.query('COMMIT');

                return {
                    success: true,
                    message: 'Takım üyeleri başarıyla eklendi.'
                };

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            console.error('ProjectService AddTeamMembers Error:', error);
            throw new Error('Takım üyeleri eklenirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Projeye ait takım üyelerini getir
     */
    async getTeamMembers(projectId, userId, userRoleId) {
        try {
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

            const project = projectResult.rows[0];

            // Kullanıcının bu projeyi görme yetkisi var mı kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin, yönetici veya senior kontrolü
            const isAuthorized = roleName === 'admin' || 
                                project.yoneticiid === userId || 
                                project.seniorid === userId;

            if (!isAuthorized) {
                // Takım üyesi kontrolü
                const isTeamMember = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM teamforproject
                    WHERE projectid = $1 AND userid = $2
                `, [projectId, userId]);

                if (isTeamMember.rows[0]?.count === '0') {
                    return {
                        success: false,
                        message: 'Bu projenin takım üyelerini görüntüleme yetkiniz yok.'
                    };
                }
            }

            // Takım üyelerini getir
            const result = await pool.query(`
                SELECT 
                    tfp.userid,
                    u.username,
                    u.roleid,
                    r.rolename,
                    ud.name as fullname
                FROM teamforproject tfp
                JOIN users u ON tfp.userid = u.userid
                JOIN roles r ON u.roleid = r.roleid
                LEFT JOIN userdetails ud ON u.userid = ud.userid
                WHERE tfp.projectid = $1
                ORDER BY u.username ASC
            `, [projectId]);

            return {
                success: true,
                teamMembers: result.rows || []
            };

        } catch (error) {
            console.error('ProjectService GetTeamMembers Error:', error);
            throw new Error('Takım üyeleri getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Projeye task oluştur
     * Sadece projenin senior'ı veya yöneticisi task oluşturabilir
     */
    async createTask(projectId, taskData, userId, userRoleId) {
        try {
            const { title, desc, userid, priority, deudate } = taskData;

            // Validasyon
            if (!title || !title.trim()) {
                return {
                    success: false,
                    message: 'Task başlığı zorunludur.'
                };
            }

            if (!userid) {
                return {
                    success: false,
                    message: 'Task atanacak kullanıcı seçilmelidir.'
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

            const project = projectResult.rows[0];

            // teamselected kontrolü
            if (!project.teamselected) {
                return {
                    success: false,
                    message: 'Önce proje takımını oluşturmalısınız.'
                };
            }

            // Kullanıcının bu projeye task ekleme yetkisi var mı kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin, yönetici veya senior kontrolü
            const isAuthorized = roleName === 'admin' || 
                                project.yoneticiid === userId || 
                                project.seniorid === userId;

            if (!isAuthorized) {
                return {
                    success: false,
                    message: 'Bu projeye task ekleme yetkiniz yok.'
                };
            }

            // Seçilen kullanıcının takım üyesi olup olmadığını kontrol et
            const teamMemberCheck = await pool.query(`
                SELECT COUNT(*) as count
                FROM teamforproject
                WHERE projectid = $1 AND userid = $2
            `, [projectId, userid]);

            if (teamMemberCheck.rows[0]?.count === '0') {
                return {
                    success: false,
                    message: 'Task sadece takım üyelerine atanabilir.'
                };
            }

            // Task oluştur
            const result = await pool.query(`
                INSERT INTO tasks (
                    projectid,
                    userid,
                    title,
                    "desc",
                    status,
                    priority,
                    deudate,
                    iscompleted
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                projectId,
                userid,
                title.trim(),
                desc || null,
                'pending', // Varsayılan status
                priority || 'medium',
                deudate || null,
                false // iscompleted varsayılan false
            ]);

            return {
                success: true,
                message: 'Task başarıyla oluşturuldu.',
                task: result.rows[0]
            };

        } catch (error) {
            console.error('ProjectService CreateTask Error:', error);
            throw new Error('Task oluşturulurken hata oluştu: ' + error.message);
        }
    }

    /**
     * Projeye ait task'leri getir
     */
    async getTasks(projectId, userId, userRoleId) {
        try {
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

            const project = projectResult.rows[0];

            // Kullanıcının bu projeyi görme yetkisi var mı kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin, yönetici veya senior kontrolü
            const isAuthorized = roleName === 'admin' || 
                                project.yoneticiid === userId || 
                                project.seniorid === userId;

            if (!isAuthorized) {
                // Takım üyesi kontrolü
                const isTeamMember = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM teamforproject
                    WHERE projectid = $1 AND userid = $2
                `, [projectId, userId]);

                if (isTeamMember.rows[0]?.count === '0') {
                    return {
                        success: false,
                        message: 'Bu projenin task\'lerini görüntüleme yetkiniz yok.'
                    };
                }
            }

            // Task'leri getir
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
                    u.username,
                    ud.name as fullname
                FROM tasks t
                JOIN users u ON t.userid = u.userid
                LEFT JOIN userdetails ud ON u.userid = ud.userid
                WHERE t.projectid = $1
                ORDER BY t.taskid DESC
            `, [projectId]);

            return {
                success: true,
                tasks: result.rows || []
            };

        } catch (error) {
            console.error('ProjectService GetTasks Error:', error);
            throw new Error('Task\'ler getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * Task güncelle
     */
    async updateTask(projectId, taskId, taskData, userId, userRoleId) {
        try {
            const { title, desc, userid, status, priority, deudate } = taskData;

            // Task'ı kontrol et
            const taskResult = await pool.query(
                'SELECT * FROM tasks WHERE taskid = $1 AND projectid = $2',
                [taskId, projectId]
            );

            if (taskResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'Task bulunamadı.'
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

            const project = projectResult.rows[0];

            // Kullanıcının bu projeye task güncelleme yetkisi var mı kontrol et
            const roleResult = await pool.query(
                'SELECT rolename FROM roles WHERE roleid = $1',
                [userRoleId]
            );

            const roleName = roleResult.rows[0]?.rolename;

            // Admin, yönetici veya senior kontrolü
            const isAuthorized = roleName === 'admin' || 
                                project.yoneticiid === userId || 
                                project.seniorid === userId;

            if (!isAuthorized) {
                return {
                    success: false,
                    message: 'Bu task\'i güncelleme yetkiniz yok.'
                };
            }

            // Güncelleme için sadece değişen alanları güncelle
            const updateFields = [];
            const updateValues = [];
            let paramIndex = 1;

            if (title !== undefined) {
                updateFields.push(`title = $${paramIndex++}`);
                updateValues.push(title.trim());
            }
            if (desc !== undefined) {
                updateFields.push(`desc = $${paramIndex++}`);
                updateValues.push(desc || null);
            }
            if (userid !== undefined) {
                // Yeni kullanıcının takım üyesi olup olmadığını kontrol et
                const teamMemberCheck = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM teamforproject
                    WHERE projectid = $1 AND userid = $2
                `, [projectId, userid]);

                if (teamMemberCheck.rows[0]?.count === '0') {
                    return {
                        success: false,
                        message: 'Task sadece takım üyelerine atanabilir.'
                    };
                }

                updateFields.push(`userid = $${paramIndex++}`);
                updateValues.push(userid);
            }
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

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'Güncellenecek alan bulunamadı.'
                };
            }

            updateValues.push(taskId, projectId);

            const result = await pool.query(`
                UPDATE tasks
                SET ${updateFields.join(', ')}
                WHERE taskid = $${paramIndex++} AND projectid = $${paramIndex++}
                RETURNING *
            `, updateValues);

            return {
                success: true,
                message: 'Task başarıyla güncellendi.',
                task: result.rows[0]
            };

        } catch (error) {
            console.error('ProjectService UpdateTask Error:', error);
            throw new Error('Task güncellenirken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new ProjectService();

