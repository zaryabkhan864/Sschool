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

  // ✅ FIX: `type` was accepted as a prop (default "warning") but nothing
  // in the component actually branched on it — every banner rendered
  // yellow no matter what was passed. Added the mapping so "error"/"info"/
  // "success" callers actually get the right color, matching InfoBanner.
  const getTypeClasses = () => {
    switch (type) {
      case 'error': return { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-800', body: 'text-red-700', icon: 'text-red-400' };
      case 'info': return { bg: 'bg-brand-50', border: 'border-brand-200', title: 'text-brand-800', body: 'text-brand-700', icon: 'text-brand-400' };
      case 'success': return { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-800', body: 'text-emerald-700', icon: 'text-emerald-400' };
      case 'warning':
      default: return { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-800', body: 'text-amber-700', icon: 'text-amber-400' };
    }
  };

  const colors = getTypeClasses();

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <i className={`fa fa-${icon} ${colors.icon} text-lg`}></i>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm-custom font-semibold ${colors.title}`}>
            {title}
          </h3>
          <div className={`text-sm-custom mt-1 ${colors.body}`}>
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
