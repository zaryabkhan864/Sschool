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
    <div className="flex justify-end items-center gap-1.5">
      <a
        href={viewHref || `#`}
        onClick={handleView}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-soft transition-all"
        title={t('View Details')}
      >
        <i className="fa fa-eye text-sm"></i>
      </a>
      {userRole === 'admin' && (
        <>
          <a
            href={editHref || `#`}
            onClick={handleEdit}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 hover:shadow-soft transition-all"
            title={t('Edit')}
          >
            <i className="fa fa-edit text-sm"></i>
          </a>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onDelete(id)}
            disabled={isDeleteLoading}
            title={t('Delete')}
          >
            <i className={`fa ${isDeleteLoading ? 'fa-spinner fa-spin' : 'fa-trash'} text-sm`}></i>
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
