import React from "react";
import { useTranslation } from "react-i18next";

const AppBadge = ({ type, value, active }) => {
  const { t } = useTranslation();

  // Shared pill style — every badge type below composes onto this so
  // weight/spacing/border treatment stays identical across the app.
  const pill = "inline-flex items-center px-3 py-1.5 rounded-full text-xs-custom font-semibold border";

  // =============================
  // 1️⃣ Boolean Status (Active / Inactive)
  // =============================
  if (type === "booleanStatus") {
    const isActive = !!active;
    return (
      <span
        className={`${pill} ${
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}
      >
        <i className={`fas ${isActive ? "fa-check-circle" : "fa-times-circle"} mr-2`}></i>
        {isActive ? t("Active") : t("Inactive")}
      </span>
    );
  }

  // =============================
  // 2️⃣ Gender Badge
  // =============================
  if (type === "gender") {
    const normalized = value?.toLowerCase()?.trim();
    const genderConfig = {
      male: { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-200", icon: "fa-mars", label: t("Male") },
      female: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", icon: "fa-venus", label: t("Female") },
      other: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "fa-genderless", label: t("Other") },
    };
    const config = genderConfig[normalized];
    if (!config) {
      return <span className={`${pill} bg-surface-100 text-ink-600 border-surface-200`}>N/A</span>;
    }
    return (
      <span className={`${pill} ${config.bg} ${config.text} ${config.border}`}>
        <i className={`fas ${config.icon} mr-2`}></i>
        {config.label}
      </span>
    );
  }

  // =============================
  // 3️⃣ Grade Badge
  // =============================
  if (type === "grade") {
    return (
      <span className={`${pill} bg-indigo-50 text-indigo-700 border-indigo-200`}>
        <i className="fas fa-graduation-cap mr-2"></i>
        {value}
      </span>
    );
  }

  // =============================
  // 4️⃣ Counseling Status
  // =============================
  if (type === "counselingStatus") {
    const normalized = value?.toLowerCase()?.trim();
    const statusConfig = {
      pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "fa-clock", label: t("Pending") },
      under_review: { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-200", icon: "fa-eye", label: t("Under Review") },
      resolved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "fa-check-circle", label: t("Resolved") },
      closed: { bg: "bg-surface-100", text: "text-ink-600", border: "border-surface-200", icon: "fa-lock", label: t("Closed") },
    };
    const config = statusConfig[normalized] || statusConfig.pending;
    return (
      <span className={`${pill} ${config.bg} ${config.text} ${config.border}`}>
        <i className={`fas ${config.icon} mr-2`}></i>
        {config.label}
      </span>
    );
  }

  // =============================
  // 5️⃣ Role Badge
  // =============================
  if (type === "role") {
    const valLow = value?.toLowerCase();
    const roleConfig = {
      admin: "bg-red-50 text-red-700 border-red-200",
      teacher: "bg-brand-50 text-brand-700 border-brand-200",
      student: "bg-emerald-50 text-emerald-700 border-emerald-200",
      finance: "bg-amber-50 text-amber-700 border-amber-200",
      counselor: "bg-purple-50 text-purple-700 border-purple-200",
      default: "bg-surface-100 text-ink-600 border-surface-200",
    };
    const classes = roleConfig[valLow] || roleConfig.default;
    return <span className={`${pill} rounded-lg ${classes}`}>{value}</span>;
  }

  // =============================
  // 6️⃣ Contract Status Badge
  // =============================
  if (type === "contractStatus") {
    const normalized = value?.toLowerCase()?.trim();
    const statusConfig = {
      active: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "fa-check-circle", label: t("Active") },
      terminated: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "fa-ban", label: t("Terminated") },
      expired: { bg: "bg-surface-100", text: "text-ink-600", border: "border-surface-200", icon: "fa-calendar-times", label: t("Expired") },
      transferred: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "fa-exchange-alt", label: t("Transferred") },
    };
    const config = statusConfig[normalized] || {
      bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-200", icon: "fa-info-circle", label: value,
    };
    return (
      <span className={`${pill} ${config.bg} ${config.text} ${config.border}`}>
        <i className={`fas ${config.icon} mr-2`}></i>
        {config.label}
      </span>
    );
  }

  // =============================
  // 7️⃣ Account Status Badge
  // =============================
  if (type === "accountStatus") {
    const normalized = value?.toLowerCase()?.trim();
    const accountConfig = {
      active: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "fa-check-circle", label: t("Active") },
      inactive: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "fa-times-circle", label: t("Inactive") },
      pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "fa-clock", label: t("Pending") },
    };
    const config = accountConfig[normalized] || {
      bg: "bg-surface-100", text: "text-ink-600", border: "border-surface-200", icon: "fa-question-circle", label: value,
    };
    return (
      <span className={`${pill} ${config.bg} ${config.text} ${config.border}`}>
        <i className={`fas ${config.icon} mr-2`}></i>
        {config.label}
      </span>
    );
  }

  // =============================
  // 8️⃣ Lifecycle Status Badge
  // =============================
  if (type === "lifecycleStatus") {
    const normalized = value?.toLowerCase()?.trim();
    const lifecycleConfig = {
      uncontracted: { bg: "bg-surface-100", text: "text-ink-600", border: "border-surface-200", icon: "fa-user-plus", label: t("Uncontracted") },
      contracted: { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-200", icon: "fa-file-signature", label: t("Contracted") },
      suspended: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "fa-pause-circle", label: t("Suspended") },
      expelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "fa-user-slash", label: t("Expelled") },
      leave: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "fa-calendar-minus", label: t("On Leave") },
      passout: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "fa-graduation-cap", label: t("Passout") },
      transferred: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "fa-exchange-alt", label: t("Transferred") },
      alumni: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "fa-user-graduate", label: t("Alumni") },
      resigned: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "fa-door-open", label: t("Resigned") },
      terminated: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "fa-ban", label: t("Terminated") },
    };
    const config = lifecycleConfig[normalized] || {
      bg: "bg-surface-100", text: "text-ink-600", border: "border-surface-200", icon: "fa-question-circle", label: value,
    };
    return (
      <span className={`${pill} ${config.bg} ${config.text} ${config.border}`}>
        <i className={`fas ${config.icon} mr-2`}></i>
        {config.label}
      </span>
    );
  }

  // Fallback for unknown types
  return null;
};

export default AppBadge;
