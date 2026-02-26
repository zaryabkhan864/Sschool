import React from "react";
import PropTypes from "prop-types";

const AppInfoBox = ({ children, icon = "fa-info-circle" }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="text-xs-custom text-gray-600 flex items-start gap-2">
        <i className={`fa ${icon} text-brand-500 mt-0.5`}></i>
        <span>{children}</span>
      </p>
    </div>
  );
};

AppInfoBox.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.string,
};

export default AppInfoBox;