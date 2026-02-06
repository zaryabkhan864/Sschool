import { Pagination as FlowbitePagination } from "flowbite-react";
import React from "react";
import { useTranslation } from 'react-i18next';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  resPerPage,
  onItemsPerPageChange 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
      {/* Records per Page Dropdown */}
      <div className="flex items-center">
        <label htmlFor="itemsPerPage" className="mr-2 text-sm font-medium">
          {t("entriesPerPage")}:
        </label>
        <select
          id="itemsPerPage"
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={resPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <FlowbitePagination
          currentPage={currentPage}
          layout="navigation"
          onPageChange={onPageChange}
          showIcons={true}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default Pagination;