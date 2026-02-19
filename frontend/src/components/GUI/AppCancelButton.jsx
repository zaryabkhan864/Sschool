import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AppCancelButton = ({ backUrl, label = "cancel", className = "" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => navigate(backUrl)}
      className={`px-4 py-2 text-xs font-medium text-gray-600 hover:text-red-600 hover:underline transition-all ${className}`}
    >
      {t(label)}
    </button>
  );
};

export default AppCancelButton;