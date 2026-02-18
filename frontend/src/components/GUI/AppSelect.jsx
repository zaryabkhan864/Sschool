import React from "react";
import PropTypes from "prop-types";

const AppSelect = ({
  name,
  value,
  onChange,
  label,
  options = [],
  placeholder = "Select an option",
  loading = false,
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
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white ${className}`}
        {...rest}
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

AppSelect.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default AppSelect;