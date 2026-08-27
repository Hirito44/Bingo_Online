import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import './GameSettings.css';

export const GameSettings = ({ onStartGame, onBack, setAlertMsg, playerName }) => {
  const [roomName, setRoomName] = useState(`Phòng của ${playerName || 'Người Lạ'}`);
  const [size, setSize] = useState(5);
  const [requiredLines, setRequiredLines] = useState(1);
  const [gameMode, setGameMode] = useState('classic');

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedSize = gameMode === 'standard' ? 3 : Number(size);
    const parsedCols = gameMode === 'standard' ? 9 : parsedSize;
    const parsedLines = gameMode === 'standard' ? 1 : Number(requiredLines);
    
    let newErrors = {};

    if (!roomName || !roomName.trim()) {
      newErrors.roomName = "Vui lòng nhập Tên Bàn Chơi!";
    }
    
    if (gameMode === 'classic') {
      if (!Number.isInteger(parsedSize) || parsedSize < 3 || parsedSize > 10) {
        newErrors.size = "Kích thước bảng phải là số nguyên từ 3 đến 10!";
      }
      if (!Number.isInteger(parsedLines) || parsedLines < 1 || parsedLines > parsedSize) {
        newErrors.requiredLines = `Số xiên để thắng phải là số nguyên từ 1 đến ${parsedSize || 5}!`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onStartGame(roomName.trim(), parsedSize, parsedCols, parsedLines, gameMode);
  };

  return (
    <div className="game-settings-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ QUAY LẠI</Button>
      </div>
      <Card title="CẤU HÌNH BÀN CHƠI" className="max-w-md mx-auto settings-card">
        <form onSubmit={handleSubmit} className="settings-form" noValidate>
          
          <Input 
            label="TÊN BÀN CHƠI" 
            type="text" 
            placeholder="VD: Hội Lô Tô Xóm Chùa"
            value={roomName} 
            onChange={(e) => { setRoomName(e.target.value); setErrors({...errors, roomName: ''}); }} 
            className="glass-input"
            error={errors.roomName}
          />

          <div className="input-group">
            <label className="input-label">LUẬT CHƠI</label>
            <div className="mode-selector">
              <label className={`mode-option ${gameMode === 'classic' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="gameMode" 
                  value="classic" 
                  checked={gameMode === 'classic'} 
                  onChange={() => setGameMode('classic')}
                  className="hidden-radio"
                />
                <span className="mode-name">Bingo Cổ Điển</span>
              </label>
              <label className={`mode-option ${gameMode === 'standard' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="gameMode" 
                  value="standard" 
                  checked={gameMode === 'standard'} 
                  onChange={() => setGameMode('standard')}
                  className="hidden-radio"
                />
                <span className="mode-name">Lô Tô Truyền Thống</span>
              </label>
            </div>
          </div>

          {gameMode === 'classic' && (
            <>
              <Input 
                label={`KÍCH THƯỚC BẢNG (${size}x${size})`} 
                type="number" 
                min="3" max="10" 
                value={size} 
                onChange={(e) => { setSize(e.target.value); setErrors({...errors, size: ''}); }} 
                className="glass-input"
                error={errors.size}
              />
              
              <Input 
                label="SỐ XIÊN ĐỂ THẮNG" 
                type="number" 
                min="1" max={size} 
                value={requiredLines} 
                onChange={(e) => { setRequiredLines(e.target.value); setErrors({...errors, requiredLines: ''}); }} 
                className="glass-input"
                error={errors.requiredLines}
              />
            </>
          )}
          
          <Button type="submit" variant="primary" className="start-btn">
            TẠO PHÒNG
          </Button>
        </form>
      </Card>
    </div>
  );
};
