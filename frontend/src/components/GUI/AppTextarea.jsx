import React from "react";
import PropTypes from "prop-types";

const AppTextarea = ({
  name,
  value,
  onChange,
  label,
  rows = 3,
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
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400 resize-none ${className}`}
        {...rest}
      />
    </div>
  );
};

AppTextarea.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default AppTextarea;