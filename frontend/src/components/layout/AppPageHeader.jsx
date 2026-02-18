import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const AppPageHeader = ({ title, subtitle, backUrl }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <button
        onClick={() => navigate(backUrl)}
        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
      >
        <i className="fa fa-arrow-left mr-1"></i> Back
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