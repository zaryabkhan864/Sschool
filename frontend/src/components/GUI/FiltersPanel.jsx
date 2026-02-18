import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FiltersPanel = ({ 
  showFilters = false,
  onToggleFilters,
  filters = [],
  limit = 10,
  onLimitChange,
  onResetFilters,
  className = "",
  position = "right"
}) => {
  const { t } = useTranslation();

  const getPositionClass = () => {
    switch(position) {
      case "left": return "left-0";
      case "right": return "right-0";
      case "center": return "left-1/2 transform -translate-x-1/2";
      default: return "right-0";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onToggleFilters}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
      >
        <i className="fa fa-sliders-h"></i>
        <span>{t("Filters")}</span>
        <i className={`fa fa-chevron-${showFilters ? 'up' : 'down'} text-sm`}></i>
      </button>

      {showFilters && (
        <div className={`absolute ${getPositionClass()} mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4`}>
          <div className="space-y-4">
            {/* Limit Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("Items per page")}
              </label>
              <select
                value={limit}
                onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {[5, 8, 10, 15, 20, 50].map(n => (
                  <option key={n} value={n}>
                    {n} {t("items")}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Filters */}
            {filters.map((filter, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={filter.value}
                    onChange={filter.onChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'input' ? (
                  <input
                    type="text"
                    value={filter.value}
                    onChange={filter.onChange}
                    placeholder={filter.placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : null}
              </div>
            ))}

            {/* Reset Button */}
            <div className="pt-2 border-t">
              <button
                onClick={onResetFilters}
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