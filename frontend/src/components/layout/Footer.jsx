import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="py-4 border-t border-surface-200 bg-surface-50">
      <p className="text-center text-xs-custom font-semibold text-ink-400">
        {t("School")} — 2020-{year}, {t("All Rights Reserved")}
      </p>
    </footer>
  );
};

export default Footer;
