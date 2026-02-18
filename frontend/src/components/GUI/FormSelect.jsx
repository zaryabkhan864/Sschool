import React from 'react';

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  labelClassName = "",
  selectClassName = ""
}) => {
  const defaultSelectClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white";
  const defaultLabelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";
  const errorSelectClass = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className={`${defaultLabelClass} ${labelClassName}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${defaultSelectClass} ${error ? errorSelectClass : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${selectClassName}`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;