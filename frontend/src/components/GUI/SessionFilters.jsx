import React from 'react';
import { useTranslation } from 'react-i18next';
import FormSelect from '../GUI/FormSelect';

const SessionFilters = ({ filterAcademicLevel, setFilterAcademicLevel, academicLevelOptions }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormSelect
        label={t("Academic Level")}
        value={filterAcademicLevel}
        onChange={(e) => setFilterAcademicLevel(e.target.value)}
        options={[
          { value: "", label: t("All Levels") },
          ...academicLevelOptions
        ]}
      />
      <div className="flex items-end">
        <button
          onClick={() => setFilterAcademicLevel("")}
          className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2"
        >
          <i className="fa fa-refresh"></i>
          {t("Reset Filters")}
        </button>
      </div>
    </div>
  );
};

export default SessionFilters;