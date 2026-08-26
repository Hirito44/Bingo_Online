/**
 * Sinh ra một mảng các ô số ngẫu nhiên cho bảng Bingo
 * @param {number} rows - Số hàng
 * @param {number} cols - Số cột
 * @returns {Array} Mảng các object { id, value, selected }
 */
export const generateBingoBoard = (rows, cols) => {
  const totalCells = rows * cols;
  // Giới hạn số tối đa để bốc (gấp 3 lần tổng số ô để có tính ngẫu nhiên cao)
  const maxNumber = totalCells * 3;
  
  const numbers = new Set();
  while (numbers.size < totalCells) {
    const randomNum = Math.floor(Math.random() * maxNumber) + 1;
    numbers.add(randomNum);
  }

  const shuffledNumbers = Array.from(numbers).sort(() => Math.random() - 0.5);

  return shuffledNumbers.map((num, index) => ({
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
