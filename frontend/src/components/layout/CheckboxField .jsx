// components/common/CheckboxField.jsx
import React from "react";
import PropTypes from "prop-types";

const CheckboxField = ({
  name,
  checked,
  onChange,
  label,
  className = "",
  ...rest
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className={`h-5 w-5 text-blue-600 rounded focus:ring-blue-500 ${className}`}
        {...rest}
      />
      {label && (
        <label htmlFor={name} className="ml-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default CheckboxField;