import React from 'react';

// ✅ FIX: `bg-${iconColor}-100` was built at runtime — Tailwind's static
// scanner can't see it, so any iconColor without that exact class already
// written elsewhere in the codebase would render with NO icon background
// in a production build. Static map fixes it for good, same pattern as
// DataTableContainer's stat cards.
const ICON_COLOR_STYLES = {
  blue: { bg: 'bg-brand-100', text: 'text-brand-600' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};
const getIconStyle = (color) => ICON_COLOR_STYLES[color] || { bg: 'bg-surface-100', text: 'text-ink-600' };

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
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-lg';
    }
  };

  const iconStyle = getIconStyle(iconColor);

  const handleBackdropClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-premium w-full ${getSizeClass()} max-h-[90vh] overflow-y-auto animate-slide-up ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-surface-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconStyle.bg}`}>
                  <i className={`fa fa-${icon} ${iconStyle.text}`}></i>
                </div>
              )}
              <div>
                <h3 className="text-lg-custom font-bold text-ink-900">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs-custom text-ink-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              type="button"
            >
              <i className="fa fa-times text-ink-400"></i>
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
