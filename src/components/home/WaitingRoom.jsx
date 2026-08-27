import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BingoBoard } from '../bingo/BingoBoard';
import { generateBingoBoard } from '../../utils/gameLogic';
import * as roomService from '../../services/roomService';
import './WaitingRoom.css';

export const WaitingRoom = ({ roomId, roomData, myPlayerId, onStart, onBack, setAlertMsg, board, setBoard }) => {
  const [copied, setCopied] = useState(false);
  const isHost = roomData?.players?.[myPlayerId]?.isHost || false;
  const players = Object.entries(roomData?.players || {}).map(([id, p]) => ({ ...p, id }));
  const rows = roomData?.settings.rows || 5;
  const cols = roomData?.settings.cols || 5;

  useEffect(() => {
    // Generate initial board on mount based on shared pool
    if (roomData?.sharedPool && board.length === 0) {
      setBoard(generateBingoBoard(rows, cols, roomData.sharedPool, roomData.settings.gameMode));
    }
  }, [roomData?.sharedPool, rows, cols, board.length, setBoard, roomData?.settings?.gameMode]);

  const handleKickPlayer = async (playerId) => {
    if (isHost && playerId !== myPlayerId) {
      try {
        await roomService.removePlayer(roomId, playerId);
      } catch (err) {
        setAlertMsg("Lỗi khi mời người chơi ra: " + err.message);
      }
    }
  };

  const handleShuffleBoard = () => {
    if (roomData?.sharedPool) {
      setBoard(generateBingoBoard(rows, cols, roomData.sharedPool, roomData.settings.gameMode));
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (isHost) {
      await roomService.updateTheme(roomId, newTheme);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setAlertMsg("Không thể copy mã, vui lòng copy thủ công!");
    }
  };

  return (
    <div className="waiting-room-container">
      <div className="header-bar">
        <Button variant="secondary" onClick={onBack}>⬅ RỜI PHÒNG</Button>
      </div>

      <Card className="waiting-card">
        <div className="waiting-header">
          <h2 className="room-title">{roomData?.settings.roomName || 'SẢNH CHỜ'}</h2>
          <div 
            className="room-id-box clickable" 
            onClick={handleCopyCode}
            title="Nhấn để Copy"
          >
            <span className="label">MÃ PHÒNG:</span>
            <div className="code-container">
              <span className="code">{roomId}</span>
              <span className="copy-icon">📋</span>
            </div>
            {copied && <span className="copy-tooltip">Đã Copy!</span>}
          </div>
          <p className="instruction">Hãy gửi mã này cho bạn bè để họ cùng tham gia!</p>
          
          {isHost && (
            <div className="host-theme-selector">
              <label>ĐỔI GIAO DIỆN:</label>
              <div className="theme-pills">
                <button 
                  className={`theme-pill ${roomData?.settings?.theme === 'classic' || !roomData?.settings?.theme ? 'active' : ''}`}
                  onClick={() => handleThemeChange('classic')}
                >
                  🪵 Hội Làng
                </button>
                <button 
                  className={`theme-pill ${roomData?.settings?.theme === 'ocean' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('ocean')}
                >
                  🌊 Biển Cả
                </button>
                <button 
                  className={`theme-pill ${roomData?.settings?.theme === 'tet' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('tet')}
                >
                  🏮 Tết Quê
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="room-content-split">
          {/* Cột trái: Người chơi */}
          <div className="players-list-box">
            <h3 className="list-heading">NGƯỜI CHƠI ({players.length}/10)</h3>
            <ul className="players-list">
              {players.map((p) => (
                <li key={p.id || p.name} className="player-item">
                  <div className="player-info-basic">
                    <span className="player-avatar">👤</span>
                    <span className="player-name">{p.name} {p.id === myPlayerId && "(Bạn)"}</span>
                    {p.isHost && <span className="host-badge">Chủ bàn</span>}
                  </div>
                  {isHost && p.id !== myPlayerId && (
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
              {board.length > 0 ? (
                <BingoBoard 
                  board={board} 
                  rows={rows} 
                  cols={cols}
                  theme={roomData?.settings?.theme || 'classic'}
                  mode={roomData?.settings?.gameMode || 'classic'}
                />
              ) : (
                <div style={{textAlign: 'center', padding: '2rem'}}>Đang tải bảng...</div>
              )}
            </div>
          </div>
        </div>

        {isHost ? (
          <div className="host-actions">
            <Button onClick={() => onStart()} variant="primary" className="btn-start-game">
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
