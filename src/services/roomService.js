import { database } from './firebase';

// 1. Create a Room
export const createRoom = async (roomId, settings, hostInfo, sharedPool) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  
  const newRoomData = {
    createdAt: Date.now(),
    settings: { ...settings, isLocked: false },
    sharedPool,
    players: {
      [hostInfo.id]: {
        name: hostInfo.name,
        avatar: hostInfo.avatar || null,
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
  roomRef.onDisconnect().remove();
  
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
  
  if (roomData.settings?.isLocked) {
    throw new Error('RoomIsLocked');
  }

  const playerRef = database.ref(`rooms/${roomId}/players/${playerInfo.id}`);
  await playerRef.set({
    name: playerInfo.name,
    avatar: playerInfo.avatar || null,
    isHost: false,
    lines: 0,
    joinedAt: Date.now()
  });
  
  // Đảm bảo xóa người chơi khi họ ngắt kết nối (đóng tab/mất mạng)
  playerRef.onDisconnect().remove();
  
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

// 5.1 Draw random number (Standard Mode)
export const drawRandomNumber = async (roomId, newTurnIndex = null) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  const snapshot = await roomRef.get();
  const roomData = snapshot.val();

  if (!roomData) return null;

  const sharedPool = roomData.sharedPool || [];
  const calledNumbers = roomData.gameState.calledNumbers || [];

  // Tìm các số chưa gọi
  const remaining = sharedPool.filter(n => !calledNumbers.includes(n));
  if (remaining.length === 0) return null;

  // Bốc ngẫu nhiên
  const randomIndex = Math.floor(Math.random() * remaining.length);
  const pickedNumber = remaining[randomIndex];

  const updates = {};
  updates[`rooms/${roomId}/gameState/calledNumbers`] = [pickedNumber, ...calledNumbers];
  
  if (newTurnIndex !== null) {
    updates[`rooms/${roomId}/gameState/currentTurnIndex`] = newTurnIndex;
  }

  await database.ref().update(updates);

  return pickedNumber;
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

// 11. Khoá / Mở khoá phòng (Chỉ Host)
export const toggleRoomLock = async (roomId, isLocked) => {
  const lockRef = database.ref(`rooms/${roomId}/settings/isLocked`);
  await lockRef.set(isLocked);
};

// 12. Xóa phòng (Chủ phòng thoát)
export const deleteRoom = async (roomId) => {
  await database.ref(`rooms/${roomId}`).remove();
};

// 12. Lấy danh sách các phòng đang online & Cronjob dọn rác
export const getOnlineRooms = (callback) => {
  const roomsRef = database.ref('rooms');
  
  const handleData = (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const roomsObj = snapshot.val();
    const roomsList = [];
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    Object.entries(roomsObj).forEach(([id, data]) => {
      // Logic dọn rác (Cronjob frontend): 
      // Xoá phòng nếu status là waiting VÀ đã tạo quá 5 phút
      const isWaiting = data.gameState?.status === 'waiting';
      const createdAt = data.createdAt || 0; // fallback cho các phòng cũ
      
      if (isWaiting && createdAt > 0 && now - createdAt > FIVE_MINUTES) {
        // Thực hiện xóa phòng âm thầm
        deleteRoom(id).catch(console.error);
        return; // Không đẩy vào list hiển thị nữa
      }

      roomsList.push({
        id,
        name: data.settings?.roomName || `Phòng ${id}`,
        players: data.players ? Object.keys(data.players).length : 0,
        maxPlayers: 10,
        status: data.gameState?.status || 'waiting',
        isLocked: data.settings?.isLocked || false
      });
    });
    
    // Ưu tiên hiển thị phòng đang chờ lên đầu
    roomsList.sort((a, b) => {
      if (a.status === 'waiting' && b.status !== 'waiting') return -1;
      if (a.status !== 'waiting' && b.status === 'waiting') return 1;
      return 0;
    });

    callback(roomsList);
  };

  roomsRef.on('value', handleData);

  return () => {
    roomsRef.off('value', handleData);
  };
};

// 13. Quản lý kết nối Firebase (Tối ưu connection)
export const disconnectFirebase = () => {
  database.goOffline();
};

export const connectFirebase = () => {
  database.goOnline();
};
