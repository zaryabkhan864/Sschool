import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import AppButton from "./AppButton";

const AppPageHeader = ({ title, subtitle, backUrl }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      <div>
        <h1 className="text-xl-custom font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-xs-custom text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {/* 👇 Now uses the shared AppButton (backUrl-only → its "secondary"
          Back-button defaults) instead of a hand-rolled button, so this
          header and every other Back/Cancel button in the app always
          look identical and stay in sync with the theme automatically. */}
      <AppButton backUrl={backUrl} />
    </div>
  );
};

AppPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  backUrl: PropTypes.string.isRequired,
};

export default AppPageHeader;
