import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FilterDropdown = ({ limit, onLimitChange, onReset, children }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
      >
        <i className="fa fa-sliders-h"></i>
        <span>{t('Filters')}</span>
        <i className={`fa fa-chevron-${showFilters ? 'up' : 'down'} text-sm`}></i>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="space-y-4">
            {/* Custom filters passed as children */}
            {children && (
              <>
                <div className="space-y-2">{children}</div>
                <div className="border-t border-gray-200"></div>
              </>
            )}

            {/* Default items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Items per page')}
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  onLimitChange(Number(e.target.value));
                  setShowFilters(false);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {[5, 8, 10, 15, 20, 50].map(n => (
                  <option key={n} value={n}>{n} {t('items')}</option>
                ))}
              </select>
            </div>

            {/* Reset button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onReset();
                  setShowFilters(false);
                }}
                className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                <i className="fa fa-undo mr-2"></i>{t('Reset Filters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;