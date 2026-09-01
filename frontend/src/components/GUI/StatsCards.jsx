import React from 'react';
import { useTranslation } from 'react-i18next';

const StatsCards = ({
  stats = [],
  className = "",
  columns = 4
}) => {
  const { t } = useTranslation();

  // Static map — every value here is a full literal class string so
  // Tailwind's scanner can always see it (unlike a `bg-${color}-100`
  // runtime template, which would silently fail to generate).
  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-brand-100 text-brand-800",
      green: "bg-emerald-100 text-emerald-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
      yellow: "bg-amber-100 text-amber-800",
      indigo: "bg-indigo-100 text-indigo-800",
      pink: "bg-pink-100 text-pink-800",
      gray: "bg-surface-100 text-ink-700"
    };
    return colorMap[color] || "bg-surface-100 text-ink-700";
  };

  const getGridColumns = () => {
    const colsMap = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
      5: "grid-cols-2 md:grid-cols-5",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
    };
    return colsMap[columns] || "grid-cols-2 md:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridColumns()} gap-4 mb-6 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-surface-100 p-4 shadow-soft hover:shadow-card transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm-custom text-ink-600">{stat.label}</p>
              <p className="text-2xl-custom font-bold text-ink-900 mt-1">
                {typeof stat.value === 'function' ? stat.value() : stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs-custom text-ink-400 mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
              <i className={`fa fa-${stat.icon || 'chart-bar'} text-lg`}></i>
            </div>
          </div>
          {stat.trend && (
            <div className="mt-3 flex items-center text-sm-custom">
              <span className={`flex items-center font-semibold ${stat.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                <i className={`fa fa-arrow-${stat.trend.direction} mr-1`}></i>
                {stat.trend.value}
              </span>
              <span className="text-ink-400 ml-2">{stat.trend.label}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
