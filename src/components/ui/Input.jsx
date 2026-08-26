import React from 'react';
import './Input.css';

export const Input = ({ label, id, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className="glass-input" {...props} />
    </div>
  );
};
