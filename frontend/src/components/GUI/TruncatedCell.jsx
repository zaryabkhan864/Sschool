import React from 'react';

const TruncatedCell = ({ children, lines = 1, className = '' }) => {
  return (
    <div className={`max-w-[200px] ${className}`}>
      <p
        className="text-sm text-gray-800"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word'
        }}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </p>
    </div>
  );
};

export default TruncatedCell;