import React, { useState, useEffect } from 'react';
import { HomeMenu } from './components/home/HomeMenu';
import { RoomList } from './components/home/RoomList';
import { WaitingRoom } from './components/home/WaitingRoom';
import { GameSettings } from './components/bingo/GameSettings';
import { BingoBoard } from './components/bingo/BingoBoard';
import { Button } from './components/ui/Button';
import { checkWinCondition } from './utils/gameLogic';
import './App.css';

function App() {
  // view: 'home', 'room-list-lan', 'room-list-online', 'create-room', 'waiting-room', 'playing'
  const [view, setView] = useState('home'); 
  const [playerName, setPlayerName] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  
  const [board, setBoard] = useState([]);
  const [dimensions, setDimensions] = useState({ rows: 5, cols: 5, requiredLines: 1 });
  const [winningData, setWinningData] = useState({ isWin: false, currentLines: 0, winningLines: [] });
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [isHost, setIsHost] = useState(false);
  
  // New State for Calling Numbers, Multiplayer Progress, and Turns
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [playersProgress, setPlayersProgress] = useState([]);
  
  // Turn Engine State
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Helper
  const myPlayerId = '1'; 
  const isMyTurn = turnOrder[currentTurnIndex] === myPlayerId;

  const handleSelectMode = (mode) => {
    if (!playerName.trim()) {
      setAlertMsg("Vui lòng nhập Danh xưng của bạn trước khi vào chơi nhé!");
      return;
    }
    if (mode === 'lan') setView('room-list-lan');
    if (mode === 'online') setView('room-list-online');
    if (mode === 'create') setView('create-room');
  };

  const handleJoinRoomById = (id) => {
    if (!playerName.trim()) {
      setAlertMsg("Vui lòng nhập Danh xưng của bạn trước khi vào phòng!");
      return;
    }
    setCurrentRoomId(id);
    setIsHost(false);
    setView('waiting-room');
  };

  const handleCreateRoomDone = (roomName, rows, cols, requiredLines) => {
    setDimensions({ rows, cols, requiredLines });
    // Mock room ID creation
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCurrentRoomId(newRoomId);
    setCurrentRoomName(roomName);
    setIsHost(true);
    setView('waiting-room');
  };

  const handleStartGame = (finalBoard, roomPlayers = []) => {
    setBoard(finalBoard);
    
    // Khởi tạo tiến độ (mock)
    const initProgress = roomPlayers.map(p => ({ ...p, lines: 0 }));
    if (initProgress.length === 0) {
      initProgress.push({ id: '1', name: playerName || 'Chủ phòng', lines: 0 });
    }
    setPlayersProgress(initProgress);

    // Xáo trộn thứ tự lượt chơi
    const shuffledIds = initProgress.map(p => p.id).sort(() => Math.random() - 0.5);
    setTurnOrder(shuffledIds);
    setCurrentTurnIndex(0);

    setView('playing');
    setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
    setCalledNumbers([]);
  };

  // Bot Auto Call Logic
  // Simulation of Bot calling a number
  useEffect(() => {
    if (view !== 'playing' || winningData.isWin) return;
    
    const currentPlayerId = turnOrder[currentTurnIndex];
    if (currentPlayerId !== myPlayerId) {
      // Bot's turn
      const timer = setTimeout(() => {
        // Tìm 1 số chưa gọi từ bảng chung (vì dùng pool chung nên lấy từ board hiện tại là được)
        const uncalledNumbers = board.filter(c => !calledNumbers.includes(c.value)).map(c => c.value);
        if (uncalledNumbers.length > 0) {
          const randomNum = uncalledNumbers[Math.floor(Math.random() * uncalledNumbers.length)];
          executeCallNumber(randomNum);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTurnIndex, view, winningData.isWin, board, calledNumbers, turnOrder]);

  const executeCallNumber = (num) => {
    if (!calledNumbers.includes(num)) {
      setCalledNumbers([num, ...calledNumbers]);
      
      // Mock logic: Giả lập tiến độ (nếu bot gọi, bot có thể tăng xiên)
      setPlayersProgress(prev => prev.map(p => {
        if (p.id === myPlayerId) return p;
        if (Math.random() > 0.7 && p.lines < dimensions.requiredLines) {
          return { ...p, lines: p.lines + 1 };
        }
        return p;
      }));
    }
    // Chuyển lượt
    setCurrentTurnIndex(prev => (prev + 1) % turnOrder.length);
  };

  const handleCellSelect = (id) => {
    if (view !== 'playing' || winningData.isWin) return;

    const cell = board.find(c => c.id === id);
    if (!cell) return;

    if (isMyTurn) {
      // Lượt của mình: bấm vào số chưa gạch để Hô số
      if (!cell.selected && !calledNumbers.includes(cell.value)) {
        // Gạch số
        const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
        setBoard(newBoard);
        checkWinAndUpdate(newBoard);
        
        // Hô số & qua lượt
        executeCallNumber(cell.value);
      } else if (!cell.selected && calledNumbers.includes(cell.value)) {
         // Số này đã bị người khác hô nhưng mình quên gạch, giờ gạch bù (không qua lượt)
         const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
         setBoard(newBoard);
         checkWinAndUpdate(newBoard);
      }
    } else {
      // Lượt người khác: chỉ được gạch những số ĐÃ HÔ
      if (!cell.selected && calledNumbers.includes(cell.value)) {
        const newBoard = board.map(c => c.id === id ? { ...c, selected: true } : c);
        setBoard(newBoard);
        checkWinAndUpdate(newBoard);
      } else if (!cell.selected && !calledNumbers.includes(cell.value)) {
        setAlertMsg("Chưa đến lượt của bạn, không được tự ý Hô số!");
      }
    }
  };

  const checkWinAndUpdate = (newBoard) => {
    const winResult = checkWinCondition(newBoard, dimensions.rows, dimensions.cols, dimensions.requiredLines);
    setWinningData({ isWin: winResult.isWin, currentLines: winResult.currentLines, winningLines: winResult.winningLines });
  };

  const handleBackToHome = () => {
    setView('home');
    setBoard([]);
    setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
    setCurrentRoomId('');
    setIsHost(false);
    setCalledNumbers([]);
  };

  const handlePlayAgain = () => {
    // Quay lại sảnh chờ của phòng hiện tại
    setView('waiting-room');
    setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
    setCalledNumbers([]);
    setBoard([]);
  };

  return (
    <div className="app-container">
      {/* Mini header when not on home screen */}
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

        {view === 'waiting-room' && (
          <WaitingRoom 
            roomId={currentRoomId} 
            roomName={currentRoomName}
            isHost={isHost} 
            onStart={handleStartGame} 
            onBack={handleBackToHome} 
            rows={dimensions.rows}
            cols={dimensions.cols}
            playerName={playerName}
            setAlertMsg={setAlertMsg}
          />
        )}

        {view === 'playing' && (
          <div className="game-area fade-in">
            {/* Lịch sử Hô số & Báo lượt */}
            <div className="calling-section">
              <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
                {isMyTurn ? "TỚI LƯỢT BẠN: HÃY CHỌN 1 SỐ TRÊN BẢNG ĐỂ HÔ" : `Đang đợi ${playersProgress.find(p => p.id === turnOrder[currentTurnIndex])?.name} hô số...`}
              </div>
              
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
                <span className="value text-primary">{winningData.currentLines} / {dimensions.requiredLines} XIÊN</span>
              </div>
            </div>

            <div className="main-playing-grid">
              <div className="board-section">
                <BingoBoard 
                  board={board} 
                  rows={dimensions.rows} 
                  cols={dimensions.cols}
                  onCellSelect={handleCellSelect}
                  winningLines={winningData.winningLines}
                  latestCalledNumber={calledNumbers[0]}
                />
              </div>
              
              <div className="players-progress-section">
                <h3 className="progress-title">BẢNG PHONG THẦN</h3>
                <ul className="progress-list">
                  {playersProgress.map((p) => {
                    const isMe = p.name === playerName || p.name === 'Chủ phòng (Bạn)';
                    const lines = isMe ? winningData.currentLines : p.lines;
                    const isWinner = lines >= dimensions.requiredLines;
                    
                    return (
                      <li key={p.id} className={`progress-item ${isMe ? 'is-me' : ''} ${isWinner ? 'is-winner' : ''}`}>
                        <div className="player-info">
                          <span className="player-avatar">{isWinner ? '🏆' : (isMe ? '👤' : '👻')}</span>
                          <span className="player-name">{p.name} {isMe && '(Bạn)'}</span>
                        </div>
                        <div className="player-score">
                          <span className="score-number">{lines}</span>
                          <span className="score-target">/{dimensions.requiredLines} xiên</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            <div className="action-bar">
              <Button onClick={handleBackToHome} variant="secondary">
                THOÁT BÀN
              </Button>
            </div>
            
            {/* Modal Chiến Thắng */}
            {winningData.isWin && (
              <div className="victory-modal-overlay">
                <div className="victory-modal">
                  <h1 className="victory-title">TỚI TRẮNG !</h1>
                  <p className="victory-subtitle">Chúc mừng bạn đã trúng đủ {dimensions.requiredLines} xiên!</p>
                  <div className="victory-actions">
                    <Button onClick={handlePlayAgain} variant="primary">CHƠI VÁN MỚI</Button>
                    <Button onClick={handleBackToHome} variant="secondary">VỀ SẢNH TRÍ</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Alert Modal */}
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
