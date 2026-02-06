import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const AddButton = ({ to, text, icon = "plus", className = "", showIcon = true }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={to}
      className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-lg ${className}`}
    >
      {showIcon && <i className={`fa fa-${icon}`}></i>}
      <span>{t(text)}</span>
    </Link>
  );
};

AddButton.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
};

export default AddButton;