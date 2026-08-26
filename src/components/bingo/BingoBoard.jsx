import React from 'react';
import { BingoCell } from './BingoCell';
import './BingoBoard.css';

export const BingoBoard = ({ board, rows, cols, onCellSelect, winningLines = [] }) => {
  
  // Helper to determine which strike types apply to a given cell id
  const getStrikeTypes = (cellId) => {
    const types = [];
    winningLines.forEach(line => {
      if (line.cells.includes(cellId)) {
        types.push(line.type); // 'row', 'col', 'diag1', 'diag2'
      }
    });
    return types;
  };

  return (
    <div 
      className="bingo-board"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {board.map((cell) => (
        <BingoCell 
          key={cell.id} 
          cell={cell} 
          onSelect={onCellSelect} 
          strikeTypes={getStrikeTypes(cell.id)}
        />
      ))}
    </div>
  );
};
