import React, { useState, useEffect } from 'react';
import { FileText, Clock, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './Tasks.css';

const Tasks = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [expandedProject, setExpandedProject] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [taskFormData, setTaskFormData] = useState({
        status: '',
        priority: '',
        deudate: '',
        updates: ''
    });

    useEffect(() => {
        fetchMyProjects();
    }, []);

    useEffect(() => {
        if (expandedProject) {
            fetchMyTasks(expandedProject);
        }
    }, [expandedProject]);

    const fetchMyProjects = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/tasks/my-projects');
            if (response.data.success) {
                setProjects(response.data.projects || []);
            }
        } catch (error) {
            console.error('Projeler yüklenirken hata:', error);
            alert('Projeler yüklenirken bir hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTasks = async (projectId) => {
        setLoadingTasks(true);
        try {
            const response = await axiosInstance.get(`/tasks/my-tasks/${projectId}`);
            if (response.data.success) {
                setTasks(response.data.tasks || []);
            } else {
                alert(response.data.message || 'Task\'ler yüklenirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Task\'ler yüklenirken hata:', error);
            alert(error.response?.data?.message || 'Task\'ler yüklenirken bir hata oluştu!');
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleProjectClick = (project) => {
        if (expandedProject === project.projectid) {
            setExpandedProject(null);
            setTasks([]);
        } else {
            setExpandedProject(project.projectid);
            setSelectedProject(project);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task.taskid);
        setTaskFormData({
            status: task.status || '',
            priority: task.priority || '',
            deudate: task.deudate || '',
            updates: task.updates || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        setTaskFormData({
            status: '',
            priority: '',
            deudate: '',
            updates: ''
        });
    };

    const handleUpdateTask = async (taskId) => {
        try {
            const response = await axiosInstance.put(`/tasks/my-tasks/${taskId}`, taskFormData);
            if (response.data.success) {
                alert('Task başarıyla güncellendi!');
                setEditingTask(null);
                setTaskFormData({
                    status: '',
                    priority: '',
                    deudate: '',
                    updates: ''
                });
                // Task listesini yenile
                if (expandedProject) {
                    fetchMyTasks(expandedProject);
                }
            } else {
                alert(response.data.message || 'Task güncellenirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Task güncellenirken hata:', error);
            alert(error.response?.data?.message || 'Task güncellenirken bir hata oluştu!');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#fbbf24';
            case 'in_progress': return '#3b82f6';
            case 'completed': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Beklemede';
            case 'in_progress': return 'Devam Ediyor';
            case 'completed': return 'Tamamlandı';
            default: return status;
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

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high': return 'Yüksek';
            case 'medium': return 'Orta';
            case 'low': return 'Düşük';
            default: return priority;
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

    if (loading) {
        return (
            <div className="content-card">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="content-card tasks-container">
            <div className="tasks-header">
                <div>
                    <h2>Görevlerim</h2>
                    <p className="page-subtitle">Atandığınız projelerdeki görevlerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.</p>
                </div>
            </div>

            <div className="projects-section">
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>Henüz size atanmış proje bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map(project => {
                            const isExpanded = expandedProject === project.projectid;
                            const projectTasks = tasks.filter(t => t.projectid === project.projectid);

                            return (
                                <div key={project.projectid} className="project-card">
                                    <div 
                                        className="project-card-header"
                                        onClick={() => handleProjectClick(project)}
                                    >
                                        <div className="project-info">
                                            <h3>{project.projectname}</h3>
                                            {project.deadline && (
                                                <div className="project-meta">
                                                    <Clock size={14} />
                                                    <span>Son Tarih: {formatDate(project.deadline)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="expand-icon">
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="tasks-section">
                                            {loadingTasks ? (
                                                <div className="loading-state">
                                                    <p>Yükleniyor...</p>
                                                </div>
                                            ) : projectTasks.length === 0 ? (
                                                <div className="empty-tasks">
                                                    <p>Bu projede size atanmış görev bulunmamaktadır.</p>
                                                </div>
                                            ) : (
                                                <div className="tasks-list">
                                                    {projectTasks.map(task => (
                                                        <div key={task.taskid} className="task-card">
                                                            {editingTask === task.taskid ? (
                                                                <div className="task-edit-form">
                                                                    <h4>{task.title}</h4>
                                                                    {task.desc && <p className="task-desc">{task.desc}</p>}
                                                                    
                                                                    <div className="form-group">
                                                                        <label>Durum</label>
                                                                        <select
                                                                            value={taskFormData.status}
                                                                            onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })}
                                                                        >
                                                                            <option value="pending">Beklemede</option>
                                                                            <option value="in_progress">Devam Ediyor</option>
                                                                            <option value="completed">Tamamlandı</option>
                                                                        </select>
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Öncelik</label>
                                                                        <input
                                                                            type="text"
                                                                            value={getPriorityText(taskFormData.priority)}
                                                                            disabled
                                                                            className="disabled-input"
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Son Tarih</label>
                                                                        <input
                                                                            type="text"
                                                                            value={taskFormData.deudate ? formatDate(taskFormData.deudate) : '-'}
                                                                            disabled
                                                                            className="disabled-input"
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Yapılanlar</label>
                                                                        <textarea
                                                                            value={taskFormData.updates}
                                                                            onChange={e => setTaskFormData({ ...taskFormData, updates: e.target.value })}
                                                                            placeholder="Yaptıklarınızı buraya yazabilirsiniz (her satır bir yapılan işlem)"
                                                                            rows="6"
                                                                        />
                                                                    </div>

                                                                    <div className="task-actions">
                                                                        <button 
                                                                            className="ghost-btn"
                                                                            onClick={handleCancelEdit}
                                                                        >
                                                                            İptal
                                                                        </button>
                                                                        <button 
                                                                            className="action-btn"
                                                                            onClick={() => handleUpdateTask(task.taskid)}
                                                                        >
                                                                            Kaydet
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="task-header">
                                                                        <h4>{task.title}</h4>
                                                                        <div className="task-badges">
                                                                            <span 
                                                                                className="status-badge"
                                                                                style={{ backgroundColor: getStatusColor(task.status) }}
                                                                            >
                                                                                {getStatusText(task.status)}
                                                                            </span>
                                                                            <span 
                                                                                className="priority-badge"
                                                                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                                                                            >
                                                                                {getPriorityText(task.priority)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {task.desc && (
                                                                        <p className="task-desc">{task.desc}</p>
                                                                    )}
                                                                    {task.updates && (
                                                                        <div className="task-updates">
                                                                            <h5>Yapılanlar:</h5>
                                                                            <pre className="updates-content">{task.updates}</pre>
                                                                        </div>
                                                                    )}
                                                                    <div className="task-footer">
                                                                        {task.deudate && (
                                                                            <div className="task-info">
                                                                                <Calendar size={14} />
                                                                                <span>Son Tarih: {formatDate(task.deudate)}</span>
                                                                            </div>
                                                                        )}
                                                                        <button 
                                                                            className="edit-task-btn"
                                                                            onClick={() => handleEditTask(task)}
                                                                        >
                                                                            Düzenle
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tasks;

