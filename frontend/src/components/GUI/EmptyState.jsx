import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon = "inbox",
  title = "",
  description = "",
  hasSearchTerm = false,
  searchTerm = "",
  actionButton = null,
  className = "",
  children
}) => {
  const { t } = useTranslation();

  const defaultTitle = hasSearchTerm 
    ? t("No results found for") + ` "${searchTerm}"`
    : t("No data available");
    
  const defaultDescription = hasSearchTerm
    ? t("Try adjusting your search or filters to find what you're looking for.")
    : t("Get started by creating a new item.");

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <i className={`fa fa-${icon} text-gray-400 text-3xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2 text-center">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        {description || defaultDescription}
      </p>
      
      {actionButton && (
        <div className="mb-6">
          {actionButton}
        </div>
      )}
      
      {children}
      
      <div className="mt-6 text-xs text-gray-400 flex items-center gap-4">
        <span className="flex items-center">
          <i className="fa fa-search mr-2"></i>
          {t("Try different keywords")}
        </span>
        <span className="flex items-center">
          <i className="fa fa-filter mr-2"></i>
          {t("Adjust filters")}
        </span>
        <span className="flex items-center">
          <i className="fa fa-undo mr-2"></i>
          {t("Clear search")}
        </span>
      </div>
    </div>
  );
};

export default EmptyState;