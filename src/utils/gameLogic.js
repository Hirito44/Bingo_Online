/**
 * Tạo một tập số chung (Shared Pool) ngẫu nhiên cho toàn bộ phòng.
 * @param {number} totalCells Số lượng ô cần thiết (vd: 25 cho bảng 5x5)
 * @returns {number[]} Mảng chứa các số ngẫu nhiên duy nhất
 */
export const generateSharedPool = (totalCells, mode = 'classic') => {
  if (mode === 'standard') {
    // Lô tô chuẩn có 90 số
    return Array.from({ length: 90 }, (_, i) => i + 1);
  }
  const pool = new Set();
  while (pool.size < totalCells) {
    pool.add(Math.floor(Math.random() * 99) + 1);
  }
  return Array.from(pool);
};

export const generateStandardLotoTicket = () => {
  const rows = 3;
  const cols = 9;
  const board = Array(rows * cols).fill(null);

  // Mỗi hàng có chính xác 5 số
  const rowColIndices = [[], [], []];
  for (let r = 0; r < 3; r++) {
    const availableCols = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = 0; i < 5; i++) {
      const randIdx = Math.floor(Math.random() * availableCols.length);
      rowColIndices[r].push(availableCols[randIdx]);
      availableCols.splice(randIdx, 1);
    }
  }

  // Phân bố số vào các cột
  for (let c = 0; c < 9; c++) {
    const rowsForCol = [];
    if (rowColIndices[0].includes(c)) rowsForCol.push(0);
    if (rowColIndices[1].includes(c)) rowsForCol.push(1);
    if (rowColIndices[2].includes(c)) rowsForCol.push(2);

    const k = rowsForCol.length;
    if (k > 0) {
      // Chọn k số ngẫu nhiên cho cột này
      const min = c === 0 ? 1 : c * 10;
      const max = c === 8 ? 90 : (c * 10 + 9);
      
      const pool = new Set();
      while (pool.size < k) {
        pool.add(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      // Sắp xếp tăng dần từ trên xuống dưới
      const sortedNums = Array.from(pool).sort((a, b) => a - b);
      
      rowsForCol.forEach((r, idx) => {
        board[r * cols + c] = sortedNums[idx];
      });
    }
  }

  return board.map((val, index) => ({
    id: index,
    value: val,
    selected: false,
  }));
};

/**
 * Tạo ra một mảng 1D chứa các ô của bảng Bingo, sử dụng tập số chung (Shared Pool).
 * Mỗi người chơi sẽ xáo trộn tập số này để tạo ra bảng có cấu trúc khác nhau nhưng chung bộ số.
 * @param {number} rows Số hàng
 * @param {number} cols Số cột
 * @param {number[]} sharedPool Tập số chung của phòng
 * @param {string} mode Chế độ chơi (classic, standard)
 * @returns {Array} Mảng các object chứa id, value, selected
 */
export const generateBingoBoard = (rows, cols, sharedPool = [], mode = 'classic') => {
  if (mode === 'standard') {
    return generateStandardLotoTicket();
  }

  const totalCells = rows * cols;
  
  // Tạo bộ số (nếu chưa có pool thì tự tạo, nếu có thì copy)
  let numbers = [];
  if (sharedPool && sharedPool.length === totalCells) {
    numbers = [...sharedPool];
  } else {
    numbers = generateSharedPool(totalCells, mode);
  }

  // Thuật toán xáo trộn Fisher-Yates
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers.map((num, index) => ({
    id: index,
    value: num,
    selected: false,
  }));
};

/**
 * Kiểm tra xem có đường thắng nào không (Hàng ngang, dọc, chéo)
 * @param {Array} board - Mảng các ô số hiện tại
 * @param {number} rows - Số hàng
 * @param {number} cols - Số cột
 * @param {number} requiredLines - Số lượng đường cần để thắng
 * @returns {Object} { isWin: boolean, winningLines: Array }
 */
export const checkWinCondition = (board, rows, cols, requiredLines = 1, mode = 'classic') => {
  if (!board || board.length !== rows * cols) return { isWin: false, winningLines: [] };

  const winningLines = [];

  // Check rows
  for (let r = 0; r < rows; r++) {
    const rowLine = [];
    let isRowWin = true;
    let hasNumbers = false;
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const cell = board[index];
      rowLine.push(index);
      if (mode === 'standard') {
        if (cell.value !== null) {
          hasNumbers = true;
          if (!cell.selected) isRowWin = false;
        }
      } else {
        if (!cell.selected) isRowWin = false;
      }
    }
    if (mode === 'standard') {
      if (isRowWin && hasNumbers) winningLines.push({ cells: rowLine, type: 'row' });
    } else {
      if (isRowWin) winningLines.push({ cells: rowLine, type: 'row' });
    }
  }

  if (mode === 'classic') {
    // Check cols
    for (let c = 0; c < cols; c++) {
      const colLine = [];
      let isColWin = true;
      for (let r = 0; r < rows; r++) {
        const index = r * cols + c;
        colLine.push(index);
        if (!board[index].selected) {
          isColWin = false;
        }
      }
      if (isColWin) winningLines.push({ cells: colLine, type: 'col' });
    }

    // Check diagonals (only if it's a square board)
    if (rows === cols) {
      const diag1 = [];
      let isDiag1Win = true;
      for (let i = 0; i < rows; i++) {
        const index = i * cols + i;
        diag1.push(index);
        if (!board[index].selected) {
          isDiag1Win = false;
        }
      }
      if (isDiag1Win) winningLines.push({ cells: diag1, type: 'diag1' });

      const diag2 = [];
      let isDiag2Win = true;
      for (let i = 0; i < rows; i++) {
        const index = i * cols + (cols - 1 - i);
        diag2.push(index);
        if (!board[index].selected) {
          isDiag2Win = false;
        }
      }
      if (isDiag2Win) winningLines.push({ cells: diag2, type: 'diag2' });
    }
  }

  return {
    isWin: winningLines.length >= requiredLines,
    winningLines,
    currentLines: winningLines.length
  };
};
