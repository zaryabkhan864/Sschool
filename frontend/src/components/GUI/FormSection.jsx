import React from 'react';

const FormSection = ({ 
  title, 
  subtitle = "",
  icon = "info-circle", 
  iconColor = "blue", 
  children, 
  className = "",
  border = true,
  background = "white",
  padding = "p-5"
}) => {
  const getBackgroundClass = () => {
    switch(background) {
      case 'gray': return 'bg-gray-50';
      case 'white': return 'bg-white';
      case 'blue': return 'bg-blue-50';
      case 'green': return 'bg-green-50';
      default: return 'bg-white';
    }
  };

  const getIconColorClass = () => {
    switch(iconColor) {
      case 'blue': return 'text-blue-500';
      case 'green': return 'text-green-500';
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-yellow-500';
      case 'purple': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`${getBackgroundClass()} ${border ? 'border border-gray-200' : ''} rounded-xl ${padding} ${className}`}>
      {title && (
        <div className={`flex items-center gap-2 mb-4 ${border ? 'pb-4 border-b border-gray-100' : ''}`}>
          {icon && (
            <i className={`fa fa-${icon} ${getIconColorClass()} text-sm`}></i>
          )}
          <div>
            <h3 className="font-bold text-sm text-gray-800">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;