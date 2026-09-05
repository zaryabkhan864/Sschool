import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 👇 REWRITTEN to be a superset of the original API — every existing
// call site across the app (old `text`/`icon` "Refresh" buttons AND the
// newer `label`/`loadingLabel`/`isLoading`/`backUrl`/`type` calls used
// throughout the Salary/Expense/Event/Posting modules) now works
// correctly from ONE component, instead of silently rendering as a
// default "Refresh" button because those props didn't exist before.
//
// Colors now come from tailwind.config.js's `brand` palette (was
// hardcoded `bg-green-600` for every single button — Cancel, Delete,
// and Submit all looked identical). `variant` picks which semantic
// color to use.
const VARIANT_CLASSES = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-button",
  secondary: "bg-white hover:bg-surface-50 text-ink-700 border border-surface-200 shadow-soft",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-button",
  ghost: "bg-transparent hover:bg-surface-100 text-ink-600",
};

// Normalizes an icon name so callers can pass it either way —
// `icon="magic"` (original convention) or `icon="fa-magic"` (used in
// several newer components) — without ever producing a broken
// double-prefixed class like `fa fa-fa-magic`.
const normalizeIcon = (icon) => (icon?.startsWith("fa-") ? icon.slice(3) : icon);

const AppButton = ({
  onClick,
  backUrl,
  type = "button",
  text,
  label, // alias for `text`, used by the newer call sites
  loadingLabel,
  isLoading = false,
  variant,
  icon,
  className = "",
  disabled = false,
  showIcon = true,
  size, // "sm" shrinks padding/font for inline table-row actions
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // A backUrl-only button (no onClick) is almost always a "Cancel/Back"
  // action — give it sensible defaults (arrow-left icon, "Back" label,
  // the muted `secondary` look) instead of falling back to the generic
  // primary "sync-alt / Refresh" defaults meant for actual refresh
  // buttons.
  const isBackButton = Boolean(backUrl) && !onClick;

  const resolvedVariant = variant || (isBackButton ? "secondary" : "primary");
  const resolvedIcon = icon || (isBackButton ? "arrow-left" : "sync-alt");
  const providedText = label ?? text;
  const resolvedText = providedText !== undefined ? providedText : isBackButton ? "Back" : "Refresh";

  const isDisabled = disabled || isLoading;
  const displayText = isLoading && loadingLabel ? loadingLabel : resolvedText;
  const iconName = normalizeIcon(resolvedIcon);
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs";

  const handleClick = (e) => {
    if (onClick) return onClick(e);
    if (backUrl) return navigate(backUrl);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`${sizeClasses} font-bold rounded-lg flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
        VARIANT_CLASSES[resolvedVariant] || VARIANT_CLASSES.primary
      } ${className}`}
    >
      {showIcon && <i className={`fa fa-${isLoading ? "spinner" : iconName} ${isLoading ? "fa-spin" : ""}`}></i>}
      {displayText !== undefined && displayText !== null && (
        <span>{typeof displayText === "string" ? t(displayText) : displayText}</span>
      )}
    </button>
  );
};

AppButton.propTypes = {
  onClick: PropTypes.func,
  backUrl: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  text: PropTypes.node,
  label: PropTypes.node,
  loadingLabel: PropTypes.node,
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "ghost"]),
  icon: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md"]),
};

export default AppButton;
