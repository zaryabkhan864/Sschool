import React from "react";
import { useCountries } from "react-countries";
import { useTranslation } from "react-i18next";

const NationalitySelect = ({ value, onChange, name = "nationality" }) => {
  const { t } = useTranslation();
  const { countries } = useCountries();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs-custom font-semibold text-gray-700 uppercase tracking-wider">
        {t("Nationality")}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 text-sm-custom border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white placeholder:text-gray-400"
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