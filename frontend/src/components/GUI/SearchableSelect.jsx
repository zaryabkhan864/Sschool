import React from "react";

const SearchableSelect = ({
  label,
  placeholder,
  searchValue,
  onSearchChange,
  showDropdown,
  setShowDropdown,
  loading,
  items,
  onSelect,
  selectedId,
  selectedName,
  onClear,
  lastElementRef,
  inputRef,
  dropdownRef,
  required
}) => {
  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-[11px] font-semibold text-gray-500 uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder={selectedName || placeholder}
          value={searchValue}
          onChange={onSearchChange}
          onFocus={() => setShowDropdown(true)}
        />
        {selectedId && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fa fa-times-circle"></i>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-14 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={item._id || item.id}
              ref={index === items.length - 1 ? lastElementRef : null}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                selectedId === (item._id || item.id) ? "bg-blue-100 font-bold" : ""
              }`}
              onClick={() => onSelect(item._id || item.id, item.gradeName || item.name)}
            >
              {item.gradeName || item.name}
            </div>
          ))}
          {loading && <div className="p-3 text-center text-xs text-gray-500">Loading...</div>}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;