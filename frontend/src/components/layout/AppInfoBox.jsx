import React from "react";
import PropTypes from "prop-types";

const AppInfoBox = ({ children, icon = "fa-info-circle" }) => {
  return (
    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs text-gray-600">
        <i className={`fa ${icon} text-blue-500 mr-1`}></i>
        {children}
      </p>
    </div>
  );
};

AppInfoBox.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.string,
};

export default AppInfoBox;