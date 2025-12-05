import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import './CVAnalyze.css';

const CVAnalyze = () => {
    const [selectedJobPost, setSelectedJobPost] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [cvList, setCvList] = useState([]);
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // İş ilanlarını yükle
    useEffect(() => {
        loadJobPosts();
    }, []);

    // Seçilen iş ilanı değiştiğinde CV listesini yükle
    useEffect(() => {
        if (selectedJobPost) {
            loadCVsByJobPost(selectedJobPost);
        } else {
            setCvList([]);
        }
    }, [selectedJobPost]);

    const loadJobPosts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/jobposts');
            console.log('JobPosts Response:', response);
            console.log('JobPosts Response Data:', response.data);
            
            // Response kontrolü - success field'ı varsa kontrol et, yoksa direkt data'yı kullan
            if (response.data) {
                if (response.data.success === false) {
                    console.error('JobPosts API Error:', response.data.message);
                    alert(response.data.message || 'İş ilanları yüklenirken hata oluştu.');
                    setJobPosts([]);
                } else if (response.data.success === true || response.data.jobPosts) {
                    setJobPosts(response.data.jobPosts || []);
                } else {
                    // Eğer response.data direkt array ise
                    if (Array.isArray(response.data)) {
                        setJobPosts(response.data);
                    } else {
                        console.warn('Unexpected response format:', response.data);
                        setJobPosts([]);
                    }
                }
            } else {
                console.error('Empty response received');
                alert('İş ilanları yüklenirken hata oluştu: Boş yanıt alındı.');
                setJobPosts([]);
            }
        } catch (error) {
            console.error('İş ilanları yüklenirken hata:', error);
            console.error('Error Response:', error.response?.data);
            console.error('Error Status:', error.response?.status);
            const errorMessage = error.response?.data?.message || error.message || 'İş ilanları yüklenirken hata oluştu.';
            alert(errorMessage);
            setJobPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCVsByJobPost = async (jobPostId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/cv/jobpost/${jobPostId}`);
            if (response.data.success) {
                setCvList(response.data.cvs || []);
            }
        } catch (error) {
            console.error('CV listesi yüklenirken hata:', error);
            alert('CV listesi yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
        }
    };

    const handleUploadCVs = async () => {
        if (!selectedJobPost) {
            alert('Lütfen bir iş ilanı seçiniz.');
            return;
        }

        if (selectedFiles.length === 0) {
            alert('Lütfen en az bir CV dosyası seçiniz.');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            
            // Çoklu dosya ekle
            selectedFiles.forEach((file) => {
                formData.append('cv', file);
            });
            
            formData.append('jobPostId', selectedJobPost);
            // Başvuran bilgisi backend'de dosya adından otomatik çıkarılacak

            const response = await axiosInstance.post('/cv/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 120000, // CV yükleme için 120 saniye (2 dakika) timeout
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Yükleme ilerlemesi: ${percentCompleted}%`);
                    }
                }
            });

            if (response.data.success) {
                alert(response.data.message || `${selectedFiles.length} adet CV başarıyla yüklendi.`);
                setSelectedFiles([]);
                // CV listesini yenile
                await loadCVsByJobPost(selectedJobPost);
            } else {
                alert(response.data.message || 'CV yüklenirken hata oluştu.');
            }
        } catch (error) {
            console.error('CV yükleme hatası:', error);
            
            let errorMessage = 'CV yüklenirken hata oluştu.';
            
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                errorMessage = 'CV yükleme işlemi zaman aşımına uğradı. Dosyalar çok büyük olabilir veya internet bağlantınız yavaş olabilir. Lütfen daha az dosya seçerek tekrar deneyin.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedJobPost) {
            alert('Lütfen bir iş ilanı seçiniz.');
            return;
        }

        if (!window.confirm('Seçilen iş ilanı için analiz edilmemiş tüm CV\'leri analiz etmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            setAnalyzing(true);
            
            // Önce analiz edilmemiş CV ID'lerini al
            const listResponse = await axiosInstance.post(`/cv/analyze/${selectedJobPost}`);
            
            if (!listResponse.data.success) {
                alert(listResponse.data.message || 'Analiz edilmemiş CV listesi alınamadı.');
                return;
            }

            const { cvIds, totalCount } = listResponse.data;

            if (totalCount === 0) {
                alert('Analiz edilecek CV bulunamadı.');
                setAnalyzing(false);
                return;
            }

            // Her CV'yi tek tek sırayla analiz et
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < cvIds.length; i++) {
                const cvId = cvIds[i];
                try {
                    console.log(`CV ${i + 1}/${cvIds.length} analiz ediliyor (ID: ${cvId})...`);
                    
                    const analyzeResponse = await axiosInstance.post(`/cv/analyze-single/${cvId}`);
                    
                    if (analyzeResponse.data.success) {
                        successCount++;
                        console.log(`CV ${cvId} başarıyla analiz edildi.`);
                    } else {
                        failCount++;
                        console.error(`CV ${cvId} analiz hatası:`, analyzeResponse.data.message);
                    }

                    // Her analiz sonrası CV listesini yenile (son CV'yi görmek için)
                    await loadCVsByJobPost(selectedJobPost);

                    // API rate limit'i için kısa bir bekleme (son CV değilse)
                    if (i < cvIds.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }

                } catch (error) {
                    failCount++;
                    console.error(`CV ${cvId} analiz hatası:`, error);
                    // Hata olsa bile diğer CV'lere devam et
                }
            }

            alert(`${successCount} adet CV başarıyla analiz edildi.${failCount > 0 ? ` ${failCount} adet CV analiz edilemedi.` : ''}`);
            
            // Son bir kez CV listesini yenile
            await loadCVsByJobPost(selectedJobPost);

        } catch (error) {
            console.error('CV analiz hatası:', error);
            alert(error.response?.data?.message || 'CV analizi yapılırken hata oluştu.');
        } finally {
            setAnalyzing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                                disabled={loading}
                            >
                                <option value="">İş İlanları</option>
                                {jobPosts.map((post) => (
                                    <option key={post.jobpostid} value={post.jobpostid}>
                                        İş İlanı #{post.jobpostid} - Departman: {post.departmentid}
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
                                multiple
                            />
                            <label htmlFor="cv-file-input" className="cv-file-label">
                                {selectedFiles.length > 0 
                                    ? `${selectedFiles.length} dosya seçildi` 
                                    : 'CV Dökümanı (Çoklu seçim yapabilirsiniz)'}
                            </label>
                        </div>
                        {selectedFiles.length > 0 && (
                            <div className="selected-files-list">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="selected-file-item">
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        className="cv-upload-button" 
                        onClick={handleUploadCVs}
                        disabled={uploading || !selectedJobPost || selectedFiles.length === 0}
                    >
                        {uploading ? 'Yükleniyor...' : 'CV Yükleyin'}
                    </button>

                    <button 
                        className="cv-analyze-button" 
                        onClick={handleAnalyze}
                        disabled={analyzing || !selectedJobPost}
                    >
                        {analyzing ? 'Analiz Ediliyor...' : 'AI Destekli Analiz Edin'}
                    </button>
                </div>

                {/* Sağ Panel - CV Listesi */}
                <div className="cv-analyze-right-panel">
                    <h3 className="cv-list-title">Pozisyon için gelen CV'ler</h3>
                    
                    <div className="cv-table-container">
                        <table className="cv-table">
                            <thead>
                                <tr>
                                    <th>Başvuran Bilgileri</th>
                                    <th>Yüklenme Tarihi</th>
                                    <th className="score-column">
                                        Puan
                                        <span className="sort-indicator">↓</span>
                                    </th>
                                    <th>Durum</th>
                                    <th>AI Yorumu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            Yükleniyor...
                                        </td>
                                    </tr>
                                ) : cvList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            {selectedJobPost 
                                                ? 'Bu iş ilanı için henüz CV yüklenmemiş. Sol panelden CV yükleyip analiz edin.'
                                                : 'Lütfen bir iş ilanı seçiniz.'}
                                        </td>
                                    </tr>
                                ) : (
                                    cvList.map((cv) => (
                                        <tr key={cv.cvid}>
                                            <td>{cv.cvsenderinfo || '-'}</td>
                                            <td>{formatDate(cv.cvdate)}</td>
                                            <td>{cv.cvscore !== null ? cv.cvscore : '-'}</td>
                                            <td>
                                                <span className={`cv-status ${cv.checked ? 'checked' : 'unchecked'}`}>
                                                    {cv.checked ? '✓ Analiz Edildi' : '○ Beklemede'}
                                                </span>
                                            </td>
                                            <td className="ai-context-cell">
                                                {cv.aicontext ? (
                                                    <div className="ai-context" title={cv.aicontext}>
                                                        {cv.aicontext.length > 50 
                                                            ? cv.aicontext.substring(0, 50) + '...' 
                                                            : cv.aicontext}
                                                    </div>
                                                ) : '-'}
                                            </td>
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

