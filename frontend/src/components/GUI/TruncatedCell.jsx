import React from 'react';

const TruncatedCell = ({ children, words, maxChars = 10, className = '' }) => {
  if (!children || typeof children !== 'string') return children;

  // Function to truncate by characters (Jo aapko chahiye)
  const truncateByChars = (text, limit) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  // Agar aapne 'words' prop bheja hai to purana logic chalega
  // Lekin "Mustufa Ce..." achieve karne ke liye hum characters use karenge
  const displayedText = words 
    ? children.split(/\s+/).slice(0, words).join(' ') + (children.split(/\s+/).length > words ? '...' : '')
    : truncateByChars(children, maxChars);

  return (
    <div className={className}>
      <p
        className="text-sm text-gray-800"
        title={children} // Hover karne par poora naam dikhega
        style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          maxWidth: '100%' 
        }}
      >
        {displayedText}
      </p>
    </div>
  );
};

export default TruncatedCell;