import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FilterDropdown = ({ limit, onLimitChange, onReset, children }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        type="button"
        className="px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl bg-white hover:bg-surface-50 flex items-center gap-2 transition-all"
      >
        <i className="fa fa-sliders-h text-ink-400"></i>
        <span className="font-medium text-ink-700">{t('Filters')}</span>
        <i className={`fa fa-chevron-${showFilters ? 'up' : 'down'} text-xs text-ink-400 transition-transform`}></i>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-surface-100 rounded-xl shadow-premium z-10 p-4 animate-slide-up">
          <div className="space-y-4">
            {/* Custom filters passed as children */}
            {children && (
              <>
                <div className="space-y-4">{children}</div>
                <div className="border-t border-surface-100"></div>
              </>
            )}

            {/* Default items per page */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
                {t('Items per page')}
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  onLimitChange(Number(e.target.value));
                  setShowFilters(false);
                }}
                className="w-full px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
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
                type="button"
                className="w-full px-4 py-2.5 text-sm-custom font-medium bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl transition-all"
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
