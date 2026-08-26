import React from 'react';
import './BingoCell.css';

export const BingoCell = ({ cell, onSelect, strikeTypes = [] }) => {
  return (
    <div 
      className={`bingo-cell ${cell.selected ? 'selected' : ''}`}
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
