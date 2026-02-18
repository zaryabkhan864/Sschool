// components/common/SelectField.jsx
import React from "react";
import PropTypes from "prop-types";

const SelectField = ({
  name,
  value,
  onChange,
  label,
  options = [],
  loading = false,
  placeholder = "Select",
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
        <option value="">
          {loading ? "Loading..." : placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default SelectField;