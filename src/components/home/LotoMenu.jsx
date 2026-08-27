import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import './HomeMenu.css';

export const LotoMenu = ({ onSelectMode, onJoinRoomById, setAlertMsg }) => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setAlertMsg("Vui lòng nhập Mã Phòng!");
      return;
    }
    onJoinRoomById(roomId.trim().toUpperCase());
  };

  return (
    <div className="home-menu-container">
      <div className="title-wrapper">
        <img src="/favicon.png" alt="Logo Lô Tô" className="folk-logo-large" />
        <h1 className="folk-title">HỘI LÔ TÔ</h1>
        <p className="folk-subtitle">Đầu làng cuối xóm, vui chơi có thưởng</p>
      </div>
      
      <Card className="menu-card">
        <div className="menu-options">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ⬅ QUAY LẠI SẢNH CHÍNH
          </Button>
          
          <div className="divider-folk">
            <span className="divider-line"></span>
          </div>

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
