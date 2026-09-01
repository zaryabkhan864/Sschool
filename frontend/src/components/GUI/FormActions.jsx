import React from 'react';
import { useTranslation } from 'react-i18next';

const FormActions = ({
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,
  submitIcon = "check",
  cancelIcon = "times",
  submitColor = "blue",
  cancelColor = "gray",
  disabled = false,
  className = "",
  showCancel = true,
  showSubmit = true,
  align = "right"
}) => {
  const { t } = useTranslation();

  // ✅ "blue" now maps to the brand gradient (matches AppButton's primary
  // variant) instead of a flat bootstrap-style blue.
  const getSubmitColorClass = () => {
    switch (submitColor) {
      case 'blue': return 'bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-glow-brand';
      case 'green': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'red': return 'bg-red-600 hover:bg-red-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-glow-brand';
    }
  };

  const getCancelColorClass = () => {
    switch (cancelColor) {
      case 'gray': return 'bg-surface-100 hover:bg-surface-200 text-ink-600';
      case 'white': return 'bg-white border border-surface-200 hover:bg-surface-50 text-ink-600';
      case 'red': return 'bg-red-50 hover:bg-red-100 text-red-600';
      default: return 'bg-surface-100 hover:bg-surface-200 text-ink-600';
    }
  };

  const getAlignClass = () => {
    switch (align) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      case 'between': return 'justify-between';
      default: return 'justify-end';
    }
  };

  return (
    <div className={`flex items-center gap-3 ${getAlignClass()} ${className}`}>
      {showCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`px-4 py-2.5 text-xs-custom font-bold rounded-xl transition-all ${getCancelColorClass()} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {cancelIcon && <i className={`fa fa-${cancelIcon} mr-2`}></i>}
          {cancelLabel || t('Cancel')}
        </button>
      )}

      {showSubmit && onSubmit && (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className={`px-8 py-2.5 rounded-xl text-xs-custom font-bold text-white transition-all shadow-button active:scale-95 ${getSubmitColorClass()} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <>
              <i className="fa fa-spinner fa-spin mr-2"></i>
              {t('Processing...')}
            </>
          ) : (
            <>
              {submitIcon && <i className={`fa fa-${submitIcon} mr-2`}></i>}
              {submitLabel || t('Submit')}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FormActions;
