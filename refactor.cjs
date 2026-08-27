const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add imports
code = code.replace("import { HomeMenu } from './components/home/HomeMenu';", 
`import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GameHub } from './components/home/GameHub';
import { LotoMenu } from './components/home/LotoMenu';`);

// 2. Add hooks
code = code.replace("function App() {", 
`function App() {
  const navigate = useNavigate();
  const location = useLocation();`);

// 3. Remove view state (we'll just comment it out to be safe, or just leave it but ignore it)
code = code.replace("sessionStorage.setItem('view', view);", "");
code = code.replace("}, [view, playerName,", "}, [playerName,");
// Fix the dependency arrays
code = code.replace("}, [winningData.currentLines, winningData.isWin, view, currentRoomId, roomData, myPlayerId, playerName]);",
"}, [winningData.currentLines, winningData.isWin, location.pathname, currentRoomId, roomData, myPlayerId, playerName]);");
code = code.replace("}, [currentRoomId, view]);", "}, [currentRoomId, location.pathname]);");

// 4. Targeted replacements
code = code.replace(
  "if (mode === 'online') setView('room-list-online');", 
  "if (mode === 'online') navigate('/loto/rooms');"
);
code = code.replace(
  "if (mode === 'create') setView('create-room');",
  "if (mode === 'create') navigate('/loto/create');"
);

code = code.replace(
  "setCurrentRoomId(id);\n      setView('waiting-room');",
  "setCurrentRoomId(id);\n      navigate('/loto/room/' + id);"
);

code = code.replace(
  "setCurrentRoomId(newRoomId);\n    setView('waiting-room');",
  "setCurrentRoomId(newRoomId);\n    navigate('/loto/room/' + newRoomId);"
);

code = code.replace(
  "setView('home');",
  "navigate('/loto');"
);

// Remove view updates from subscribe (we derive view from url and room state)
code = code.replace("setView('playing');", "");
code = code.replace("setView('waiting-room');", "");
// Inside subscribeToRoom
code = code.replace("if (data.gameState.status === 'playing' && view !== 'playing') {", 
`if (data.gameState.status === 'playing') {`);
code = code.replace("if (view === 'waiting-room') {", `if (roomData?.gameState?.status === 'waiting') {`);
code = code.replace("if (data.gameState.status === 'waiting' && view !== 'waiting-room') {", 
`if (data.gameState.status === 'waiting') {`);
code = code.replace("if (view === 'playing') {", `if (roomData?.gameState?.status === 'playing') {`);

// Also fix useEffect dependency array that still has 'view'
code = code.replace("view === 'playing'", "roomData?.gameState?.status === 'playing'");

// 5. Update the return block
const returnStartIndex = code.indexOf('return (');
const returnEndIndex = code.lastIndexOf(');') + 2;

const newReturn = `return (
    <div className="app-container">
      <button
        className="sound-toggle-btn"
        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
        title={isSoundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
      >
        {isSoundEnabled ? '🔊' : '🔇'}
      </button>

      {location.pathname !== '/' && (
        <header className="mini-header" onClick={() => handleBackToHome()}>
          <img src="/favicon.png" alt="Logo Lô Tô" className="folk-logo-mini" />
          <span className="logo-text">HỘI LÔ TÔ</span>
        </header>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            <GameHub
              playerName={playerName}
              setPlayerName={setPlayerName}
              setAlertMsg={setAlertMsg}
              avatar={avatar}
              setAvatar={setAvatar}
            />
          } />
          
          <Route path="/loto" element={
            <LotoMenu
              onSelectMode={handleSelectMode}
              onJoinRoomById={handleJoinRoomById}
              setAlertMsg={setAlertMsg}
            />
          } />

          <Route path="/loto/rooms" element={
            <RoomList type="online" onBack={handleBackToHome} onJoinRoom={handleJoinRoomById} />
          } />

          <Route path="/loto/create" element={
            <GameSettings
              onStartGame={handleCreateRoomDone}
              onBack={handleBackToHome}
              setAlertMsg={setAlertMsg}
              playerName={playerName}
            />
          } />

          <Route path="/loto/room/:roomId" element={
            roomData ? (
              roomData.gameState.status === 'waiting' ? (
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
              ) : (
                <div className="game-area fade-in">
                  <div className="calling-section">
                    {roomData.settings.gameMode === 'standard' ? (
                      <div className="turn-indicator standard-mode">
                        {(roomData.settings.drawMode === 'turnBased' ? isMyTurn : isHost) ? (
                          <button
                            className="draw-number-btn"
                            onClick={() => roomService.drawRandomNumber(currentRoomId, roomData.settings.drawMode === 'turnBased' ? (currentTurnIndex + 1) % turnOrder.length : currentTurnIndex)}
                            disabled={winningData.isWin || roomData.gameState.winner}
                          >
                            🎲 BỐC SỐ
                          </button>
                        ) : (
                          <span className="waiting-host">
                            {roomData.settings.drawMode === 'turnBased'
                              ? \`Đang đợi \${roomData.players[turnOrder[currentTurnIndex]]?.name} bốc số...\`
                              : "Đang đợi Chủ Bàn bốc số..."}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={\`turn-indicator \${isMyTurn ? 'my-turn' : ''}\`}>
                        {isMyTurn ? "TỚI LƯỢT BẠN: HÃY CHỌN 1 SỐ TRÊN BẢNG ĐỂ HÔ" : \`Đang đợi \${roomData.players[turnOrder[currentTurnIndex]]?.name} hô số...\`}
                      </div>
                    )}

                    <div className="called-history">
                      <span className="history-label">ĐÃ HÔ:</span>
                      <div className="history-numbers">
                        {calledNumbers.map((n, i) => (
                          <span key={i} className={\`called-chip \${i === 0 ? 'latest' : ''}\`}>{n}</span>
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
                        onCellSelect={handleCellSelect}
                        winningLines={winningData.winningLines}
                        latestCalledNumber={calledNumbers[0]}
                      />
                    </div>

                    <div className="players-progress-section">
                      <h3 className="progress-title">BẢNG PHONG THẦN</h3>
                      <ul className="progress-list">
                        {Object.entries(roomData.players)
                          .sort(([, a], [, b]) => b.lines - a.lines)
                          .map(([id, p]) => {
                            const isMe = id === myPlayerId;
                            const lines = p.lines;
                            const isWinner = lines >= requiredLines;

                            return (
                              <li key={id} className={\`progress-item \${isMe ? 'is-me' : ''} \${isWinner ? 'is-winner' : ''}\`}>
                                <div className="player-info">
                                  <span className="player-avatar">
                                    {isWinner ? '🏆' : (p.avatar ? <img src={p.avatar} alt="avatar" className="board-avatar" /> : (isMe ? '👤' : (p.isHost ? '👑' : '👻')))}
                                  </span>
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
                            ? \`Chúc mừng bạn đã trúng đủ \${requiredLines} xiên!\`
                            : \`Người chơi \${roomData.gameState.winner} đã tới trắng trước!\`}
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
              )
            ) : (
              <div className="guest-waiting" style={{padding: '3rem'}}>
                <div className="spinner"></div>
                <p>Đang tải dữ liệu phòng...</p>
              </div>
            )
          } />
        </Routes>

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
  );`;

code = code.substring(0, returnStartIndex) + newReturn;

fs.writeFileSync('src/App.jsx', code);
console.log('Done refactoring App.jsx');
