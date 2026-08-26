import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import './HomeMenu.css';

export const HomeMenu = ({ onSelectMode, onJoinRoomById }) => {
  const [roomId, setRoomId] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoinRoomById(roomId.trim());
    }
  };

  return (
    <div className="home-menu-container">
      <div className="title-wrapper">
        <h1 className="folk-title">HỘI LÔ TÔ</h1>
        <p className="folk-subtitle">Đầu làng cuối xóm, vui chơi có thưởng</p>
      </div>
      
      <Card className="menu-card">
        <div className="menu-options">
          {/* Form tham gia bằng ID */}
          <form className="join-form" onSubmit={handleJoinSubmit}>
            <Input 
              placeholder="Nhập Mã Phòng..." 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="folk-input"
            />
            <Button type="submit" variant="primary" className="btn-join-id">
              VÀO NGAY
            </Button>
          </form>

          <div className="divider-folk">
            <span className="divider-line"></span>
            <span className="divider-text">Hoặc</span>
            <span className="divider-line"></span>
          </div>
          
          <Button 
            className="menu-btn btn-lan" 
            onClick={() => onSelectMode('lan')}
          >
            TÌM BÀN XUNG QUANH (LAN)
          </Button>
          
          <Button 
            className="menu-btn btn-online" 
            onClick={() => onSelectMode('online')}
          >
            TÌM BÀN THIÊN HẠ (ONLINE)
          </Button>

          <Button 
            className="menu-btn btn-create" 
            variant="primary"
            onClick={() => onSelectMode('create')}
          >
            MỞ BÀN MỚI
          </Button>
        </div>
      </Card>
    </div>
  );
};
