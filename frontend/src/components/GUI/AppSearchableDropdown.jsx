import React, { useState, useRef, useEffect } from 'react';

const AppSearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  isLoading = false,
  searchable = true,
  clearable = true,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Dropdown Trigger */}
      <div
        className={`w-full border rounded-xl px-4 py-2.5 bg-white cursor-pointer flex items-center justify-between transition-all
          ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-surface-200 hover:border-surface-300'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm-custom truncate ${selectedOption ? 'text-ink-900' : 'text-ink-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'} text-ink-400 text-xs transition-transform`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-surface-100 rounded-xl shadow-premium max-h-60 overflow-auto animate-slide-up">
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white p-2 border-b border-surface-100">
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm-custom border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Options */}
          {isLoading ? (
            <div className="p-4 text-center text-sm-custom text-ink-400">
              <i className="fa fa-spinner fa-spin mr-2"></i>Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm-custom text-ink-400">No options</div>
          ) : (
            <div className="p-1.5">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 mx-0.5 rounded-lg cursor-pointer text-sm-custom transition-colors
                    ${option.disabled
                      ? 'opacity-50 pointer-events-none text-ink-400'
                      : option.value === value
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-ink-700 hover:bg-surface-50'}`}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }
                  }}
                >
                  {renderOption ? renderOption(option) : option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clear Button */}
      {clearable && value && (
        <button
          type="button"
          className="absolute right-9 top-2.5 text-ink-400 hover:text-ink-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
        >
          <i className="fa fa-times-circle text-sm" />
        </button>
      )}
    </div>
  );
};

export default AppSearchableDropdown;
