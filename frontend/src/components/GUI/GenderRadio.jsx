import React from "react";
import { useTranslation } from "react-i18next";

const GenderRadio = ({ value, onChange, name = "gender" }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold text-gray-500 uppercase">
        {t("Gender")}
      </label>
      <div className="flex gap-4 mt-1">
        {["Male", "Female"].map((g) => (
          <label key={g} className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="radio"
              name={name}
              value={g}
              checked={value === g}
              onChange={onChange}
              className="w-3.5 h-3.5 text-blue-600"
            />
            {t(g)}
          </label>
        ))}
      </div>
    </div>
  );
};

export default GenderRadio;