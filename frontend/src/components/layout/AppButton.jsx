import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const AppButton = ({ onClick, text = "Refresh", icon = "sync-alt", className = "", disabled = false, showIcon = true }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs-custom font-bold rounded-xl shadow-button flex items-center gap-2 transition-all hover:shadow-premium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {showIcon && <i className={`fa fa-${icon} ${disabled ? "fa-spin" : ""}`}></i>}
      <span>{t(text)}</span>
    </button>
  );
};

AppButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  showIcon: PropTypes.bool,
};

export default AppButton;