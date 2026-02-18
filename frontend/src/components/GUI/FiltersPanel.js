import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FiltersPanel = ({ 
  showFilters, 
  setShowFilters, 
  limit, 
  setLimit, 
  setCurrentPage,
  setSearch,
  setSearchTerm,
  setTeacherFilter,
  className = "" 
}) => {
  const { t } = useTranslation();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
      >
        <i className="fa fa-sliders-h"></i>
        <span>{t("Filters")}</span>
        <i className={`fa fa-chevron-${showFilters ? 'up' : 'down'} text-sm`}></i>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("Items per page")}
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {[5, 8, 10, 15, 20, 50].map(n => (
                  <option key={n} value={n}>
                    {n} {t("items")}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  setSearch("");
                  setSearchTerm("");
                  setTeacherFilter("");
                  setCurrentPage(1);
                  setLimit(8);
                }}
                className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                <i className="fa fa-undo mr-2"></i>
                {t("Reset Filters")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;