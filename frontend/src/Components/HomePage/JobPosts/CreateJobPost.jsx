import React, { useEffect, useState } from 'react';
import './CreateJobPost.css';
import axiosInstance from '../../../api/axiosInstance'; // Merkezi axios instance'ı dahil et

const CreateJobPost = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [expectations, setExpectations] = useState('');
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [departmentError, setDepartmentError] = useState('');
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sayfa yüklendiğinde departmanları getir
    useEffect(() => {
        const fetchDepartments = async () => {
            setIsLoadingDepartments(true);
            setDepartmentError('');

            try {
                // axiosInstance kullanıyoruz - token otomatik eklenir
                const response = await axiosInstance.get('/departments');

                if (response.data.success) {
                    // Backend'den gelen veriyi düzenle
                    const normalized = response.data.data.map((department) => ({
                        id: department.departmentid,
                        name: department.departmentname
                    }));
                    setDepartments(normalized);
                } else {
                    throw new Error(response.data.message || 'Departmanlar yüklenemedi.');
                }

            } catch (error) {
                // Hata mesajını göster
                setDepartmentError(error.response?.data?.message || error.message);
            } finally {
                setIsLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, []);

    // Form gönderildiğinde çalışır
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitStatus({ type: '', message: '' });

        // Departman seçilmemiş mi kontrol et
        if (!selectedDepartmentId) {
            setSubmitStatus({
                type: 'error',
                message: 'Lütfen bir departman seçin.'
            });
            return;
        }

        // Beklentiler boş mu kontrol et
        if (!expectations.trim()) {
            setSubmitStatus({
                type: 'error',
                message: 'Beklentiler alanı boş bırakılamaz.'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // axiosInstance ile iş ilanı oluştur - token otomatik eklenir
            const response = await axiosInstance.post('/jobposts', {
                departmentId: Number(selectedDepartmentId),
                expectations: expectations.trim()
            });

            if (response.data.success) {
                // Başarılı - formu temizle
                setSubmitStatus({
                    type: 'success',
                    message: 'İlan başarıyla oluşturuldu.'
                });
                setSelectedDepartmentId('');
                setExpectations('');
            } else {
                throw new Error(response.data.message || 'İş ilanı oluşturulamadı.');
            }

        } catch (error) {
            // Hata mesajını göster
            setSubmitStatus({
                type: 'error',
                message: error.response?.data?.message || error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="content-card job-post-card" onSubmit={handleSubmit}>
            <div className="job-post-header">
                <div>
                    <h2>İş İlanı Oluştur</h2>
                    <p>Departmanı seçin, rol beklentilerini belirtin ve dilediğiniz dosyayı ekleyin.</p>
                </div>
            </div>

            <div className="job-post-section">
                <label className="job-post-label">Departman</label>
                <div className="job-post-select">
                    <select
                        value={selectedDepartmentId}
                        onChange={(event) => setSelectedDepartmentId(event.target.value)}
                        disabled={isLoadingDepartments}
                    >
                        <option value="">
                            {isLoadingDepartments ? 'Departmanlar yükleniyor...' : 'Departman seçiniz'}
                        </option>
                        {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>
                    <span className="select-arrow">v</span>
                </div>
                {departmentError && <small className="job-post-hint error">{departmentError}</small>}
            </div>

            <div className="job-post-section">
                <label className="job-post-label">Beklentiler</label>
                <textarea
                    className="job-post-textarea"
                    value={expectations}
                    onChange={(event) => setExpectations(event.target.value)}
                    rows={5}
                />
                <small className="job-post-hint">Her maddeyi yeni satırda tutarak aday için net beklentiler oluşturun.</small>
            </div>

            {submitStatus.message && (
                <div className={`job-post-status-message ${submitStatus.type}`} role="status" aria-live="polite">
                    {submitStatus.message}
                </div>
            )}

            <div className="job-post-actions">
                <button type="submit" className="action-btn" disabled={isSubmitting || isLoadingDepartments}>
                    {isSubmitting ? 'Yükleniyor...' : 'İlanı Yayınla'}
                </button>
            </div>
        </form>
    );
};

export default CreateJobPost;