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
    switch (type) {
      case 'info': return 'bg-brand-50 border-brand-200 text-brand-800';
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-surface-50 border-surface-200 text-ink-700';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'info': return 'text-brand-500';
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-ink-400';
    }
  };

  return (
    <div className={`border rounded-xl p-4 ${getTypeClasses()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`fa fa-${icon} ${getIconColor()} text-lg`}></i>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm-custom font-semibold">
              {title}
            </h3>
          )}
          <div className="text-sm-custom mt-1 opacity-90">
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
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
