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

  // Handle click outside
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

  // Handle infinite scroll observer
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

  // Get selected item label
  const selectedItem = useMemo(() => {
    if (!value) return "";
    return options.find(option => option.value === value)?.label || "";
  }, [value, options]);

  // Handle search
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setLocalPage(1);
    onSearch(searchValue, 1);
  };

  // Handle select
  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm(optionLabel);
  };

  // Handle clear
  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    onSearch("", 1);
  };

  const defaultInputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const defaultLabelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={defaultLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
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
          readOnly={!!value && showSelected}
          disabled={disabled}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          {isLoading ? (
            <i className="fa fa-spinner fa-spin text-[10px]"></i>
          ) : (
            <i className={`fa ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>
          )}
        </div>

        {isOpen && !disabled && (
          <div 
            ref={dropdownRef}
            className={`absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col ${dropdownClassName}`}
            style={{ maxHeight: '300px' }}
          >
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {options.length > 0 ? (
                <ul className="divide-y divide-gray-50">
                  {options.map((option, index) => {
                    const isLast = index === options.length - 1;
                    return (
                      <li
                        key={`${option.value}-${index}`}
                        ref={isLast && hasMore ? lastOptionElementRef : null}
                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-between ${value === option.value ? 'bg-blue-50' : ''}`}
                        onClick={() => handleSelect(option.value, option.label)}
                      >
                        {renderOption ? (
                          renderOption(option, value === option.value)
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                {option.label?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700 leading-tight">
                                  {option.label}
                                </p>
                                {option.subtitle && (
                                  <p className="text-[10px] text-gray-500">
                                    {option.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                            {value === option.value && (
                              <i className="fa fa-check-circle text-blue-500 text-sm"></i>
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
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] text-gray-500">{loadingMessage}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium italic">
                      {emptyMessage}
                    </p>
                  )}
                </div>
              )}

              {isLoading && options.length > 0 && (
                <div className="p-3 flex justify-center items-center gap-2 bg-gray-50/50 border-t border-gray-50">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-tighter">
                    Loading more...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {value && showSelected && (
        <div className="mt-2 flex items-center justify-between px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">
          <span className="text-[11px] text-blue-700 font-semibold">
            <i className="fa fa-check-circle mr-1"></i> {selectedItem}
          </span>
          {clearable && !disabled && (
            <button 
              type="button" 
              onClick={handleClear}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold"
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