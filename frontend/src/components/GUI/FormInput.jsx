import React from 'react';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  inputClassName = "",
  labelClassName = "",
  minLength,
  maxLength,
  pattern,
  rows,
  ...props
}) => {
  const defaultInputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const defaultLabelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";
  const errorInputClass = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className={`${defaultLabelClass} ${labelClassName}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <InputComponent
        id={name}
        name={name}
        type={type !== 'textarea' ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        rows={rows}
        className={`${defaultInputClass} ${error ? errorInputClass : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClassName}`}
        {...props}
      />
      
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;