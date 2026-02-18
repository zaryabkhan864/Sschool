import React from "react";
import PropTypes from "prop-types";

const SubmitButton = ({
  children,
  isLoading = false,
  loadingText = "Submitting...",
  className = "",
  ...rest
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 shadow-md"
      } ${className}`}
      {...rest}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

SubmitButton.propTypes = {
  children: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  className: PropTypes.string,
};

export default SubmitButton;