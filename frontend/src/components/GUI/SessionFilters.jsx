import React from "react";
import { useTranslation } from "react-i18next";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppButton from "../GUI/AppButton";

const SessionFilters = ({
  keyword,
  onKeywordChange,
  filterAcademicLevel,
  onAcademicLevelChange,
  academicLevelOptions,
  onReset,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
          {t("Search")}
        </label>
        <div className="relative">
          <i className="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm-custom pointer-events-none"></i>
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={t("Search sessions...")}
            className="w-full pl-10 pr-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white placeholder:text-ink-400"
          />
        </div>
      </div>

      <SearchableDropdown
        label={t("Academic Level")}
        value={filterAcademicLevel}
        onChange={onAcademicLevelChange}
        options={academicLevelOptions}
        placeholder={t("Select...")}
      />

      <div className="flex items-center h-[42px] mt-[26px]">
        <AppButton
          label={t("Reset Filters")}
          icon="refresh"
          variant="secondary"
          onClick={onReset}
          type="button"
        />
      </div>
    </div>
  );
};

export default SessionFilters;
