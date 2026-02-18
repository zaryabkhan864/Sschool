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

  const getSubmitColorClass = () => {
    switch(submitColor) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-700';
      case 'green': return 'bg-green-600 hover:bg-green-700';
      case 'red': return 'bg-red-600 hover:bg-red-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const getCancelColorClass = () => {
    switch(cancelColor) {
      case 'gray': return 'bg-gray-100 hover:bg-gray-200 text-gray-600';
      case 'white': return 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-600';
      case 'red': return 'bg-red-100 hover:bg-red-200 text-red-600';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-600';
    }
  };

  const getAlignClass = () => {
    switch(align) {
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
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${getCancelColorClass()} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          className={`px-8 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 ${getSubmitColorClass()} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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