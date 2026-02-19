import React from 'react';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ active }) => {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
      active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <i className={`fas ${active ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
      {active ? t('Active') : t('Inactive')}
    </span>
  );
};

export default StatusBadge;