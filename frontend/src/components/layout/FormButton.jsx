// components/common/FormButton.jsx
import React from "react";
import PropTypes from "prop-types";

const FormButton = ({
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  children,
  variant = "primary",
  className = "",
  ...rest
}) => {
  const baseClasses = "px-6 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-400",
    secondary: "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm disabled:bg-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md disabled:bg-gray-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <i className="fa fa-spinner fa-spin"></i>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

FormButton.propTypes = {
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  className: PropTypes.string,
};

export default FormButton;