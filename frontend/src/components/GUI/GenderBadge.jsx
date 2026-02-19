import React from 'react';
import { useTranslation } from 'react-i18next';

const GenderBadge = ({ gender }) => {
  const { t } = useTranslation();
  const lowerGender = gender?.toLowerCase();

  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  let borderColor = 'border-gray-200';

  if (lowerGender === 'male') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
    borderColor = 'border-blue-200';
  } else if (lowerGender === 'female') {
    bgColor = 'bg-pink-100';
    textColor = 'text-pink-800';
    borderColor = 'border-pink-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} border ${borderColor}`}>
      {gender || t('N/A')}
    </span>
  );
};

export default GenderBadge;