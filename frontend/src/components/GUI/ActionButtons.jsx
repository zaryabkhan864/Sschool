import React from 'react';
import { useTranslation } from 'react-i18next';

const ActionButtons = ({
  id,
  userRole,
  onDelete,
  isDeleteLoading,
  // Optional click handlers
  onView,
  onEdit,
  // Optional hrefs (if onView/onEdit not provided, use these)
  viewHref,
  editHref,
}) => {
  const { t } = useTranslation();

  const handleView = (e) => {
    if (onView) {
      e.preventDefault();
      onView(id);
    }
  };

  const handleEdit = (e) => {
    if (onEdit) {
      e.preventDefault();
      onEdit(id);
    }
  };

  return (
    <div className="flex justify-end items-center gap-1">
      <a
        href={viewHref || `#`}
        onClick={handleView}
        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
        title={t('View Details')}
        style={{ width: '36px', height: '36px' }}
      >
        <i className="fa fa-eye text-sm"></i>
      </a>
      {userRole === 'admin' && (
        <>
          <a
            href={editHref || `#`}
            onClick={handleEdit}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
            title={t('Edit')}
            style={{ width: '36px', height: '36px' }}
          >
            <i className="fa fa-edit text-sm"></i>
          </a>
          <button
            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            onClick={() => onDelete(id)}
            disabled={isDeleteLoading}
            title={t('Delete')}
            style={{ width: '36px', height: '36px' }}
          >
            <i className="fa fa-trash text-sm"></i>
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;