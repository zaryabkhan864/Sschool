import React from 'react';
import { useTranslation } from 'react-i18next';

const InfoBanner = ({ 
  title, 
  message, 
  type = "info", 
  icon = "info-circle",
  className = "",
  onClose
}) => {
  const { t } = useTranslation();

  const getTypeClasses = () => {
    switch(type) {
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'info': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeClasses()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`fa fa-${icon} ${getIconColor()} text-lg`}></i>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          <div className="text-sm mt-1">
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoBanner;