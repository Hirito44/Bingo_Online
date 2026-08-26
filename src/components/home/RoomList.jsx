import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import './RoomList.css';

export const RoomList = ({ type, onBack, onJoinRoom }) => {
  // Mock data for now, waiting for Firebase
  const mockRooms = [
    { id: 'RM1', name: 'Phòng của Hieund54', players: 2, maxPlayers: 10, status: 'waiting' },
    { id: 'RM2', name: 'Bingo Cuối Tuần', players: 5, maxPlayers: 5, status: 'playing' },
    { id: 'RM3', name: 'Phòng VIP', players: 1, maxPlayers: 4, status: 'waiting' },
  ];

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
          {mockRooms.map(room => (
            <div key={room.id} className="room-item">
              <div className="room-info">
                <span className="room-name">{room.name}</span>
                <span className="room-id">Mã: {room.id}</span>
              </div>
              <div className="room-meta">
                <span className="player-count">👤 {room.players}/{room.maxPlayers}</span>
                <span className={`status-badge ${room.status}`}>
                  {room.status === 'waiting' ? 'Đang chờ' : 'Đang chơi'}
                </span>
              </div>
              <Button 
                variant="primary" 
                className="join-btn"
                disabled={room.status === 'playing' || room.players >= room.maxPlayers}
                onClick={() => onJoinRoom(room.id)}
              >
                VÀO PHÒNG
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
