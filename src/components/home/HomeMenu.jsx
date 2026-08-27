import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import './HomeMenu.css';

export const HomeMenu = ({ onSelectMode, onJoinRoomById, playerName, setPlayerName, setAlertMsg, avatar, setAvatar }) => {
  const avatars = [
    { id: 'teu', src: '/avatars/teu.png', name: 'Chú Tễu' },
    { id: 'girl', src: '/avatars/girl.png', name: 'Cô Thắm' },
    { id: 'phuong', src: '/avatars/phuong.png', name: 'Phú Ông' },
    { id: 'dog', src: '/avatars/dog.png', name: 'Cậu Vàng' }
  ];
  
  const [roomId, setRoomId] = useState('');
  const [menuView, setMenuView] = useState('hub');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setAlertMsg("Vui lòng nhập Mã Phòng!");
      return;
    }
    onJoinRoomById(roomId.trim().toUpperCase());
  };

  const checkAndGoLoto = () => {
    if (!playerName.trim()) {
      setAlertMsg("Vui lòng nhập Danh xưng của bạn trước nhé!");
      return;
    }
    setMenuView('loto');
  };

  const handleDisabledGameClick = (gameName) => {
    setAlertMsg(`Tính năng ${gameName} đang được xây dựng. Bạn quay lại sau nhé!`);
  };

  return (
    <div className="home-menu-container">
      {menuView === 'hub' ? (
        <>
          <div className="title-wrapper">
            <h1 className="folk-title">HỘI CHỢ DÂN GIAN</h1>
            <p className="folk-subtitle">Lựa chọn trò chơi để bắt đầu</p>
          </div>

          <Card className="menu-card hub-card">
            <div className="menu-options">
              {/* Form Nhập Tên */}
              <div className="name-form">
                <span className="folk-label">DANH XƯNG CỦA BẠN:</span>
                <Input 
                  placeholder="Ví dụ: Tý, Tèo..." 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="folk-input name-input"
                />
              </div>

              <div className="avatar-selection">
                <span className="folk-label">CHỌN NHÂN VẬT:</span>
                <div className="avatar-list">
                  {avatars.map(av => (
                    <img 
                      key={av.id} 
                      src={av.src} 
                      alt={av.name} 
                      title={av.name}
                      className={`avatar-option ${avatar === av.src ? 'selected' : ''}`}
                      onClick={() => setAvatar(av.src)}
                    />
                  ))}
                </div>
              </div>

              <div className="divider-folk">
                <span className="divider-line"></span>
                <span className="divider-text">CHỌN TRÒ CHƠI</span>
                <span className="divider-line"></span>
              </div>

              <div className="game-hub-grid">
                <div className="game-card" onClick={checkAndGoLoto}>
                  <img src="/favicon.png" alt="Lô Tô" className="game-card-logo" />
                  <h3 className="game-card-title">LÔ TÔ</h3>
                </div>
                <div className="game-card disabled" onClick={() => handleDisabledGameClick('Bầu Cua Tôm Cá')}>
                  <img src="/logo_bau_cua.png" alt="Bầu Cua" className="game-card-logo" />
                  <h3 className="game-card-title">BẦU CUA</h3>
                </div>
                <div className="game-card disabled" onClick={() => handleDisabledGameClick('Ô Ăn Quan')}>
                  <img src="/logo_o_an_quan.png" alt="Ô Ăn Quan" className="game-card-logo" />
                  <h3 className="game-card-title">Ô ĂN QUAN</h3>
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="title-wrapper">
            <img src="/favicon.png" alt="Logo Lô Tô" className="folk-logo-large" />
            <h1 className="folk-title">HỘI LÔ TÔ</h1>
            <p className="folk-subtitle">Đầu làng cuối xóm, vui chơi có thưởng</p>
          </div>
          
          <Card className="menu-card">
            <div className="menu-options">
              <Button variant="secondary" onClick={() => setMenuView('hub')}>
                ⬅ QUAY LẠI SẢNH CHÍNH
              </Button>
              
              <div className="divider-folk">
                <span className="divider-line"></span>
              </div>

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
        </>
      )}
    </div>
  );
};
