import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const AppPageHeader = ({ title, subtitle, backUrl }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      <div>
        <h1 className="text-xl-custom font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs-custom text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={() => navigate(backUrl)}
        className="px-4 py-2 text-xs-custom font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-soft transition-all active:scale-95"
      >
        <i className="fa fa-arrow-left mr-1.5"></i> {t("Back")}
      </button>
    </div>
  );
};

AppPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  backUrl: PropTypes.string.isRequired,
};

export default AppPageHeader;