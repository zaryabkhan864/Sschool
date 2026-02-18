import React from "react";
import PropTypes from "prop-types";

const AppCard = ({ header, children, footer, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible ${className}`}>
      {header && (
        <div className="p-5 border-b border-gray-100">
          {header}
        </div>
      )}
      {children && <div className="p-5">{children}</div>}
      {footer && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

AppCard.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
};

export default AppCard;