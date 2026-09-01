import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Default status options – feel free to adjust or pass custom options via props.
 */
const DEFAULT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

const StatusSelect = ({
  value,
  onChange,
  name = "status",
  label: customLabel,
  options = DEFAULT_STATUS_OPTIONS,
}) => {
  const { t } = useTranslation();
  const finalLabel = customLabel || t("Status");

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, searchTerm]);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const filteredOptions = options.filter(({ label, value }) => {
    const term = searchTerm.toLowerCase();
    return (
      label.toLowerCase().includes(term) || value.toLowerCase().includes(term)
    );
  });

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
        {finalLabel}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white text-left"
        >
          <span className={value ? "text-ink-900" : "text-ink-400"}>
            {selectedLabel || t("Select status")}
          </span>
          <i className={`fa fa-chevron-down text-xs text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-surface-100 rounded-xl shadow-premium py-1.5 animate-slide-up"
          >
            <div className="sticky top-0 px-2 py-1.5 bg-white border-b border-surface-100">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("Search status...")}
                className="w-full px-3 py-1.5 text-sm-custom border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {filteredOptions.map(({ value: optValue, label }) => {
              const isSelected = value === optValue;
              return (
                <li key={optValue} data-selected={isSelected} className="px-1">
                  <button
                    type="button"
                    onClick={() => handleSelect(optValue)}
                    className={`w-full text-left px-3 py-2 my-0.5 rounded-lg text-sm-custom transition-colors ${
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

            {filteredOptions.length === 0 && (
              <li className="px-4 py-3 text-sm-custom text-ink-400 text-center">
                {t("No status found")}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StatusSelect;
