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
    switch (background) {
      case 'gray': return 'bg-surface-50';
      case 'white': return 'bg-white';
      case 'blue': return 'bg-brand-50';
      case 'green': return 'bg-emerald-50';
      default: return 'bg-white';
    }
  };

  const getIconColorClass = () => {
    switch (iconColor) {
      case 'blue': return 'text-brand-500';
      case 'green': return 'text-emerald-500';
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-amber-500';
      case 'purple': return 'text-purple-500';
      default: return 'text-ink-400';
    }
  };

  return (
    <div className={`${getBackgroundClass()} ${border ? 'border border-surface-200' : ''} rounded-xl ${padding} ${className}`}>
      {title && (
        <div className={`flex items-center gap-2 mb-4 ${border ? 'pb-4 border-b border-surface-100' : ''}`}>
          {icon && (
            <i className={`fa fa-${icon} ${getIconColorClass()} text-sm`}></i>
          )}
          <div>
            <h3 className="font-bold text-sm-custom text-ink-900">{title}</h3>
            {subtitle && (
              <p className="text-xs-custom text-ink-400 mt-1">{subtitle}</p>
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
