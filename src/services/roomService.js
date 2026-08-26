import { database } from './firebase';

// 1. Create a Room
export const createRoom = async (roomId, settings, hostInfo, sharedPool) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  
  const newRoomData = {
    settings,
    sharedPool,
    players: {
      [hostInfo.id]: {
        name: hostInfo.name,
        isHost: true,
        lines: 0,
        joinedAt: Date.now()
      }
    },
    gameState: {
      status: 'waiting',
      turnOrder: [],
      currentTurnIndex: 0,
      calledNumbers: [],
      winner: null
    }
  };

  await roomRef.set(newRoomData);
  return newRoomData;
};

// 2. Join a Room
export const joinRoom = async (roomId, playerInfo) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  const snapshot = await roomRef.get();
  
  if (!snapshot.exists()) {
    throw new Error('RoomNotFound');
  }

  const roomData = snapshot.val();
  if (roomData.gameState.status !== 'waiting') {
    throw new Error('RoomAlreadyPlaying');
  }

  const playerRef = database.ref(`rooms/${roomId}/players/${playerInfo.id}`);
  await playerRef.set({
    name: playerInfo.name,
    isHost: false,
    lines: 0,
    joinedAt: Date.now()
  });
  
  return snapshot.val();
};

// 3. Leave Room / Kick Player
export const removePlayer = async (roomId, playerId) => {
  const playerRef = database.ref(`rooms/${roomId}/players/${playerId}`);
  await playerRef.remove();
};

// 4. Start Game
export const startGame = async (roomId, turnOrder) => {
  const gameStateRef = database.ref(`rooms/${roomId}/gameState`);
  await gameStateRef.update({
    status: 'playing',
    turnOrder: turnOrder,
    currentTurnIndex: 0,
    calledNumbers: []
  });
};

// 5. Call Number
export const callNumber = async (roomId, number, newTurnIndex, playersUpdates = null) => {
  const calledNumbersRef = database.ref(`rooms/${roomId}/gameState/calledNumbers`);
  const snapshot = await calledNumbersRef.get();
  const currentCalled = snapshot.val() || [];
  
  const updates = {};
  updates[`rooms/${roomId}/gameState/calledNumbers`] = [number, ...currentCalled];
  updates[`rooms/${roomId}/gameState/currentTurnIndex`] = newTurnIndex;
  
  if (playersUpdates) {
    Object.keys(playersUpdates).forEach(playerId => {
      updates[`rooms/${roomId}/players/${playerId}/lines`] = playersUpdates[playerId].lines;
    });
  }

  await database.ref().update(updates);
};

// 6. Update Player Progress
export const updatePlayerLines = async (roomId, playerId, lines) => {
  const playerRef = database.ref(`rooms/${roomId}/players/${playerId}`);
  await playerRef.update({ lines });
};

// 7. Kết thúc game (Có người thắng)
export const setWinner = async (roomId, winnerName) => {
  const gameStateRef = database.ref(`rooms/${roomId}/gameState`);
  await gameStateRef.update({
    status: 'finished',
    winner: winnerName
  });
};

// 8. Chơi lại (Quay về sảnh)
export const playAgain = async (roomId) => {
  const gameStateRef = database.ref(`rooms/${roomId}/gameState`);
  await gameStateRef.update({
    status: 'waiting',
    turnOrder: [],
    currentTurnIndex: 0,
    calledNumbers: [],
    winner: null
  });
  
  const playersRef = database.ref(`rooms/${roomId}/players`);
  const snapshot = await playersRef.get();
  if (snapshot.exists()) {
    const players = snapshot.val();
    const updates = {};
    Object.keys(players).forEach(id => {
      updates[`${id}/lines`] = 0;
    });
    await playersRef.update(updates);
  }
};

// 9. Lắng nghe thay đổi toàn bộ phòng (Subscribe)
export const subscribeToRoom = (roomId, callback) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  const listener = roomRef.on('value', (snapshot) => {
    callback(snapshot.val());
  });
  
  // Trả về hàm huỷ đăng ký
  return () => roomRef.off('value', listener);
};

// 10. Đổi Theme phòng (Chỉ Host)
export const updateTheme = async (roomId, theme) => {
  const themeRef = database.ref(`rooms/${roomId}/settings/theme`);
  await themeRef.set(theme);
};

// 11. Xóa phòng (Chủ phòng thoát)
export const deleteRoom = async (roomId) => {
  await database.ref(`rooms/${roomId}`).remove();
};
