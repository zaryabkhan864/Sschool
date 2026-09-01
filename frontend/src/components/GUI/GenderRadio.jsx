import React from "react";
import { useTranslation } from "react-i18next";
const GenderRadio = ({ value, onChange, name = "gender" }) => {
  const { t } = useTranslation();
  const options = ["Male", "Female"];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
        {t("Gender")}
      </label>
      <div className="flex gap-4 mt-1">
        {options.map((g) => {
          const isChecked = value === g;
          return (
            <label
              key={g}
              className="flex items-center gap-2 text-sm-custom text-ink-700 cursor-pointer select-none"
            >
              <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                {/* Native input kept for accessibility/form behavior — visually hidden */}
                <input
                  type="radio"
                  name={name}
                  value={g}
                  checked={isChecked}
                  onChange={onChange}
                  className="sr-only"
                />
                <span
                  className={`absolute inset-0 rounded-full border-2 transition-colors ${
                    isChecked ? "border-brand-500" : "border-surface-300"
                  }`}
                />
                {isChecked && (
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                )}
              </span>
              {t(g)}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default GenderRadio;
