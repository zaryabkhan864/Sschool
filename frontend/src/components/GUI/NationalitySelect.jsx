import React, { useEffect, useRef, useState } from "react";
import { useCountries } from "react-countries";
import { useTranslation } from "react-i18next";

const NationalitySelect = ({ value, onChange, name = "nationality" }) => {
  const { t } = useTranslation();
  const { countries } = useCountries();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // search state
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null); // to auto-focus

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Scroll to selected item when opened (only if it exists in filtered list)
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, searchTerm]);

  const handleSelect = (countryName) => {
    onChange({ target: { name, value: countryName } });
    setIsOpen(false);
  };

  const filteredCountries = countries?.filter(({ name: countryName }) =>
    countryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
        {t("Nationality")}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white text-left"
        >
          <span className={value ? "text-ink-900" : "text-ink-400"}>
            {value || t("Select Country")}
          </span>
          <i className={`fa fa-chevron-down text-xs text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-surface-100 rounded-xl shadow-premium py-1 animate-slide-up"
          >
            {/* Search input at top of list */}
            <div className="sticky top-0 px-2 py-1.5 bg-white border-b border-surface-100">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("Search country...")}
                className="w-full px-3 py-1.5 text-sm-custom border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Filtered country list */}
            {filteredCountries?.map(({ name: countryName }) => {
              const isSelected = value === countryName;
              return (
                <li key={countryName} data-selected={isSelected} className="px-1">
                  <button
                    type="button"
                    onClick={() => handleSelect(countryName)}
                    className={`w-full text-left px-3 py-2 my-0.5 rounded-lg text-sm-custom transition-colors ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-ink-700 hover:bg-surface-50"
                    }`}
                  >
                    {countryName}
                  </button>
                </li>
              );
            })}

            {/* Empty state when no country matches */}
            {filteredCountries?.length === 0 && (
              <li className="px-4 py-3 text-sm-custom text-ink-400 text-center">
                {t("No country found")}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NationalitySelect;
