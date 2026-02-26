import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const variants = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-soft",
  success: "bg-green-600 hover:bg-green-700 text-white shadow-soft",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-soft",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-soft",
  ghost: "text-gray-600 hover:text-brand-600 hover:underline bg-transparent shadow-none",
};

const AppButton = ({
  label,
  loadingLabel,
  isLoading = false,
  icon,
  variant = "primary",
  type = "button",
  to,
  onClick,
  disabled = false,
  className = "",
  showIcon = true,
  backUrl,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const baseStyles =
    "px-5 py-2.5 text-xs-custom font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const finalClass = `${baseStyles} ${
    variants[variant] || variants.primary
  } ${className}`;

  const content = (
    <>
      {isLoading ? (
        <>
          <i className="fa fa-spinner fa-spin"></i>
          {loadingLabel ? t(loadingLabel) : t("Processing...")}
        </>
      ) : (
        <>
          {showIcon && icon && <i className={`fa fa-${icon}`}></i>}
          {label && <span>{t(label)}</span>}
        </>
      )}
    </>
  );

  if (backUrl) {
    return (
      <button
        type="button"
        onClick={() => navigate(backUrl)}
        className={`${baseStyles} ${variants.ghost} ${className}`}
      >
        {t(label || "Cancel")}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={finalClass}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={finalClass}
    >
      {content}
    </button>
  );
};

export default AppButton;