import React, { useState, useEffect } from 'react';
import { getOnlineRooms } from '../../services/roomService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import './RoomList.css';

export const RoomList = ({ type, onBack, onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ fetch online vì LAN đã bị xóa
    const unsubscribe = getOnlineRooms((data) => {
      setRooms(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="room-list-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ QUAY LẠI</Button>
        <h2 className="list-title">
          {type === 'lan' ? 'PHÒNG TRONG MẠNG LAN' : 'PHÒNG ONLINE PUBLIC'}
        </h2>
      </div>

      <Card className="list-card">
        <div className="room-grid">
          {loading ? (
            <div className="loading-state">Đang tải danh sách phòng...</div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">Hiện tại chưa có bàn nào đang mở. Hãy Mở Bàn Mới nhé!</div>
          ) : (
            rooms.map(room => (
              <div key={room.id} className="room-item fade-in">
                <div className="room-info">
                  <span className="room-name">{room.name}</span>
                  <span className="room-id">Mã: {room.id}</span>
                </div>
                <div className="room-meta">
                  <span className="player-count">👤 {room.players}/{room.maxPlayers}</span>
                  <span className={`status-badge ${room.status}`}>
                    {room.status === 'waiting' ? 'Đang chờ' : 'Đang chơi'}
                  </span>
                  {room.isLocked && <span className="status-badge locked">🔒 Đã khoá</span>}
                </div>
                <Button 
                  variant="primary" 
                  className="join-btn"
                  disabled={room.status === 'playing' || room.players >= room.maxPlayers || room.isLocked}
                  onClick={() => onJoinRoom(room.id)}
                >
                  {room.isLocked ? 'ĐÃ KHOÁ' : 'VÀO PHÒNG'}
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
