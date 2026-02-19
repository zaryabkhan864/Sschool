import React from 'react';
import { useTranslation } from 'react-i18next';

const CountryBadge = ({ country }) => {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-50 text-purple-700 border border-purple-100">
      {country || t('Global')}
    </span>
  );
};

export default CountryBadge;