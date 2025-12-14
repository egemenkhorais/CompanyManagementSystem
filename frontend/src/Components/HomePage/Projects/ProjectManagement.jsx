import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Users, X, Clock, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './ProjectManagement.css';

const ProjectManagement = ({ userPermissions = [], user }) => {
    const [projects, setProjects] = useState([]);
    const [seniors, setSeniors] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [editingTeam, setEditingTeam] = useState(false);
    const [expandedMembers, setExpandedMembers] = useState({});
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const [formData, setFormData] = useState({
        projectname: '',
        startdate: '',
        deadline: '',
        budget: '',
        desc: '',
        seniorid: ''
    });

    const [taskFormData, setTaskFormData] = useState({
        title: '',
        desc: '',
        userid: '',
        priority: 'medium',
        deudate: ''
    });

    // Admin kontrolü - user.roleid veya permissions'dan kontrol edilebilir
    const isAdmin = user?.roleid === 1 || userPermissions.some(p => p.permission_code === 'admin:management');

    useEffect(() => {
        fetchProjects();
        if (isAdmin) {
            fetchSeniors();
        }
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (showProjectModal && selectedProject) {
            if (selectedProject.teamselected) {
                fetchTeamMembers(selectedProject.projectid);
                fetchTasks(selectedProject.projectid);
            }
        }
    }, [showProjectModal, selectedProject]);

    useEffect(() => {
        if (editingTeam && teamMembers.length > 0) {
            // Mevcut takım üyelerini seçili hale getir
            setSelectedTeamMembers(teamMembers.map(m => m.userid));
        }
    }, [editingTeam, teamMembers]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/projects/active');
            if (response.data.success) {
                setProjects(response.data.projects || []);
            }
        } catch (error) {
            console.error('Projeler yüklenirken hata:', error);
            alert('Projeler yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    const fetchSeniors = async () => {
        try {
            const response = await axiosInstance.get('/projects/seniors');
            if (response.data.success) {
                setSeniors(response.data.seniors || []);
            }
        } catch (error) {
            console.error('Senior kullanıcılar yüklenirken hata:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await axiosInstance.get('/management/users-for-team');
            if (response.data.success) {
                setAllUsers(response.data.data || []);
            }
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
        }
    };

    const fetchTeamMembers = async (projectId) => {
        setLoadingTeam(true);
        try {
            const response = await axiosInstance.get(`/projects/${projectId}/team`);
            if (response.data.success) {
                setTeamMembers(response.data.teamMembers || []);
            }
        } catch (error) {
            console.error('Takım üyeleri yüklenirken hata:', error);
        } finally {
            setLoadingTeam(false);
        }
    };

    const fetchTasks = async (projectId) => {
        setLoadingTasks(true);
        try {
            const response = await axiosInstance.get(`/projects/${projectId}/tasks`);
            if (response.data.success) {
                setTasks(response.data.tasks || []);
            }
        } catch (error) {
            console.error('Task\'ler yüklenirken hata:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                projectname: formData.projectname,
                startdate: formData.startdate,
                deadline: formData.deadline,
                budget: formData.budget || null,
                desc: formData.desc || null,
                seniorid: parseInt(formData.seniorid)
            };

            const response = await axiosInstance.post('/projects', payload);
            if (response.data.success) {
                alert('Proje başarıyla oluşturuldu!');
                setShowCreateModal(false);
                setFormData({
                    projectname: '',
                    startdate: '',
                    deadline: '',
                    budget: '',
                    desc: '',
                    seniorid: ''
                });
                fetchProjects();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Proje oluşturulamadı!');
        }
    };

    const handleProjectClick = async (project) => {
        // Senior veya yönetici kontrolü
        const isSenior = project.seniorid === user?.id;
        const isYonetici = project.yoneticiid === user?.id;

        // Senior veya yönetici ise pop-up aç
        if (isSenior || isYonetici || isAdmin) {
            // Proje detaylarını yeniden çek (teamselected durumunu güncellemek için)
            try {
                const response = await axiosInstance.get(`/projects/${project.projectid}`);
                if (response.data.success) {
                    setSelectedProject(response.data.project);
                } else {
                    setSelectedProject(project);
                }
            } catch (error) {
                console.error('Proje detayları yüklenirken hata:', error);
                setSelectedProject(project);
            }
            setSelectedTeamMembers([]);
            setEditingTeam(false);
            setExpandedMembers({});
            setShowProjectModal(true);
        }
    };

    const toggleMemberTasks = (userId) => {
        setExpandedMembers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const getTasksByMember = (userId) => {
        return tasks.filter(task => task.userid === userId);
    };

    const handleAddTeamMembers = async (e) => {
        e.preventDefault();
        if (selectedTeamMembers.length === 0) {
            alert('En az bir takım üyesi seçmelisiniz!');
            return;
        }

        try {
            const response = await axiosInstance.post(`/projects/${selectedProject.projectid}/team`, {
                userIds: selectedTeamMembers
            });

            if (response.data.success) {
                alert('Takım üyeleri başarıyla eklendi!');
                // Projeyi güncelle
                const updatedProject = { ...selectedProject, teamselected: true };
                setSelectedProject(updatedProject);
                setSelectedTeamMembers([]);
                setEditingTeam(false);
                fetchProjects(); // Proje listesini güncelle
                fetchTeamMembers(selectedProject.projectid);
                fetchTasks(selectedProject.projectid);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Takım üyeleri eklenemedi!');
        }
    };

    const handleUpdateTeamMembers = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(`/projects/${selectedProject.projectid}/team`, {
                userIds: selectedTeamMembers
            });

            if (response.data.success) {
                alert('Takım üyeleri başarıyla güncellendi!');
                setEditingTeam(false);
                setSelectedTeamMembers([]);
                fetchTeamMembers(selectedProject.projectid);
                fetchProjects(); // Proje listesini güncelle
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Takım üyeleri güncellenemedi!');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/projects/${selectedProject.projectid}/tasks`, taskFormData);

            if (response.data.success) {
                alert('Task başarıyla oluşturuldu!');
                setTaskFormData({
                    title: '',
                    desc: '',
                    userid: '',
                    priority: 'medium',
                    deudate: ''
                });
                fetchTasks(selectedProject.projectid);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Task oluşturulamadı!');
        }
    };

    const handleTeamMemberToggle = (userId) => {
        setSelectedTeamMembers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#fbbf24';
            case 'in_progress': return '#3b82f6';
            case 'completed': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="content-card">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="content-card project-management-container">
            <div className="project-header">
                <div>
                    <h2>Proje Yönetim</h2>
                    <p className="page-subtitle">Aktif projelerinizi buradan görüntüleyebilirsiniz.</p>
                </div>
                {isAdmin && (
                    <button 
                        className="action-btn add-project-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={18} />
                        Proje Ekle
                    </button>
                )}
            </div>

            <div className="active-projects-section">
                <h3 className="section-title">Aktif Projeler</h3>
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>Henüz aktif proje bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map(project => (
                            <div 
                                key={project.projectid}
                                className="project-card"
                                onClick={() => handleProjectClick(project)}
                            >
                                <div className="project-card-header">
                                    <h4>{project.projectname}</h4>
                                    {project.senior_username && (
                                        <span className="senior-badge">
                                            <Users size={14} />
                                            {project.senior_username}
                                        </span>
                                    )}
                                </div>
                                
                                {project.desc && (
                                    <p className="project-desc">{project.desc}</p>
                                )}

                                <div className="project-details">
                                    <div className="detail-item">
                                        <Calendar size={16} />
                                        <div>
                                            <span className="detail-label">Başlangıç:</span>
                                            <span>{formatDate(project.startdate)}</span>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <Clock size={16} />
                                        <div>
                                            <span className="detail-label">Son Tarih:</span>
                                            <span>{formatDate(project.deadline)}</span>
                                        </div>
                                    </div>
                                    {project.budget && (
                                        <div className="detail-item">
                                            <DollarSign size={16} />
                                            <div>
                                                <span className="detail-label">Bütçe:</span>
                                                <span>{formatCurrency(project.budget)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Proje Oluşturma Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content project-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Yeni Proje Oluştur</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="project-form">
                            <div className="form-group">
                                <label>Proje Adı *</label>
                                <input
                                    type="text"
                                    value={formData.projectname}
                                    onChange={e => setFormData({ ...formData, projectname: e.target.value })}
                                    required
                                    placeholder="Proje adını giriniz"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlangıç Tarihi *</label>
                                    <input
                                        type="date"
                                        value={formData.startdate}
                                        onChange={e => setFormData({ ...formData, startdate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Son Tarih (Deadline) *</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bütçe</label>
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                        placeholder="Bütçe miktarı"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Senior Seçimi *</label>
                                    <select
                                        value={formData.seniorid}
                                        onChange={e => setFormData({ ...formData, seniorid: e.target.value })}
                                        required
                                    >
                                        <option value="">Senior seçiniz</option>
                                        {seniors.map(senior => (
                                            <option key={senior.userid} value={senior.userid}>
                                                {senior.fullname || senior.username} ({senior.rolename})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea
                                    value={formData.desc}
                                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                    placeholder="Proje açıklaması"
                                    rows="4"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={() => setShowCreateModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="action-btn">
                                    Proje Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Proje Detay Modal */}
            {showProjectModal && selectedProject && (
                <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
                    <div className="modal-content project-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedProject.projectname}</h3>
                            <button className="close-btn" onClick={() => setShowProjectModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="project-detail-content">
                            {selectedProject.desc && (
                                <div className="detail-section">
                                    <h4>Açıklama</h4>
                                    <p>{selectedProject.desc}</p>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>Proje Bilgileri</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Başlangıç Tarihi:</span>
                                        <span>{formatDate(selectedProject.startdate)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Son Tarih:</span>
                                        <span>{formatDate(selectedProject.deadline)}</span>
                                    </div>
                                    {selectedProject.budget && (
                                        <div className="info-item">
                                            <span className="info-label">Bütçe:</span>
                                            <span>{formatCurrency(selectedProject.budget)}</span>
                                        </div>
                                    )}
                                    {selectedProject.senior_username && (
                                        <div className="info-item">
                                            <span className="info-label">Senior:</span>
                                            <span>{selectedProject.senior_username}</span>
                                        </div>
                                    )}
                                    {selectedProject.yonetici_username && (
                                        <div className="info-item">
                                            <span className="info-label">Yönetici:</span>
                                            <span>{selectedProject.yonetici_username}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Takım Ekleme Bölümü - teamselected false ise göster */}
                            {!selectedProject.teamselected && (
                                <div className="detail-section team-section">
                                    <h4>Takım Oluştur</h4>
                                    <p className="section-description">Projeye takım üyeleri ekleyin. Takım oluşturulduktan sonra görev atama yapabileceksiniz.</p>
                                    
                                    <form onSubmit={handleAddTeamMembers} className="team-form">
                                        <div className="team-members-selection">
                                            <label>Takım Üyeleri Seçin *</label>
                                            <div className="users-checkbox-list">
                                                {allUsers.map(u => (
                                                    <label key={u.userid} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTeamMembers.includes(u.userid)}
                                                            onChange={() => handleTeamMemberToggle(u.userid)}
                                                        />
                                                        <span>{u.fullname || u.username} ({u.rolename})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="modal-actions">
                                            <button type="submit" className="action-btn">
                                                Takımı Oluştur
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Takım Üyeleri Listesi - teamselected true ise göster */}
                            {selectedProject.teamselected && !editingTeam && (
                                <div className="detail-section">
                                    <div className="section-header-with-action">
                                        <h4>Takım Üyeleri</h4>
                                        <button 
                                            className="ghost-btn small-btn"
                                            onClick={() => setEditingTeam(true)}
                                        >
                                            Düzenle
                                        </button>
                                    </div>
                                    {loadingTeam ? (
                                        <p>Yükleniyor...</p>
                                    ) : teamMembers.length === 0 ? (
                                        <p className="empty-text">Henüz takım üyesi eklenmemiş.</p>
                                    ) : (
                                        <div className="team-members-list">
                                            {teamMembers.map(member => (
                                                <div key={member.userid} className="team-member-item">
                                                    <Users size={16} />
                                                    <span>{member.fullname || member.username}</span>
                                                    <span className="role-badge">{member.rolename}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Takım Düzenleme Bölümü */}
                            {selectedProject.teamselected && editingTeam && (
                                <div className="detail-section team-section">
                                    <div className="section-header-with-action">
                                        <h4>Takım Düzenle</h4>
                                        <button 
                                            className="ghost-btn small-btn"
                                            onClick={() => {
                                                setEditingTeam(false);
                                                setSelectedTeamMembers([]);
                                            }}
                                        >
                                            İptal
                                        </button>
                                    </div>
                                    <p className="section-description">Takım üyelerini ekleyip çıkarabilirsiniz.</p>
                                    
                                    <form onSubmit={handleUpdateTeamMembers} className="team-form">
                                        <div className="team-members-selection">
                                            <label>Takım Üyeleri Seçin</label>
                                            <div className="users-checkbox-list">
                                                {allUsers.map(u => (
                                                    <label key={u.userid} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTeamMembers.includes(u.userid)}
                                                            onChange={() => handleTeamMemberToggle(u.userid)}
                                                        />
                                                        <span>{u.fullname || u.username} ({u.rolename})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="modal-actions">
                                            <button type="button" className="ghost-btn" onClick={() => {
                                                setEditingTeam(false);
                                                setSelectedTeamMembers([]);
                                            }}>
                                                İptal
                                            </button>
                                            <button type="submit" className="action-btn">
                                                Takımı Güncelle
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Task Yönetimi Bölümü - teamselected true ise göster */}
                            {selectedProject.teamselected && (
                                <div className="detail-section tasks-section">
                                    <h4>Görevler</h4>
                                    
                                    {/* Task Oluşturma Formu */}
                                    <form onSubmit={handleCreateTask} className="task-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Görev Başlığı *</label>
                                                <input
                                                    type="text"
                                                    value={taskFormData.title}
                                                    onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                                    required
                                                    placeholder="Görev başlığı"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Atanacak Kişi *</label>
                                                <select
                                                    value={taskFormData.userid}
                                                    onChange={e => setTaskFormData({ ...taskFormData, userid: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Takım üyesi seçin</option>
                                                    {teamMembers.map(member => (
                                                        <option key={member.userid} value={member.userid}>
                                                            {member.fullname || member.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Öncelik</label>
                                                <select
                                                    value={taskFormData.priority}
                                                    onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                                                >
                                                    <option value="low">Düşük</option>
                                                    <option value="medium">Orta</option>
                                                    <option value="high">Yüksek</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Son Tarih</label>
                                                <input
                                                    type="date"
                                                    value={taskFormData.deudate}
                                                    onChange={e => setTaskFormData({ ...taskFormData, deudate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Açıklama</label>
                                            <textarea
                                                value={taskFormData.desc}
                                                onChange={e => setTaskFormData({ ...taskFormData, desc: e.target.value })}
                                                placeholder="Görev açıklaması"
                                                rows="3"
                                            />
                                        </div>

                                        <div className="modal-actions">
                                            <button type="submit" className="action-btn">
                                                Görev Oluştur
                                            </button>
                                        </div>
                                    </form>

                                    {/* Task Listesi - Takım Üyelerine Göre Gruplandırılmış */}
                                    <div className="tasks-list">
                                        <h5>Mevcut Görevler</h5>
                                        {loadingTasks ? (
                                            <p>Yükleniyor...</p>
                                        ) : tasks.length === 0 ? (
                                            <p className="empty-text">Henüz görev eklenmemiş.</p>
                                        ) : (
                                            <div className="team-tasks-accordion">
                                                {teamMembers.map(member => {
                                                    const memberTasks = getTasksByMember(member.userid);
                                                    const isExpanded = expandedMembers[member.userid];
                                                    
                                                    if (memberTasks.length === 0) return null;

                                                    return (
                                                        <div key={member.userid} className="member-tasks-section">
                                                            <div 
                                                                className="member-header"
                                                                onClick={() => toggleMemberTasks(member.userid)}
                                                            >
                                                                <div className="member-info">
                                                                    <Users size={18} />
                                                                    <span className="member-name">
                                                                        {member.fullname || member.username}
                                                                    </span>
                                                                    <span className="task-count">
                                                                        ({memberTasks.length} görev)
                                                                    </span>
                                                                </div>
                                                                <div className="expand-icon">
                                                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                                </div>
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="member-tasks-list">
                                                                    {memberTasks.map(task => (
                                                                        <div key={task.taskid} className="task-card">
                                                                            <div className="task-header">
                                                                                <h5>{task.title}</h5>
                                                                                <div className="task-badges">
                                                                                    <span 
                                                                                        className="status-badge"
                                                                                        style={{ backgroundColor: getStatusColor(task.status) }}
                                                                                    >
                                                                                        {task.status === 'pending' ? 'Beklemede' : 
                                                                                         task.status === 'in_progress' ? 'Devam Ediyor' : 
                                                                                         task.status === 'completed' ? 'Tamamlandı' : task.status}
                                                                                    </span>
                                                                                    <span 
                                                                                        className="priority-badge"
                                                                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                                                                    >
                                                                                        {task.priority === 'high' ? 'Yüksek' : 
                                                                                         task.priority === 'medium' ? 'Orta' : 
                                                                                         task.priority === 'low' ? 'Düşük' : task.priority}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {task.desc && (
                                                                                <p className="task-desc">{task.desc}</p>
                                                                            )}
                                                                            <div className="task-footer">
                                                                                {task.deudate && (
                                                                                    <div className="task-info">
                                                                                        <Clock size={14} />
                                                                                        <span>Son Tarih: {formatDate(task.deudate)}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="action-btn" onClick={() => {
                                setShowProjectModal(false);
                                setSelectedTeamMembers([]);
                                setEditingTeam(false);
                                setTaskFormData({
                                    title: '',
                                    desc: '',
                                    userid: '',
                                    priority: 'medium',
                                    deudate: ''
                                });
                            }}>
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;

