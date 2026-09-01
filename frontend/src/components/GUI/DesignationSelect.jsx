import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const DesignationSelect = ({ value, onChange, name = "designationLevel" }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const designations = [
    { value: "junior", label: t("Junior") },
    { value: "senior", label: t("Senior") },
    { value: "mid", label: t("Mid") },
    { value: "lead", label: t("Lead") },
    { value: "manager", label: t("Manager") },
    { value: "assistant", label: t("Assistant") },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = designations.find((d) => d.value === value)?.label;

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
        {t("Designation Level")}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white text-left"
        >
          <span className={value ? "text-ink-900" : "text-ink-400"}>
            {selectedLabel || t("Select Designation")}
          </span>
          <i className={`fa fa-chevron-down text-xs text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <ul className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-surface-100 rounded-xl shadow-premium py-1.5 animate-slide-up">
            {designations.map(({ value: val, label }) => {
              const isSelected = value === val;
              return (
                <li key={val}>
                  <button
                    type="button"
                    onClick={() => handleSelect(val)}
                    className={`w-full text-left px-4 py-2 mx-0.5 rounded-lg text-sm-custom transition-colors ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-ink-700 hover:bg-surface-50"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DesignationSelect;
