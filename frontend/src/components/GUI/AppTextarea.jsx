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
        <label className="block text-xs-custom font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white placeholder:text-ink-400 resize-none ${className}`}
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
