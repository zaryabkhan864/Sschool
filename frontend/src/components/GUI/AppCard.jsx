import React from "react";
import PropTypes from "prop-types";

const AppCard = ({ title, icon, header, children, footer, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-gray-200 overflow-visible ${className}`}>
      {(header || title) && (
        <div className="p-6 border-b border-gray-100">
          {header ? (
            header
          ) : (
            <div className="flex items-center gap-2">
              {icon && <i className={`fa ${icon} text-brand-500 text-sm-custom`}></i>}
              <h3 className="font-bold text-sm-custom text-gray-800 uppercase tracking-wide">
                {title}
              </h3>
            </div>
          )}
        </div>
      )}

      {children && <div className="p-6">{children}</div>}

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

AppCard.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  header: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
};

export default AppCard;