import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 👇 REWRITTEN: was using Bootstrap classes (`row`, `d-flex
// justify-content-center`) which don't do anything in a Tailwind-only
// setup — replaced with real Tailwind utilities, and themed with the
// same tokens as everywhere else.
const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <img src="/images/404.svg" height="320" width="320" alt="404 Not Found" className="max-w-full h-auto" />
      <h5 className="text-center text-sm-custom text-ink-600 mt-4">
        {t("Page Not Found. Go to")}{" "}
        <Link to="/" className="text-brand-600 font-semibold hover:underline">
          {t("Homepage")}
        </Link>
      </h5>
    </div>
  );
};

export default NotFound;
