import React, { useState, useEffect, useRef } from 'react';
import { HomeMenu } from './components/home/HomeMenu';
import { RoomList } from './components/home/RoomList';
import { WaitingRoom } from './components/home/WaitingRoom';
import { GameSettings } from './components/bingo/GameSettings';
import { BingoBoard } from './components/bingo/BingoBoard';
import { Button } from './components/ui/Button';
import { checkWinCondition, generateSharedPool } from './utils/gameLogic';
import * as roomService from './services/roomService';
import { playClickSound, playSlashSound, playWinSound } from './utils/audio';
import './App.css';

function App() {
  const [view, setView] = useState(() => sessionStorage.getItem('view') || 'home'); 
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem('playerName') || '');
  const [alertMsg, setAlertMsg] = useState('');
  
  const [myPlayerId] = useState(() => sessionStorage.getItem('myPlayerId') || Date.now().toString());
  const [currentRoomId, setCurrentRoomId] = useState(() => sessionStorage.getItem('currentRoomId') || '');
  const [roomData, setRoomData] = useState(null);

  const [board, setBoard] = useState(() => JSON.parse(sessionStorage.getItem('board')) || []);
  const [winningData, setWinningData] = useState(() => JSON.parse(sessionStorage.getItem('winningData')) || { isWin: false, currentLines: 0, winningLines: [] });

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('isSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const isLeavingRef = useRef(false);

  // Lưu trữ Local Storage cho Sound
  useEffect(() => {
    localStorage.setItem('isSoundEnabled', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  // Lưu trữ Session Storage
  useEffect(() => {
    sessionStorage.setItem('view', view);
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('myPlayerId', myPlayerId);
    sessionStorage.setItem('currentRoomId', currentRoomId);
    sessionStorage.setItem('board', JSON.stringify(board));
    sessionStorage.setItem('winningData', JSON.stringify(winningData));
  }, [view, playerName, myPlayerId, currentRoomId, board, winningData]);

  // Subscribe to Room
  useEffect(() => {
    if (currentRoomId) {
      const unsubscribe = roomService.subscribeToRoom(currentRoomId, (data) => {
        if (data) {
          // Kiểm tra xem mình có bị đuổi khỏi phòng không
          if (!data.players || !data.players[myPlayerId]) {
            if (!isLeavingRef.current) {
              setAlertMsg("Bạn đã bị Chủ phòng đuổi khỏi bàn!");
              handleBackToHome(true);
            }
            return;
          }

          setRoomData(data);
          
          // Lắng nghe chuyển trạng thái
          if (data.gameState.status === 'playing' && view !== 'playing') {
            setView('playing');
            // Chỉ reset nếu từ sảnh chờ vào
            if (view === 'waiting-room') {
              setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
            }
          }
          if (data.gameState.status === 'waiting' && view !== 'waiting-room') {
            setView('waiting-room');
            if (view === 'playing') {
              setBoard([]); // reset board
              setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
            }
          }
        } else {
          // Phòng bị xóa (Chủ phòng thoát)
          if (currentRoomId && !isLeavingRef.current) {
            setAlertMsg("Phòng chơi đã bị Chủ phòng giải tán!");
            handleBackToHome(true);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [currentRoomId, view]);

  // Sync my lines to server when I win or lines increase
  useEffect(() => {
    if (view === 'playing' && roomData && currentRoomId) {
      const myData = roomData.players[myPlayerId];
      if (myData && myData.lines !== winningData.currentLines) {
        roomService.updatePlayerLines(currentRoomId, myPlayerId, winningData.currentLines);
        if (winningData.isWin && !roomData.gameState.winner) {
          roomService.setWinner(currentRoomId, playerName);
        }
      }
    }
  }, [winningData.currentLines, winningData.isWin, view, currentRoomId, roomData, myPlayerId, playerName]);

  // Derived States
  const isHost = roomData?.players[myPlayerId]?.isHost || false;
  const turnOrder = roomData?.gameState.turnOrder || [];
  const currentTurnIndex = roomData?.gameState.currentTurnIndex || 0;
  const calledNumbers = roomData?.gameState.calledNumbers || [];
  const isMyTurn = turnOrder[currentTurnIndex] === myPlayerId;
  const requiredLines = roomData?.settings.requiredLines || 1;

  const handleSelectMode = (mode) => {
    if (!playerName.trim()) {
      setAlertMsg("Vui lòng nhập Danh xưng của bạn trước khi vào chơi nhé!");
      return;
    }
    if (mode === 'lan') setView('room-list-lan');
    if (mode === 'online') setView('room-list-online');
    if (mode === 'create') setView('create-room');
  };

  const handleJoinRoomById = async (id) => {
    if (!playerName.trim()) {
      setAlertMsg("Vui lòng nhập Danh xưng của bạn trước khi vào phòng!");
      return;
    }
    try {
      await roomService.joinRoom(id, { id: myPlayerId, name: playerName });
      setCurrentRoomId(id);
      setView('waiting-room');
    } catch (err) {
      if (err.message === 'RoomNotFound') {
        setAlertMsg("Phòng không tồn tại!");
      } else if (err.message === 'RoomAlreadyPlaying') {
        setAlertMsg("Phòng này đang trong ván chơi!");
      } else {
        setAlertMsg("Có lỗi xảy ra khi vào phòng: " + err.message);
      }
    }
  };

  const handleCreateRoomDone = async (roomName, rows, cols, reqLines, mode) => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Sinh tập số chung ngay lúc tạo phòng
    const pool = generateSharedPool(rows * cols, mode);
    
    await roomService.createRoom(
      newRoomId,
      { rows, cols, requiredLines: reqLines, roomName, theme: 'classic', gameMode: mode || 'classic' },
      { id: myPlayerId, name: playerName },
      pool
    );
    
    setCurrentRoomId(newRoomId);
    setView('waiting-room');
  };

  const handleStartGame = async () => {
    // Nếu là host, gọi service để bắt đầu
    if (isHost && roomData) {
      const players = Object.keys(roomData.players);
      const shuffledIds = players.sort(() => Math.random() - 0.5);
      await roomService.startGame(currentRoomId, shuffledIds);
    }
  };

  const handleCellSelect = async (id) => {
    if (view !== 'playing' || winningData.isWin || roomData?.gameState.winner) return;
    
    const gameMode = roomData?.settings.gameMode || 'classic';

    const cell = board.find(c => c.id === id);
    if (!cell || cell.value === null) return;

    if (gameMode === 'standard') {
      if (!cell.selected && calledNumbers.includes(cell.value)) {
        if (isSoundEnabled) playClickSound();
        const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
        setBoard(newBoard);
        
        const winResult = checkWinCondition(newBoard, roomData.settings.rows, roomData.settings.cols, requiredLines, gameMode);
        if (isSoundEnabled && winResult.currentLines > winningData.currentLines && !winResult.isWin) playSlashSound();
        if (isSoundEnabled && winResult.isWin && !winningData.isWin) playWinSound();
        
        setWinningData({ isWin: winResult.isWin, currentLines: winResult.currentLines, winningLines: winResult.winningLines });
      } else if (!cell.selected && !calledNumbers.includes(cell.value)) {
        setAlertMsg("Số này chưa được gọi!");
      }
      return;
    }

    if (isMyTurn) {
      if (!cell.selected && !calledNumbers.includes(cell.value)) {
        // Hô số: cập nhật board nội bộ
        if (isSoundEnabled) playClickSound();
        const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
        setBoard(newBoard);
        
        const winResult = checkWinCondition(newBoard, roomData.settings.rows, roomData.settings.cols, requiredLines, gameMode);
        if (isSoundEnabled && winResult.currentLines > winningData.currentLines && !winResult.isWin) playSlashSound();
        if (isSoundEnabled && winResult.isWin && !winningData.isWin) playWinSound();
        
        setWinningData({ isWin: winResult.isWin, currentLines: winResult.currentLines, winningLines: winResult.winningLines });
        
        // Gọi lên server
        await roomService.callNumber(currentRoomId, cell.value, (currentTurnIndex + 1) % turnOrder.length);
      } else if (!cell.selected && calledNumbers.includes(cell.value)) {
        // Gạch bù
        if (isSoundEnabled) playClickSound();
        const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
        setBoard(newBoard);
        
        const winResult = checkWinCondition(newBoard, roomData.settings.rows, roomData.settings.cols, requiredLines, gameMode);
        if (isSoundEnabled && winResult.currentLines > winningData.currentLines && !winResult.isWin) playSlashSound();
        if (isSoundEnabled && winResult.isWin && !winningData.isWin) playWinSound();
        
        setWinningData({ isWin: winResult.isWin, currentLines: winResult.currentLines, winningLines: winResult.winningLines });
      }
    } else {
      if (!cell.selected && calledNumbers.includes(cell.value)) {
        if (isSoundEnabled) playClickSound();
        const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
        setBoard(newBoard);
        
        const winResult = checkWinCondition(newBoard, roomData.settings.rows, roomData.settings.cols, requiredLines, gameMode);
        if (isSoundEnabled && winResult.currentLines > winningData.currentLines && !winResult.isWin) playSlashSound();
        if (isSoundEnabled && winResult.isWin && !winningData.isWin) playWinSound();
        
        setWinningData({ isWin: winResult.isWin, currentLines: winResult.currentLines, winningLines: winResult.winningLines });
      } else if (!cell.selected && !calledNumbers.includes(cell.value)) {
        setAlertMsg("Chưa đến lượt của bạn, không được tự ý Hô số!");
      }
    }
  };

  const handleBackToHome = (isForced = false) => {
    // React onClick thường truyền event object vào. Tránh việc event object làm isForced thành true
    if (typeof isForced === 'object') {
      isForced = false;
    }

    isLeavingRef.current = true;
    if (currentRoomId && !isForced) {
      if (roomData?.players[myPlayerId]?.isHost) {
        roomService.deleteRoom(currentRoomId);
      } else {
        roomService.removePlayer(currentRoomId, myPlayerId);
      }
    }
    setView('home');
    setBoard([]);
    setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
    setCurrentRoomId('');
    setRoomData(null);
    sessionStorage.clear(); // Xóa sạch session khi cố tình rời bàn
    
    // Reset cờ sau khi xử lý xong để lần chơi sau bình thường
    setTimeout(() => {
      isLeavingRef.current = false;
    }, 500);
  };

  const handlePlayAgain = () => {
    if (isHost) {
      roomService.playAgain(currentRoomId);
    } else {
       setAlertMsg("Đang chờ chủ phòng chơi ván mới...");
    }
  };

  return (
    <div className="app-container">
      <button 
        className="sound-toggle-btn" 
        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
        title={isSoundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
      >
        {isSoundEnabled ? '🔊' : '🔇'}
      </button>

      {view !== 'home' && (
        <header className="mini-header" onClick={handleBackToHome}>
          <span className="logo-text">HỘI LÔ TÔ</span>
        </header>
      )}

      <main className="app-main">
        {view === 'home' && (
          <HomeMenu 
            onSelectMode={handleSelectMode} 
            onJoinRoomById={handleJoinRoomById} 
            playerName={playerName}
            setPlayerName={setPlayerName}
            setAlertMsg={setAlertMsg}
          />
        )}

        {view === 'room-list-lan' && (
          <RoomList type="lan" onBack={handleBackToHome} onJoinRoom={handleJoinRoomById} />
        )}

        {view === 'room-list-online' && (
          <RoomList type="online" onBack={handleBackToHome} onJoinRoom={handleJoinRoomById} />
        )}

        {view === 'create-room' && (
          <GameSettings 
            onStartGame={handleCreateRoomDone} 
            onBack={handleBackToHome} 
            setAlertMsg={setAlertMsg} 
            playerName={playerName} 
          />
        )}

        {view === 'waiting-room' && roomData && (
          <WaitingRoom 
            roomId={currentRoomId} 
            roomData={roomData}
            myPlayerId={myPlayerId}
            onStart={handleStartGame} 
            onBack={handleBackToHome} 
            setAlertMsg={setAlertMsg}
            board={board}
            setBoard={setBoard}
          />
        )}

        {view === 'playing' && roomData && (
          <div className="game-area fade-in">
            <div className="calling-section">
              {roomData.settings.gameMode === 'standard' ? (
                <div className="turn-indicator standard-mode">
                  {isHost ? (
                    <button 
                      className="draw-number-btn" 
                      onClick={() => roomService.drawRandomNumber(currentRoomId)}
                      disabled={winningData.isWin || roomData.gameState.winner}
                    >
                      🎲 BỐC SỐ
                    </button>
                  ) : (
                    <span className="waiting-host">Đang đợi Chủ Bàn bốc số...</span>
                  )}
                </div>
              ) : (
                <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
                  {isMyTurn ? "TỚI LƯỢT BẠN: HÃY CHỌN 1 SỐ TRÊN BẢNG ĐỂ HÔ" : `Đang đợi ${roomData.players[turnOrder[currentTurnIndex]]?.name} hô số...`}
                </div>
              )}
              
              <div className="called-history">
                <span className="history-label">ĐÃ HÔ:</span>
                <div className="history-numbers">
                  {calledNumbers.map((n, i) => (
                    <span key={i} className={`called-chip ${i === 0 ? 'latest' : ''}`}>{n}</span>
                  ))}
                  {calledNumbers.length === 0 && <span className="no-calls">Trận đấu bắt đầu!</span>}
                </div>
              </div>
            </div>

            <div className="game-status-bar">
              <div className="status-item">
                <span className="label">TIẾN ĐỘ CỦA BẠN:</span>
                <span className="value text-primary">{winningData.currentLines} / {requiredLines} XIÊN</span>
              </div>
            </div>

            <div className="main-playing-grid">
              <div className="board-section">
                <BingoBoard 
                  board={board} 
                  rows={roomData.settings.rows} 
                  cols={roomData.settings.cols}
                  theme={roomData.settings.theme || 'classic'}
                  mode={roomData.settings.gameMode || 'classic'}
                  onCellSelect={handleCellSelect}
                  winningLines={winningData.winningLines}
                  latestCalledNumber={calledNumbers[0]}
                />
              </div>
              
              <div className="players-progress-section">
                <h3 className="progress-title">BẢNG PHONG THẦN</h3>
                <ul className="progress-list">
                  {Object.entries(roomData.players).map(([id, p]) => {
                    const isMe = id === myPlayerId;
                    const lines = p.lines;
                    const isWinner = lines >= requiredLines;
                    
                    return (
                      <li key={id} className={`progress-item ${isMe ? 'is-me' : ''} ${isWinner ? 'is-winner' : ''}`}>
                        <div className="player-info">
                          <span className="player-avatar">{isWinner ? '🏆' : (isMe ? '👤' : (p.isHost ? '👑' : '👻'))}</span>
                          <span className="player-name">{p.name} {isMe && '(Bạn)'}</span>
                        </div>
                        <div className="player-score">
                          <span className="score-number">{lines}</span>
                          <span className="score-target">/{requiredLines} xiên</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            <div className="action-bar">
              <Button onClick={() => handleBackToHome()} variant="secondary">
                THOÁT BÀN
              </Button>
            </div>
            
            {/* Modal Chiến Thắng */}
            {(winningData.isWin || roomData.gameState.winner) && (
              <div className="victory-modal-overlay">
                <div className="victory-modal">
                  <h1 className="victory-title">TỚI TRẮNG !</h1>
                  <p className="victory-subtitle">
                    {roomData.gameState.winner === playerName 
                      ? `Chúc mừng bạn đã trúng đủ ${requiredLines} xiên!` 
                      : `Người chơi ${roomData.gameState.winner} đã tới trắng trước!`}
                  </p>
                  <div className="victory-actions">
                    {isHost ? (
                      <Button onClick={handlePlayAgain} variant="primary">CHƠI VÁN MỚI</Button>
                    ) : (
                      <p>Đang chờ chủ phòng chơi lại...</p>
                    )}
                    <Button onClick={handleBackToHome} variant="secondary">VỀ SẢNH CHÍNH</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {alertMsg && (
          <div className="alert-modal-overlay">
            <div className="alert-modal">
              <h3 className="alert-title">LƯU Ý</h3>
              <p className="alert-message">{alertMsg}</p>
              <Button onClick={() => setAlertMsg('')} variant="primary" className="btn-alert-close">
                ĐÃ HIỂU
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
