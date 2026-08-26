import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import './GameSettings.css';

export const GameSettings = ({ onStartGame, onBack }) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [requiredLines, setRequiredLines] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rows > 0 && cols > 0 && rows <= 10 && cols <= 10 && requiredLines > 0) {
      onStartGame(Number(rows), Number(cols), Number(requiredLines));
    } else {
      alert("Vui lòng nhập cấu hình hợp lệ!");
    }
  };

  return (
    <div className="game-settings-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ QUAY LẠI</Button>
      </div>
      <Card title="CẤU HÌNH PHÒNG GAME" className="max-w-md mx-auto settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="input-row">
            <Input 
              label="SỐ HÀNG (ROWS)" 
              type="number" 
              min="2" max="10" 
              value={rows} 
              onChange={(e) => setRows(e.target.value)} 
            />
            <Input 
              label="SỐ CỘT (COLS)" 
              type="number" 
              min="2" max="10" 
              value={cols} 
              onChange={(e) => setCols(e.target.value)} 
            />
          </div>
          <Input 
            label="SỐ ĐƯỜNG BINGO ĐỂ THẮNG (LINES)" 
            type="number" 
            min="1" max={Math.max(rows, cols) + 2} 
            value={requiredLines} 
            onChange={(e) => setRequiredLines(e.target.value)} 
            style={{ borderColor: 'var(--color-secondary)' }}
          />
          <Button type="submit" variant="primary" className="start-btn">
            TẠO PHÒNG & BẮT ĐẦU
          </Button>
        </form>
      </Card>
    </div>
  );
};
