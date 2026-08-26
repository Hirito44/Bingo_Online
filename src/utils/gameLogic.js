/**
 * Tạo một tập số chung (Shared Pool) ngẫu nhiên cho toàn bộ phòng.
 * @param {number} totalCells Số lượng ô cần thiết (vd: 25 cho bảng 5x5)
 * @returns {number[]} Mảng chứa các số ngẫu nhiên duy nhất
 */
export const generateSharedPool = (totalCells) => {
  const pool = new Set();
  while (pool.size < totalCells) {
    pool.add(Math.floor(Math.random() * 99) + 1);
  }
  return Array.from(pool);
};

/**
 * Tạo ra một mảng 1D chứa các ô của bảng Bingo, sử dụng tập số chung (Shared Pool).
 * Mỗi người chơi sẽ xáo trộn tập số này để tạo ra bảng có cấu trúc khác nhau nhưng chung bộ số.
 * @param {number} rows Số hàng
 * @param {number} cols Số cột
 * @param {number[]} sharedPool Tập số chung của phòng
 * @returns {Array} Mảng các object chứa id, value, selected
 */
export const generateBingoBoard = (rows, cols, sharedPool = []) => {
  const totalCells = rows * cols;
  
  // Tạo bộ số (nếu chưa có pool thì tự tạo, nếu có thì copy)
  let numbers = [];
  if (sharedPool && sharedPool.length === totalCells) {
    numbers = [...sharedPool];
  } else {
    numbers = generateSharedPool(totalCells);
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
export const checkWinCondition = (board, rows, cols, requiredLines = 1) => {
  if (!board || board.length !== rows * cols) return { isWin: false, winningLines: [] };

  const winningLines = [];

  // Check rows
  for (let r = 0; r < rows; r++) {
    const rowLine = [];
    let isRowWin = true;
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      rowLine.push(index);
      if (!board[index].selected) {
        isRowWin = false;
      }
    }
    if (isRowWin) winningLines.push({ cells: rowLine, type: 'row' });
  }

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

  return {
    isWin: winningLines.length >= requiredLines,
    winningLines,
    currentLines: winningLines.length
  };
};
