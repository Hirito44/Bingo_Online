import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import './GameSettings.css';

export const GameSettings = ({ onStartGame, onBack, setAlertMsg, playerName }) => {
  const [roomName, setRoomName] = useState(`Phòng của ${playerName || 'Người Lạ'}`);
  const [size, setSize] = useState(5);
  const [requiredLines, setRequiredLines] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setAlertMsg("Vui lòng nhập Tên Bàn Chơi!");
      return;
    }
    if (size >= 3 && size <= 10 && requiredLines > 0) {
      // Truyền thêm roomName
      onStartGame(roomName.trim(), Number(size), Number(size), Number(requiredLines));
    } else {
      setAlertMsg("Vui lòng nhập cấu hình hợp lệ (Kích thước 3-10)!");
    }
  };

  return (
    <div className="game-settings-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ QUAY LẠI</Button>
      </div>
      <Card title="CẤU HÌNH BÀN CHƠI" className="max-w-md mx-auto settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          
          <Input 
            label="TÊN BÀN CHƠI" 
            type="text" 
            placeholder="VD: Hội Lô Tô Xóm Chùa"
            value={roomName} 
            onChange={(e) => setRoomName(e.target.value)} 
            className="glass-input"
          />

          <Input 
            label={`KÍCH THƯỚC BẢNG (${size}x${size})`} 
            type="number" 
            min="3" max="10" 
            value={size} 
            onChange={(e) => setSize(e.target.value)} 
            className="glass-input"
          />
          
          <Input 
            label="SỐ XIÊN ĐỂ THẮNG" 
            type="number" 
            min="1" max={Number(size) + 2} 
            value={requiredLines} 
            onChange={(e) => setRequiredLines(e.target.value)} 
            className="glass-input"
          />
          
          <Button type="submit" variant="primary" className="start-btn">
            TẠO PHÒNG
          </Button>
        </form>
      </Card>
    </div>
  );
};
