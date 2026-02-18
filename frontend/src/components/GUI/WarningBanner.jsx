import React from 'react';
import { useTranslation } from 'react-i18next';

const WarningBanner = ({ 
  title, 
  message, 
  type = "warning", 
  icon = "exclamation-triangle",
  className = "",
  actionButton
}) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <i className={`fa fa-${icon} text-yellow-400 text-lg`}></i>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            {title}
          </h3>
          <div className="text-sm text-yellow-700 mt-1">
            {message}
          </div>
          {actionButton && (
            <div className="mt-3">
              {actionButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarningBanner;