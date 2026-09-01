import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmationModal = ({
  showModal,
  setShowModal,
  confirmDelete,
  isDeleteLoading,
  message,
  title = "Confirm Action",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red", // 'red', 'blue', 'green', 'purple'
  cancelColor = "gray"
}) => {
  const { t } = useTranslation();

  if (!showModal) return null;

  const getConfirmColorClass = () => {
    switch (confirmColor) {
      case 'red': return 'bg-red-600 hover:bg-red-700 focus:ring-red-300';
      case 'blue': return 'bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-glow-brand focus:ring-brand-300';
      case 'green': return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300';
      default: return 'bg-red-600 hover:bg-red-700 focus:ring-red-300';
    }
  };

  // ✅ FIX: icon circle previously stayed red-100/red-600 regardless of
  // confirmColor — now it follows the same prop so a "blue"/"green" confirm
  // action doesn't show a scary red warning icon.
  const getIconColorClass = () => {
    switch (confirmColor) {
      case 'red': return 'bg-red-50 text-red-600';
      case 'blue': return 'bg-brand-50 text-brand-600';
      case 'green': return 'bg-emerald-50 text-emerald-600';
      case 'purple': return 'bg-purple-50 text-purple-600';
      default: return 'bg-red-50 text-red-600';
    }
  };

  const getCancelColorClass = () => {
    switch (cancelColor) {
      case 'gray': return 'bg-surface-100 hover:bg-surface-200 text-ink-700 border-transparent';
      case 'white': return 'bg-white border-surface-200 hover:bg-surface-50 text-ink-700';
      default: return 'bg-surface-100 hover:bg-surface-200 text-ink-700 border-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-navy-950/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-premium transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getIconColorClass()}`}>
                <i className="fa fa-exclamation-triangle"></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg-custom leading-6 font-bold text-ink-900">
                  {t(title)}
                </h3>
                <div className="mt-2">
                  <p className="text-sm-custom text-ink-600">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleteLoading}
              className={`w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-soft px-4 py-2.5 text-sm-custom font-bold text-white transition-all ${getConfirmColorClass()} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto ${isDeleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDeleteLoading ? (
                <>
                  <i className="fa fa-spinner fa-spin mr-2"></i>
                  {t('Processing...')}
                </>
              ) : (
                t(confirmText)
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={`mt-3 w-full inline-flex justify-center rounded-xl border px-4 py-2.5 text-sm-custom font-bold shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-300 sm:mt-0 sm:ml-3 sm:w-auto ${getCancelColorClass()}`}
            >
              {t(cancelText)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
