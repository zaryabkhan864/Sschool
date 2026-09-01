import React from "react";
import { useTranslation } from "react-i18next";

const AvatarUpload = ({ preview, onChange, name = "avatar" }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 p-3 border border-dashed border-surface-300 rounded-xl bg-surface-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-xl border-2 border-white overflow-hidden bg-surface-200 flex items-center justify-center shadow-soft">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <i className="fa fa-camera text-ink-400 text-xl"></i>
          )}
        </div>
        <label
          htmlFor={`${name}_field`}
          className="absolute -bottom-1 -right-1 bg-brand-500 text-white w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-md hover:bg-brand-600 transition-colors"
        >
          <i className="fa fa-plus text-[10px]"></i>
        </label>
        <input
          type="file"
          id={`${name}_field`}
          accept="image/*"
          onChange={onChange}
          name={name}
          className="hidden"
        />
      </div>
      <div>
        <h4 className="text-xs-custom font-bold text-ink-900">{t("Profile Picture")}</h4>
        <p className="text-[10px] text-ink-400">{t("Max size 2MB")}</p>
      </div>
    </div>
  );
};

export default AvatarUpload;
