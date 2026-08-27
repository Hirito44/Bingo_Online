import React from 'react';
import './BingoCell.css';

export const BingoCell = ({ cell, onSelect, strikeTypes = [], isSuggested = false }) => {
  if (cell.value === null) {
    return (
      <div className="bingo-cell empty-cell"></div>
    );
  }

  return (
    <div 
      className={`bingo-cell ${cell.selected ? 'selected' : ''} ${isSuggested ? 'suggested' : ''}`}
      onClick={() => onSelect(cell.id)}
    >
      <span className="cell-value">{cell.value}</span>
      {cell.selected && <div className="cell-overlay"></div>}
      
      {/* Hiển thị các nét gạch (strikethrough) nếu có */}
      {strikeTypes.map((type, idx) => (
        <div key={idx} className={`strike-line strike-${type}`}></div>
      ))}
    </div>
  );
};
