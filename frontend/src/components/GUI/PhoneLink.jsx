import React from 'react';

const PhoneLink = ({ number }) => {
  if (!number) return <span className="text-gray-400">N/A</span>;
  return (
    <div className="flex items-center gap-1">
      <i className="fa fa-phone text-xs text-gray-400"></i>
      <a href={`tel:${number}`} className="text-sm text-gray-700 font-medium hover:text-blue-600 transition-colors">
        {number}
      </a>
    </div>
  );
};

export default PhoneLink;