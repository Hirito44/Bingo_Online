import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import './HomeMenu.css';

export const GameHub = ({ playerName, setPlayerName, avatar, setAvatar, setAlertMsg }) => {
  const navigate = useNavigate();

  const avatars = [
    { id: 'teu', src: '/avatars/teu.png', name: 'Chú Tễu' },
    { id: 'girl', src: '/avatars/girl.png', name: 'Cô Thắm' },
    { id: 'phuong', src: '/avatars/phuong.png', name: 'Phú Ông' },
    { id: 'dog', src: '/avatars/dog.png', name: 'Cậu Vàng' }
  ];

  const checkAndGoLoto = () => {
    if (!playerName.trim()) {
      setAlertMsg("Vui lòng nhập Danh xưng của bạn trước nhé!");
      return;
    }
    navigate('/loto');
  };

  const handleDisabledGameClick = (gameName) => {
    setAlertMsg(`Tính năng ${gameName} đang được xây dựng. Bạn quay lại sau nhé!`);
  };

  return (
    <div className="home-menu-container">
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
    </div>
  );
};
