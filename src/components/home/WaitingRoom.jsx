import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BingoBoard } from '../bingo/BingoBoard';
import { generateBingoBoard, generateSharedPool } from '../../utils/gameLogic';
import './WaitingRoom.css';

export const WaitingRoom = ({ roomId, roomName, isHost, onStart, onBack, rows = 5, cols = 5, playerName, setAlertMsg }) => {
  // Mock players list
  const [players, setPlayers] = useState([
    { id: '1', name: playerName || 'Chủ phòng (Bạn)' }
  ]);
  
  // Shared Pool & Personal board setup
  const [sharedPool, setSharedPool] = useState([]);
  const [personalBoard, setPersonalBoard] = useState([]);

  useEffect(() => {
    // Generate initial shared pool and board on mount
    const newPool = generateSharedPool(rows * cols);
    setSharedPool(newPool);
    setPersonalBoard(generateBingoBoard(rows, cols, newPool));
  }, [rows, cols]);

  const addMockPlayer = () => {
    if (players.length >= 10) return;
    setPlayers([
      ...players, 
      { id: Date.now().toString(), name: `Người chơi ảo ${players.length + 1}` }
    ]);
  };

  const handleKickPlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const handleShuffleBoard = () => {
    setPersonalBoard(generateBingoBoard(rows, cols, sharedPool));
  };

  return (
    <div className="waiting-room-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ RỜI PHÒNG</Button>
      </div>

      <Card className="waiting-card">
        <div className="waiting-header">
          <h2 className="room-title">{roomName || 'SẢNH CHỜ'}</h2>
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
                  <div className="player-info-basic">
                    <span className="player-avatar">👤</span>
                    <span className="player-name">{p.name}</span>
                    {index === 0 && <span className="host-badge">Chủ bàn</span>}
                  </div>
                  {isHost && index !== 0 && (
                    <button 
                      className="btn-kick" 
                      onClick={() => handleKickPlayer(p.id)}
                      title="Đuổi khỏi phòng"
                    >
                      X
                    </button>
                  )}
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
            <p className="setup-hint">Bấm "Xáo trộn" để đổi vị trí các số (Bộ số của mọi người là giống nhau)</p>
            
            <div className="setup-actions">
              <Button onClick={handleShuffleBoard} variant="secondary" className="btn-shuffle">
                🎲 XÁO TRỘN VỊ TRÍ
              </Button>
            </div>

            <div className="preview-board-wrapper">
              <BingoBoard 
                board={personalBoard} 
                rows={rows} 
                cols={cols}
              />
            </div>
          </div>
        </div>

        {isHost ? (
          <div className="host-actions">
            <Button onClick={addMockPlayer} variant="secondary" className="btn-mock">
              + Giả lập người vào
            </Button>
            <Button onClick={() => onStart(personalBoard, players)} variant="primary" className="btn-start-game">
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
