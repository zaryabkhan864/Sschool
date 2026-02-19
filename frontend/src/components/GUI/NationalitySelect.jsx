import React from "react";
import { useCountries } from "react-countries";
import { useTranslation } from "react-i18next";

const NationalitySelect = ({ value, onChange, name = "nationality" }) => {
  const { t } = useTranslation();
  const { countries } = useCountries();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-500 uppercase">
        {t("Nationality")}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{t("Select Country")}</option>
        {countries?.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NationalitySelect;