import React from 'react';

const EmptyState = ({ icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className={`fa fa-${icon} text-gray-400 text-2xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default EmptyState;