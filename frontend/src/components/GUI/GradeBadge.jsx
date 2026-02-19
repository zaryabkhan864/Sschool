// src/components/GUI/GradeBadge.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const GradeBadge = ({ gradeName }) => {
  const { t } = useTranslation();
  if (!gradeName) {
    return (
      <span className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded border border-gray-100">
        {t("Not Assigned")}
      </span>
    );
  }
  return (
    <span
      className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-100 truncate font-medium inline-block max-w-full"
      title={gradeName}
    >
      {gradeName}
    </span>
  );
};

export default GradeBadge;