import React from "react";
import { useTranslation } from "react-i18next";

const AvatarUpload = ({ preview, onChange, name = "avatar" }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 p-3 border border-dashed rounded-lg bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-xl border-2 border-white overflow-hidden bg-gray-200 flex items-center justify-center shadow-sm">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <i className="fa fa-camera text-gray-400 text-xl"></i>
          )}
        </div>
        <label
          htmlFor={`${name}_field`}
          className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
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
        <h4 className="text-xs font-bold text-gray-800">{t("Profile Picture")}</h4>
        <p className="text-[10px] text-gray-500">{t("Max size 2MB")}</p>
      </div>
    </div>
  );
};

export default AvatarUpload;