import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BingoBoard } from '../bingo/BingoBoard';
import { generateBingoBoard } from '../../utils/gameLogic';
import './WaitingRoom.css';

export const WaitingRoom = ({ roomId, isHost, onStart, onBack, rows = 5, cols = 5 }) => {
  // Mock players list
  const [players, setPlayers] = useState([
    { id: '1', name: 'Chủ phòng (Bạn)' }
  ]);
  
  // Personal board setup
  const [personalBoard, setPersonalBoard] = useState([]);

  useEffect(() => {
    // Generate initial board on mount
    setPersonalBoard(generateBingoBoard(rows, cols));
  }, [rows, cols]);

  const addMockPlayer = () => {
    if (players.length >= 10) return;
    setPlayers([
      ...players, 
      { id: Date.now().toString(), name: `Người chơi ${players.length + 1}` }
    ]);
  };

  const handleShuffleBoard = () => {
    setPersonalBoard(generateBingoBoard(rows, cols));
  };

  const handleCellEdit = (cellId) => {
    const newValue = prompt("Nhập số mới cho ô này (1 - 99):");
    if (newValue === null || newValue.trim() === '') return;
    
    const num = parseInt(newValue, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      alert("Vui lòng nhập số hợp lệ từ 1 đến 99!");
      return;
    }

    // Check for duplicates
    if (personalBoard.some(c => c.value === num && c.id !== cellId)) {
      alert("Số này đã tồn tại trong bảng!");
      return;
    }

    setPersonalBoard(board => board.map(cell => 
      cell.id === cellId ? { ...cell, value: num } : cell
    ));
  };

  return (
    <div className="waiting-room-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ RỜI PHÒNG</Button>
      </div>

      <Card className="waiting-card">
        <div className="waiting-header">
          <h2 className="room-title">SẢNH CHỜ</h2>
          <div className="room-id-box">
            <span className="label">MÃ PHÒNG:</span>
            <span className="code">{roomId}</span>
          </div>
          <p className="instruction">Hãy gửi mã này cho bạn bè để họ cùng tham gia!</p>
        </div>

        <div className="room-content-split">
          {/* Cột trái: Người chơi */}
          <div className="players-list-box">
            <h3 className="list-heading">NGƯỜI CHƠI ({players.length}/10)</h3>
            <ul className="players-list">
              {players.map((p, index) => (
                <li key={p.id} className="player-item">
                  <span className="player-avatar">👤</span>
                  <span className="player-name">{p.name}</span>
                  {index === 0 && <span className="host-badge">Chủ bàn</span>}
                </li>
              ))}
              {players.length < 10 && (
                <li className="player-item empty">
                  <span>... Đang đợi thêm người ...</span>
                </li>
              )}
            </ul>
          </div>

          {/* Cột phải: Bảng cá nhân (Chuẩn bị) */}
          <div className="personal-board-setup">
            <h3 className="list-heading">BẢNG CỦA BẠN</h3>
            <p className="setup-hint">Bấm "Xáo trộn" hoặc bấm vào ô để tự nhập số (1-99)</p>
            
            <div className="setup-actions">
              <Button onClick={handleShuffleBoard} variant="secondary" className="btn-shuffle">
                🎲 XÁO TRỘN
              </Button>
            </div>

            <div className="preview-board-wrapper">
              <BingoBoard 
                board={personalBoard} 
                rows={rows} 
                cols={cols} 
                onCellSelect={handleCellEdit} 
              />
            </div>
          </div>
        </div>

        {isHost ? (
          <div className="host-actions">
            <Button onClick={addMockPlayer} variant="secondary" className="btn-mock">
              + Giả lập người vào
            </Button>
            <Button onClick={() => onStart(personalBoard)} variant="primary" className="btn-start-game">
              BẮT ĐẦU CHƠI ({players.length} NGƯỜI)
            </Button>
          </div>
        ) : (
          <div className="guest-waiting">
            <div className="spinner"></div>
            <p>Đang chờ chủ phòng bắt đầu...</p>
          </div>
        )}
      </Card>
    </div>
  );
};
