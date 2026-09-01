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
        className="h-[18px] w-[18px] text-brand-500 rounded-md focus:ring-2 focus:ring-brand-500/20 border-surface-300 cursor-pointer"
        {...rest}
      />
      {label && (
        <label
          htmlFor={`checkbox-${name}`}
          className="ml-2 block text-sm-custom font-medium text-ink-700 cursor-pointer"
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
