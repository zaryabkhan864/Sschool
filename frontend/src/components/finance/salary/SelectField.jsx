// src/components/finance/salary/SelectField.jsx
//
// Thin wrapper around a native <select>, used by every dropdown in this
// module (month/year/status/gender/payment method). Kept as ONE small
// file on purpose: if/when you wire in your own shared dropdown
// component, this is the only file that needs to change — every other
// file in the module already imports from here instead of rendering a
// raw <select>.
import React from "react";

const SelectField = ({
  label,
  value,
  onChange,
  options,
  optionLabel = (o) => o,
  optionValue = (o) => o,
  placeholder,
  className = "",
}) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border border-gray-300 rounded-md ${className}`}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={optionValue(opt)} value={optionValue(opt)}>
          {optionLabel(opt)}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
