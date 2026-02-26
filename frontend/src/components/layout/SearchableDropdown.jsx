import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const SearchableDropdown = ({
  label,
  value,
  onChange,
  onSearch,
  options = [],
  isLoading = false,
  hasMore = true,
  placeholder = "Search...",
  required = false,
  disabled = false,
  error = "",
  renderOption = null,
  className = "",
  dropdownClassName = "",
  inputClassName = "",
  showSelected = true,
  clearable = true,
  emptyMessage = "No results found",
  loadingMessage = "Loading...",
  initialSearch = ""
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isOpen, setIsOpen] = useState(false);
  const [localPage, setLocalPage] = useState(1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const observer = useRef();
  const lastElementRef = useRef();

  // 🔁 Sync internal searchTerm with the label of the selected value
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.value === value);
      if (selectedOption && selectedOption.label !== searchTerm) {
        setSearchTerm(selectedOption.label);
      }
    } else {
      // If value is cleared, optionally clear search term
      if (searchTerm !== '') setSearchTerm('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]); // Only runs when value or options change

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lastOptionElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        setLocalPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const selectedItem = useMemo(() => {
    if (!value) return "";
    return options.find(option => option.value === value)?.label || "";
  }, [value, options]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setLocalPage(1);
    if (onSearch) {
      onSearch(searchValue, 1);
    }
  };

  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm(optionLabel); // immediate update
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    if (onSearch) {
      onSearch("", 1);
    }
  };

  const displayOptions = useMemo(() => {
    if (onSearch) {
      return options;
    } else {
      if (!searchTerm) return options;
      const lower = searchTerm.toLowerCase();
      return options.filter(opt => 
        opt.label?.toLowerCase().includes(lower) ||
        opt.subtitle?.toLowerCase().includes(lower)
      );
    }
  }, [options, searchTerm, onSearch]);

  const defaultInputClass = "w-full px-4 py-2.5 text-sm-custom border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const defaultLabelClass = "block text-xs-custom font-semibold text-gray-700 uppercase tracking-wider mb-1.5";

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={defaultLabelClass}>
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`${defaultInputClass} ${inputClassName} pr-10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          onClick={() => !disabled && setIsOpen(true)}
          required={required}
          readOnly={!!value && showSelected} // Kept as original
          disabled={disabled}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
          {isLoading ? (
            <i className="fa fa-spinner fa-spin text-xs-custom"></i>
          ) : (
            <i className={`fa ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs-custom`}></i>
          )}
        </div>

        {isOpen && !disabled && (
          <div 
            ref={dropdownRef}
            className={`absolute left-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-premium overflow-hidden flex flex-col ${dropdownClassName}`}
            style={{ 
              maxHeight: '300px', 
              minWidth: '300px',
              width: 'auto',
              maxWidth: 'min(90vw, 400px)'
            }}
          >
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {displayOptions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {displayOptions.map((option, index) => {
                    const isLast = index === displayOptions.length - 1;
                    return (
                      <li
                        key={`${option.value}-${index}`}
                        ref={onSearch && isLast && hasMore ? lastOptionElementRef : null}
                        className={`px-4 py-3 hover:bg-brand-50 cursor-pointer transition-all flex items-center justify-between ${value === option.value ? 'bg-brand-50' : ''}`}
                        onClick={() => handleSelect(option.value, option.label)}
                      >
                        {renderOption ? (
                          renderOption(option, value === option.value)
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs-custom font-bold shadow-sm">
                                {option.label?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-sm-custom font-semibold text-gray-800 leading-tight">
                                  {option.label}
                                </p>
                                {option.subtitle && (
                                  <p className="text-xs-custom text-gray-500">
                                    {option.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                            {value === option.value && (
                              <i className="fa fa-check-circle text-brand-500 text-base-custom"></i>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs-custom text-gray-500">{loadingMessage}</p>
                    </div>
                  ) : (
                    <p className="text-xs-custom text-gray-400 font-medium italic">
                      {emptyMessage}
                    </p>
                  )}
                </div>
              )}

              {isLoading && displayOptions.length > 0 && (
                <div className="p-3 flex justify-center items-center gap-2 bg-gray-50/50 border-t border-gray-100">
                  <div className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs-custom text-brand-600 font-semibold uppercase tracking-tighter">
                    Loading more...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs-custom text-red-500 mt-1.5">{error}</p>
      )}

      {value && showSelected && (
        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg">
          <span className="text-xs-custom text-brand-700 font-semibold">
            <i className="fa fa-check-circle mr-1.5"></i> {selectedItem}
          </span>
          {clearable && !disabled && (
            <button 
              type="button" 
              onClick={handleClear}
              className="text-xs-custom text-red-500 hover:text-red-700 font-bold"
            >
              CLEAR
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;