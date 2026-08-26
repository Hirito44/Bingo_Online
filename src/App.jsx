import { useState } from 'react';
import { HomeMenu } from './components/home/HomeMenu';
import { RoomList } from './components/home/RoomList';
import { WaitingRoom } from './components/home/WaitingRoom';
import { GameSettings } from './components/bingo/GameSettings';
import { BingoBoard } from './components/bingo/BingoBoard';
import { Button } from './components/ui/Button';
import { generateBingoBoard, checkWinCondition } from './utils/gameLogic';
import './App.css';

function App() {
  // view: 'home', 'room-list-lan', 'room-list-online', 'create-room', 'waiting-room', 'playing', 'won'
  const [view, setView] = useState('home'); 
  
  const [board, setBoard] = useState([]);
  const [dimensions, setDimensions] = useState({ rows: 5, cols: 5, requiredLines: 1 });
  const [winningData, setWinningData] = useState({ isWin: false, currentLines: 0, winningLines: [] });
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);

  const handleSelectMode = (mode) => {
    if (mode === 'lan') setView('room-list-lan');
    if (mode === 'online') setView('room-list-online');
    if (mode === 'create') setView('create-room');
  };

  const handleJoinRoomById = (id) => {
    setCurrentRoomId(id);
    setIsHost(false);
    setView('waiting-room');
  };

  const handleCreateRoomDone = (rows, cols, requiredLines) => {
    setDimensions({ rows, cols, requiredLines });
    // Mock room ID creation
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCurrentRoomId(newRoomId);
    setIsHost(true);
    setView('waiting-room');
  };

  const handleStartGame = (finalBoard) => {
    // Nếu host bấm Start, hoặc guest nhận tín hiệu start, ta sẽ nhận được board đã config
    setBoard(finalBoard);
    setView('playing');
    setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
  };

  const handleCellSelect = (id) => {
    if (view !== 'playing') return;

    const newBoard = board.map(cell => 
      cell.id === id ? { ...cell, selected: true } : cell
    );
    
    setBoard(newBoard);

    // Check win condition
    const winResult = checkWinCondition(newBoard, dimensions.rows, dimensions.cols, dimensions.requiredLines);
    setWinningData({ isWin: winResult.isWin, currentLines: winResult.currentLines, winningLines: winResult.winningLines });

    if (winResult.isWin) {
      setView('won');
    }
  };

  const handleBackToHome = () => {
    setView('home');
    setBoard([]);
    setWinningData({ isWin: false, currentLines: 0, winningLines: [] });
    setCurrentRoomId('');
    setIsHost(false);
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
          <HomeMenu onSelectMode={handleSelectMode} onJoinRoomById={handleJoinRoomById} />
        )}

        {view === 'room-list-lan' && (
          <RoomList type="lan" onBack={handleBackToHome} onJoinRoom={handleJoinRoomById} />
        )}

        {view === 'room-list-online' && (
          <RoomList type="online" onBack={handleBackToHome} onJoinRoom={handleJoinRoomById} />
        )}

        {view === 'create-room' && (
          <GameSettings onStartGame={handleCreateRoomDone} onBack={handleBackToHome} />
        )}

        {view === 'waiting-room' && (
          <WaitingRoom 
            roomId={currentRoomId} 
            isHost={isHost} 
            onStart={handleStartGame} 
            onBack={handleBackToHome} 
          />
        )}

        {(view === 'playing' || view === 'won') && (
          <div className="game-area fade-in">
            <div className="game-status-bar">
              <div className="status-item">
                <span className="label">ĐÃ ĐẠT:</span>
                <span className="value text-primary">{winningData.currentLines} / {dimensions.requiredLines} XIÊN</span>
              </div>
            </div>

            {view === 'won' && (
              <div className="win-banner">
                🎉 KINH ! BẠN ĐÃ TỚI TRẮNG ! 🎉
              </div>
            )}

            <BingoBoard 
              board={board} 
              rows={dimensions.rows} 
              cols={dimensions.cols}
              onCellSelect={handleCellSelect}
              winningLines={winningData.winningLines}
            />
            
            <div className="action-bar">
              <Button onClick={handleBackToHome} variant="secondary">
                THOÁT BÀN
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
