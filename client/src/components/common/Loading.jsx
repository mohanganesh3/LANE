import React from 'react';
import './Loading.css';

function Loading({ size = 'medium', text = 'Loading...', fullScreen = false }) {
  const spinnerClass = `loading-spinner loading-${size}`;
  
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={spinnerClass}></div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={spinnerClass}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default Loading;
