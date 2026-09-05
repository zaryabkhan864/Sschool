// src/components/finance/salary/SelectField.jsx
//
// Thin wrapper around a native <select>, used by every dropdown in this
// module (month/year/status/gender/payment method). Kept as ONE small
// file on purpose: if/when you wire in your own shared dropdown
// component (e.g. the one EmployeeContractForm uses internally), this
// is the only file that needs to change — every other file in the
// module already imports from here instead of rendering a raw
// <select>.
import React from "react";

const SelectField = ({
  label,
  value,
  onChange,
  options,
  optionLabel = (o) => o,
  optionValue = (o) => o,
  placeholder,
  disabled = false,
  className = "",
}) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none p-2 pr-9 border border-gray-300 rounded-lg text-sm-custom
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
          disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={optionValue(opt)} value={optionValue(opt)}>
            {optionLabel(opt)}
          </option>
        ))}
      </select>
      <i className="fa fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
    </div>
  </div>
);

export default SelectField;