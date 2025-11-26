import React, { useState } from 'react';
import './CVAnalyze.css';

const CVAnalyze = () => {
    const [selectedJobPost, setSelectedJobPost] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvList, setCvList] = useState([]);

    // Örnek iş ilanları - şimdilik statik
    const jobPosts = [
        { id: '1', title: 'Yazılım Geliştirici' },
        { id: '2', title: 'UI/UX Tasarımcısı' },
        { id: '3', title: 'Proje Yöneticisi' }
    ];

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleAnalyze = () => {
        // Şimdilik sadece placeholder - backend bağlantısı sonra yapılacak
        if (!selectedJobPost) {
            alert('Lütfen bir iş ilanı seçiniz.');
            return;
        }
        if (!selectedFile) {
            alert('Lütfen bir CV dosyası yükleyiniz.');
            return;
        }
        
        alert('AI Analiz özelliği yakında aktif olacak!');
    };

    return (
        <div className="cv-analyze-container">
            <div className="cv-analyze-header">
                <h2>CV Analiz Ekranı</h2>
            </div>

            <div className="cv-analyze-content">
                {/* Sol Panel - Input ve Aksiyonlar */}
                <div className="cv-analyze-left-panel">
                    <div className="cv-analyze-section">
                        <label className="cv-analyze-label">Aktif İş İlanları Seçiniz:</label>
                        <div className="cv-analyze-select">
                            <select
                                value={selectedJobPost}
                                onChange={(e) => setSelectedJobPost(e.target.value)}
                            >
                                <option value="">İş İlanları</option>
                                {jobPosts.map((post) => (
                                    <option key={post.id} value={post.id}>
                                        {post.title}
                                    </option>
                                ))}
                            </select>
                            <span className="select-arrow">▼</span>
                        </div>
                    </div>

                    <div className="cv-analyze-section">
                        <label className="cv-analyze-label">CV Yükleyin:</label>
                        <div className="cv-analyze-file-upload">
                            <input
                                type="file"
                                id="cv-file-input"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="cv-file-input"
                            />
                            <label htmlFor="cv-file-input" className="cv-file-label">
                                {selectedFile ? selectedFile.name : 'CV Dökümanı'}
                            </label>
                        </div>
                    </div>

                    <button className="cv-analyze-button" onClick={handleAnalyze}>
                        AI Destekli Analiz Edin
                    </button>
                </div>

                {/* Sağ Panel - CV Listesi */}
                <div className="cv-analyze-right-panel">
                    <h3 className="cv-list-title">Pozisyon için gelen CV'ler</h3>
                    
                    <div className="cv-table-container">
                        <table className="cv-table">
                            <thead>
                                <tr>
                                    <th>CV Dökümanı</th>
                                    <th>Başvuran Bilgileri</th>
                                    <th className="score-column">
                                        Puan
                                        <span className="sort-indicator">↓</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cvList.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="empty-state">
                                            Henüz CV yüklenmemiş. Sol panelden CV yükleyip analiz edin.
                                        </td>
                                    </tr>
                                ) : (
                                    cvList.map((cv, index) => (
                                        <tr key={index}>
                                            <td>{cv.document}</td>
                                            <td>{cv.applicantInfo}</td>
                                            <td>{cv.score}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVAnalyze;

