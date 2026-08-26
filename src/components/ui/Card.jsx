import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', title }) => {
  return (
    <div className={`glass-card ${className}`}>
      {title && <h2 className="card-title">{title}</h2>}
      <div className="card-content">{children}</div>
    </div>
  );
};
