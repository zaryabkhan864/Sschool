import React from "react";
import PropTypes from "prop-types";

const AppInput = ({
  name,
  value,
  onChange,
  label,
  type = "text",
  placeholder = "",
  required = false,
  className = "",
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {label} {required && "*"}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400 ${className}`}
        {...rest}
      />
    </div>
  );
};

AppInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default AppInput;