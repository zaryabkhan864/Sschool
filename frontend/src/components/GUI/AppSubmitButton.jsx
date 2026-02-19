import React from "react";
import { useTranslation } from "react-i18next";

const AppSubmitButton = ({ 
  label, 
  loadingLabel, 
  isLoading, 
  icon = "fa-save", 
  className = "" 
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2 ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 shadow-md active:transform active:scale-95"
      } ${className}`}
    >
      {isLoading ? (
        <>
          <i className="fa fa-spinner fa-spin"></i>
          {loadingLabel ? t(loadingLabel) : t("Processing...")}
        </>
      ) : (
        <>
          {icon && <i className={`fa ${icon}`}></i>}
          {t(label)}
        </>
      )}
    </button>
  );
};

export default AppSubmitButton;