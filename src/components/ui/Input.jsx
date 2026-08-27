import React from 'react';
import './Input.css';

export const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className={`glass-input ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};
