import React from 'react';

const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = "",
  labelClassName = "",
  size = "medium"
}) => {
  const getSizeClass = () => {
    switch(size) {
      case 'small': return 'w-4 h-4';
      case 'medium': return 'w-5 h-5';
      case 'large': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`${getSizeClass()} text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      />
      {label && (
        <label 
          htmlFor={name} 
          className={`text-sm font-medium text-gray-700 ${disabled ? 'text-gray-400' : 'cursor-pointer'} ${labelClassName}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default FormCheckbox;