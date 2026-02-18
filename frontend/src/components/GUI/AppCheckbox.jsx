import React from "react";
import PropTypes from "prop-types";

const AppCheckbox = ({
  name,
  checked,
  onChange,
  label,
  className = "",
  ...rest
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={`checkbox-${name}`}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        {...rest}
      />
      {label && (
        <label
          htmlFor={`checkbox-${name}`}
          className="ml-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
    </div>
  );
};

AppCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default AppCheckbox;