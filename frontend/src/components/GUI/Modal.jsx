import React from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle = "",
  icon = "info-circle",
  iconColor = "blue",
  size = "md",
  children,
  className = "",
  closeOnOutsideClick = true
}) => {
  if (!isOpen) return null;

  const getSizeClass = () => {
    switch(size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-lg';
    }
  };

  const getIconColorClass = () => {
    switch(iconColor) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'red': return 'text-red-600';
      case 'yellow': return 'text-yellow-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleBackdropClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${getSizeClass()} max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`w-10 h-10 rounded-lg bg-${iconColor}-100 flex items-center justify-center`}>
                  <i className={`fa fa-${icon} ${getIconColorClass()}`}></i>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <i className="fa fa-times text-gray-500"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;