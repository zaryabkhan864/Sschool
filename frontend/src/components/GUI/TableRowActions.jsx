import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const TableRowActions = ({
  itemId,
  viewPath = "",
  editPath = "",
  onDelete,
  onView,
  onEdit,
  isDeleteLoading = false,
  userRole = "",
  requiredRole = "admin",
  showView = true,
  showEdit = true,
  showDelete = true,
  // ✅ customActions now take a single literal `className` covering
  // bg/hover/text together (e.g. "bg-purple-50 hover:bg-purple-100
  // text-purple-700") instead of separate bgColor/hoverColor/textColor
  // pieces. The old version built `hover:${action.hoverColor}` at
  // runtime — Tailwind's build-time scanner only picks up classes that
  // appear as complete literal strings in source, so that hover class
  // was never generated and customActions never actually changed color
  // on hover, regardless of what was passed in.
  customActions = []
}) => {
  const { t } = useTranslation();

  const handleView = () => {
    if (onView) {
      onView(itemId);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(itemId);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(itemId);
    }
  };

  const canEditDelete = !requiredRole || userRole === requiredRole;

  return (
    <div className="flex justify-end items-center gap-1.5">
      {/* View Action */}
      {showView && (
        viewPath ? (
          <Link
            to={viewPath.replace(':id', itemId)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            title={t("View Details")}
          >
            <i className="fa fa-eye text-sm"></i>
          </Link>
        ) : (
          <button
            onClick={handleView}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            title={t("View Details")}
          >
            <i className="fa fa-eye text-sm"></i>
          </button>
        )
      )}

      {/* Edit Action */}
      {showEdit && canEditDelete && (
        editPath ? (
          <Link
            to={editPath.replace(':id', itemId)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
            title={t("Edit")}
          >
            <i className="fa fa-edit text-sm"></i>
          </Link>
        ) : (
          <button
            onClick={handleEdit}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
            title={t("Edit")}
          >
            <i className="fa fa-edit text-sm"></i>
          </button>
        )
      )}

      {/* Delete Action */}
      {showDelete && canEditDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleteLoading}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
          title={t("Delete")}
        >
          <i className={`fa ${isDeleteLoading ? 'fa-spinner fa-spin' : 'fa-trash'} text-sm`}></i>
        </button>
      )}

      {/* Custom Actions */}
      {customActions.map((action, index) => (
        <button
          key={index}
          onClick={() => action.onClick(itemId)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${action.className || 'bg-surface-100 hover:bg-surface-200 text-ink-600'}`}
          title={action.title}
        >
          <i className={`fa fa-${action.icon} text-sm`}></i>
        </button>
      ))}
    </div>
  );
};

export default TableRowActions;
