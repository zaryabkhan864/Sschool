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
    <div className="flex justify-end items-center gap-1">
      {/* View Action */}
      {showView && (
        viewPath ? (
          <Link
            to={viewPath.replace(':id', itemId)}
            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("View Details")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-eye text-sm"></i>
          </Link>
        ) : (
          <button
            onClick={handleView}
            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("View Details")}
            style={{ width: "36px", height: "36px" }}
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
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("Edit")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-edit text-sm"></i>
          </Link>
        ) : (
          <button
            onClick={handleEdit}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("Edit")}
            style={{ width: "36px", height: "36px" }}
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
          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          title={t("Delete")}
          style={{ width: "36px", height: "36px" }}
        >
          <i className="fa fa-trash text-sm"></i>
        </button>
      )}

      {/* Custom Actions */}
      {customActions.map((action, index) => (
        <button
          key={index}
          onClick={() => action.onClick(itemId)}
          className={`p-2 ${action.bgColor || 'bg-gray-50'} hover:${action.hoverColor || 'bg-gray-100'} ${action.textColor || 'text-gray-700'} rounded-lg flex items-center justify-center transition-colors`}
          title={action.title}
          style={{ width: "36px", height: "36px" }}
        >
          <i className={`fa fa-${action.icon} text-sm`}></i>
        </button>
      ))}
    </div>
  );
};

export default TableRowActions;