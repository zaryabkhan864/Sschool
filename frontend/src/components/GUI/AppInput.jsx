import React from "react";

const AppInput = ({ label, name, value, onChange, type = "text", placeholder, required = false, rows = 3, ...props }) => {
  const inputClass = "w-full px-4 py-2.5 text-sm-custom border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white placeholder:text-gray-400";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs-custom font-semibold text-gray-700 uppercase tracking-wider">
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
    </div>
  );
};

export default AppInput;