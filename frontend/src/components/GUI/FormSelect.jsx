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
  const defaultSelectClass =
    "w-full px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white disabled:bg-surface-50 disabled:text-ink-400 disabled:cursor-not-allowed";
  const defaultLabelClass =
    "text-xs-custom font-semibold text-ink-700 uppercase tracking-wider";
  const errorSelectClass = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className={`${defaultLabelClass} ${labelClassName}`}>
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${defaultSelectClass} ${error ? errorSelectClass : ''} ${disabled ? 'bg-surface-50 cursor-not-allowed' : ''} ${selectClassName}`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <p className="text-xs-custom text-ink-400">{helperText}</p>
      )}

      {error && (
        <p className="text-xs-custom text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
