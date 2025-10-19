import React from 'react';
import './Card.css';

function Card({ 
  children, 
  title, 
  subtitle,
  footer,
  hoverable = false,
  onClick,
  className = '' 
}) {
  const cardClass = `card ${hoverable ? 'card-hoverable' : ''} ${className}`;

  return (
    <div className={cardClass} onClick={onClick}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
