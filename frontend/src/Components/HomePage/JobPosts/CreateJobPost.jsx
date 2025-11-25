import React, { useEffect, useState } from 'react';
import './CreateJobPost.css';

const CreateJobPost = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [expectations, setExpectations] = useState('');
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [departmentError, setDepartmentError] = useState('');
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            setIsLoadingDepartments(true);
            setDepartmentError('');

            try {
                const response = await fetch('http://127.0.0.1:5001/api/departments');
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Departmanlar yüklenemedi.');
                }

                const normalized = Array.isArray(result.data)
                    ? result.data.map((department) => ({
                          id: department.departmentid,
                          name: department.departmentname
                      }))
                    : [];

                setDepartments(normalized);
            } catch (error) {
                setDepartmentError(error.message);
            } finally {
                setIsLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitStatus({ type: '', message: '' });

        if (!selectedDepartmentId) {
            setSubmitStatus({
                type: 'error',
                message: 'Lütfen bir departman seçin.'
            });
            return;
        }

        if (!expectations.trim()) {
            setSubmitStatus({
                type: 'error',
                message: 'Beklentiler alanı boş bırakılamaz.'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://127.0.0.1:5001/api/jobposts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    departmentId: Number(selectedDepartmentId),
                    expectations: expectations.trim()
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'İş ilanı oluşturulamadı.');
            }

            setSubmitStatus({
                type: 'success',
                message: 'İlan başarıyla oluşturuldu.'
            });
            setSelectedDepartmentId('');
            setExpectations('');
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message
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

