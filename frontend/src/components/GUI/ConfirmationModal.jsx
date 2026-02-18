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
  confirmColor = "red", // 'red', 'blue', 'green', etc.
  cancelColor = "gray"
}) => {
  const { t } = useTranslation();

  if (!showModal) return null;

  const getConfirmColorClass = () => {
    switch(confirmColor) {
      case 'red': return 'bg-red-600 hover:bg-red-700 focus:ring-red-300';
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300';
      case 'green': return 'bg-green-600 hover:bg-green-700 focus:ring-green-300';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300';
      default: return 'bg-red-600 hover:bg-red-700 focus:ring-red-300';
    }
  };

  const getCancelColorClass = () => {
    switch(cancelColor) {
      case 'gray': return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
      case 'white': return 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <i className="fa fa-exclamation-triangle text-red-600"></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleteLoading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${getConfirmColorClass()} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${isDeleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDeleteLoading ? (
                <>
                  <i className="fa fa-spinner fa-spin mr-2"></i>
                  {t('Processing...')}
                </>
              ) : (
                confirmText
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={`mt-3 w-full inline-flex justify-center rounded-md border ${getCancelColorClass()} px-4 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;