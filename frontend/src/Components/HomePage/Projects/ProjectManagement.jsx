import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Users, X, Clock, FileText } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './ProjectManagement.css';

const ProjectManagement = ({ userPermissions = [], user }) => {
    const [projects, setProjects] = useState([]);
    const [seniors, setSeniors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const [formData, setFormData] = useState({
        projectname: '',
        startdate: '',
        deadline: '',
        budget: '',
        desc: '',
        seniorid: ''
    });

    // Admin kontrolü - user.roleid veya permissions'dan kontrol edilebilir
    const isAdmin = user?.roleid === 1 || userPermissions.some(p => p.permission_code === 'admin:management');

    useEffect(() => {
        fetchProjects();
        if (isAdmin) {
            fetchSeniors();
        }
    }, []);

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

    const handleProjectClick = (project) => {
        // Senior veya yönetici kontrolü
        const isSenior = project.seniorid === user?.id;
        const isYonetici = project.yoneticiid === user?.id;

        // Senior veya yönetici ise pop-up aç
        if (isSenior || isYonetici || isAdmin) {
            setSelectedProject(project);
            setShowProjectModal(true);
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

                            <div className="detail-section">
                                <h4>Görevler</h4>
                                <p className="coming-soon">Görev atama özelliği yakında eklenecektir.</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="action-btn" onClick={() => setShowProjectModal(false)}>
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

