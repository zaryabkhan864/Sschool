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
        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-gray-700 truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-xs`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Options */}
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No options</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                  option.disabled ? 'opacity-50 pointer-events-none bg-gray-50' : ''
                }`}
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
            ))
          )}
        </div>
      )}

      {/* Clear Button */}
      {clearable && value && (
        <button
          type="button"
          className="absolute right-8 top-2 text-gray-400 hover:text-gray-600"
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