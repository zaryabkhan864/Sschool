import React from "react";
import { useTranslation } from "react-i18next";

const AppBadge = ({ type, value, active }) => {
  const { t } = useTranslation();

  // =============================
  // 1️⃣ Boolean Active/Inactive
  // =============================
  if (type === "booleanStatus") {
    const isActive = !!active;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        <i
          className={`fas ${
            isActive ? "fa-check-circle" : "fa-times-circle"
          } mr-2`}
        ></i>
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
      male: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "fa-mars",
        label: t("Male"),
      },
      female: {
        bg: "bg-pink-100",
        text: "text-pink-800",
        icon: "fa-venus",
        label: t("Female"),
      },
      other: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: "fa-genderless",
        label: t("Other"),
      },
    };

    const config = genderConfig[normalized];

    if (!config) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          N/A
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <i className={`fas ${config.icon} mr-2`}></i>
        {config.label}
      </span>
    );
  }

  // =============================
  // 3️⃣ Grade Badge   ✅ NEW
  // =============================
  if (type === "grade") {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "fa-clock",
        label: t("Pending"),
      },
      under_review: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "fa-eye",
        label: t("Under Review"),
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "fa-check-circle",
        label: t("Resolved"),
      },
      closed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "fa-lock",
        label: t("Closed"),
      },
    };

    const config = statusConfig[normalized] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
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
      admin: "bg-red-100 text-red-800 border-red-200",
      teacher: "bg-blue-100 text-blue-800 border-blue-200",
      student: "bg-green-100 text-green-800 border-green-200",
      finance: "bg-yellow-100 text-yellow-800 border-yellow-200",
      counsellor: "bg-purple-100 text-purple-800 border-purple-200",
      default: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const classes = roleConfig[valLow] || roleConfig.default;

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-medium border rounded ${classes}`}
      >
        {value}
      </span>
    );
  }

  // Fallback for unknown types
  return null;
};

export default AppBadge;