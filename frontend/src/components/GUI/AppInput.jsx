import React from "react";
import DatePickerField from "./DatePickerField";

const AppInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  rows = 3,
  helperText,
  className, // ✅ pulled out separately so it MERGES instead of overriding
  ...props
}) => {
  const baseClass =
    "w-full px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white placeholder:text-ink-400 accent-brand-500 disabled:bg-surface-50 disabled:text-ink-400 disabled:cursor-not-allowed";

  const inputClass = `${baseClass} ${className || ""}`.trim();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={inputClass}
          {...props}
        />
      ) : type === "date" ? (
        <DatePickerField
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={props.min}
          max={props.max}
          disabled={props.disabled}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
          {...props}
        />
      )}

      {helperText && <p className="text-xs-custom text-ink-400">{helperText}</p>}
    </div>
  );
};

export default AppInput;
