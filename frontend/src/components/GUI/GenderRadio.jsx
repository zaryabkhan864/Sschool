import React from "react";
import { useTranslation } from "react-i18next";

const GenderRadio = ({ value, onChange, name = "gender" }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs-custom font-semibold text-gray-700 uppercase tracking-wider">
        {t("Gender")}
      </label>
      <div className="flex gap-4 mt-1">
        {["Male", "Female"].map((g) => (
          <label
            key={g}
            className="flex items-center gap-1.5 text-sm-custom text-gray-700 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={g}
              checked={value === g}
              onChange={onChange}
              className="w-4 h-4 accent-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
            {t(g)}
          </label>
        ))}
      </div>
    </div>
  );
};

export default GenderRadio;