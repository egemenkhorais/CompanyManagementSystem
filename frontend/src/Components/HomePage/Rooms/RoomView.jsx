import React, { useState, useEffect } from 'react';
import { DoorOpen, MapPin } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import './RoomManagement.css';

const RoomView = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axiosInstance.get('/rooms');
            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (error) {
            console.error('Odalar yüklenirken hata:', error);
            alert('Odalar yüklenemedi!');
        } finally {
            setLoading(false);
        }
    };

    // Oda tipi etiketini göster
    const getRoomTypeBadge = (type) => {
        const typeConfig = {
            'Meeting': { label: 'Toplantı', color: '#9d4edd' },
            'Workspace': { label: 'Çalışma Alanı', color: '#3b82f6' },
            'Lounge': { label: 'Dinlenme', color: '#10b981' }
        };

        const config = typeConfig[type] || { label: type, color: '#9d4edd' };

        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: `${config.color}33`,
                color: config.color,
                border: `1px solid ${config.color}66`
            }}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="content-card">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="content-card">
            <div className="page-header">
                <div>
                    <h2>Toplantı Odaları</h2>
                    <p className="page-subtitle">Mevcut toplantı odalarını görüntüleyebilirsiniz.</p>
                </div>
            </div>

            <div className="rooms-grid">
                {rooms.length === 0 ? (
                    <div className="empty-state">
                        <DoorOpen size={48} color="#666" />
                        <p>Henüz oda bulunmuyor.</p>
                    </div>
                ) : (
                    rooms.map(room => (
                        <div key={room.id} className="room-card">
                            <div className="room-header">
                                <div>
                                    <h3>{room.roomname}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                        {getRoomTypeBadge(room.roomtype)}
                                        {room.roomdepartment && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <MapPin size={14} color="#9d4edd" />
                                                <span style={{ fontSize: '12px', color: '#b8b8b8' }}>
                                                    {room.roomdepartment}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RoomView;