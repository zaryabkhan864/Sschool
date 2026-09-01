import React, { useRef, useEffect, useState } from 'react';
import { Table, Pagination, Dropdown } from 'flowbite-react';
import { useTranslation } from 'react-i18next';

// ✅ FIX: the previous version built classes like `bg-${stat.color}-50` at
// runtime. Tailwind only picks up classes that appear as literal strings in
// source, so any color not already written out elsewhere in the codebase
// would silently produce NO background/text color in a production build —
// the stat cards would render unstyled. This static map guarantees every
// class Tailwind needs to see is present as a literal string.
const STAT_COLOR_STYLES = {
  blue: { chip: 'bg-brand-50 border-brand-100', iconBg: 'bg-brand-100', iconText: 'text-brand-600', label: 'text-brand-600' },
  green: { chip: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', label: 'text-emerald-600' },
  purple: { chip: 'bg-purple-50 border-purple-100', iconBg: 'bg-purple-100', iconText: 'text-purple-600', label: 'text-purple-600' },
  red: { chip: 'bg-red-50 border-red-100', iconBg: 'bg-red-100', iconText: 'text-red-600', label: 'text-red-600' },
  amber: { chip: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100', iconText: 'text-amber-600', label: 'text-amber-600' },
  indigo: { chip: 'bg-indigo-50 border-indigo-100', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', label: 'text-indigo-600' },
  teal: { chip: 'bg-teal-50 border-teal-100', iconBg: 'bg-teal-100', iconText: 'text-teal-600', label: 'text-teal-600' },
  orange: { chip: 'bg-orange-50 border-orange-100', iconBg: 'bg-orange-100', iconText: 'text-orange-600', label: 'text-orange-600' },
};
const getStatStyle = (color) => STAT_COLOR_STYLES[color] || STAT_COLOR_STYLES.blue;

const DataTableContainer = ({
  // Basic props
  title,
  subtitle,
  data,
  columns,
  isLoading,
  isFetching,

  // Pagination props
  pagination,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,

  // Search props
  search,
  setSearch,
  searchTerm,
  setSearchTerm,
  searchPlaceholder = "Search...",

  // Action props
  onRefresh,
  addButton,
  emptyState,
  filters,
  stats,
  userRole,

  // Custom render props
  renderHeaderInfo,
  renderFooterInfo,
  renderRowActions,

  // Additional props
  className = "",
  showSearch = true,
  showStats = true,
  showPagination = true,
  compactActions = true,
  actionButtonSize = "sm",
  showActionLabels = false,

  // Column control props
  columnDistribution = "auto",
  compactMode = false,
  autoResizeColumns = true,
  actionColumnText = "Action",
  actionColumnMinWidth = "80px",
  actionColumnMaxWidth = "120px"
}) => {
  const { t } = useTranslation();
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});

  const finalSearchPlaceholder = searchPlaceholder === "Search..."
    ? t("Search...")
    : searchPlaceholder;

  const finalActionColumnText = actionColumnText === "Action"
    ? t("Action")
    : actionColumnText;

  const defaultEmptyState = (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fa fa-inbox text-ink-400 text-2xl"></i>
      </div>
      <h3 className="text-lg-custom font-semibold text-ink-700 mb-2">{t("No data found")}</h3>
      <p className="text-ink-400">{t("No records to display")}</p>
    </div>
  );

  const getStats = () => {
    if (stats && stats.length > 0) return stats;

    return [
      {
        label: t("Total Records"),
        value: pagination?.total || pagination?.counts?.total || data?.length || 0,
        icon: "database",
        color: "blue"
      },
      {
        label: t("Current Page"),
        value: data?.length || 0,
        icon: "list",
        color: "green"
      },
      {
        label: t("Total Pages"),
        value: pagination?.totalPages || 1,
        icon: "file-alt",
        color: "purple"
      }
    ];
  };

  const displayStats = getStats();

  const handleClearSearch = () => {
    if (setSearch) setSearch("");
    if (setSearchTerm) setSearchTerm("");
  };

  useEffect(() => {
    if (autoResizeColumns && data.length > 0 && columnDistribution === "auto") {
      const calculatedWidths = {};
      const actionColumnSpacePercentage = renderRowActions ? 10 : 0;

      columns.forEach((col, index) => {
        if (!col.width) {
          let availableWidth = 100 - actionColumnSpacePercentage;
          let baseWidth = Math.floor(availableWidth / columns.length);
          calculatedWidths[index] = `${Math.max(baseWidth, 15)}%`;
        }
      });
      setColumnWidths(calculatedWidths);
    }
  }, [data, columns, autoResizeColumns, columnDistribution, renderRowActions]);

  const getActionColumnWidth = () => {
    if (compactMode) return '1%';
    return actionColumnMinWidth;
  };

  const actionColumnWidth = getActionColumnWidth();

  const hasPagination = pagination && pagination.totalPages > 1;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl-custom font-bold text-ink-900">{title}</h1>
            {subtitle && <p className="text-ink-600 mt-1">{subtitle}</p>}
            {renderHeaderInfo && renderHeaderInfo()}
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-ink-700 text-xs-custom font-bold rounded-xl flex items-center gap-2 transition-all"
                title={t("Refresh")}
              >
                <i className="fa fa-refresh"></i>
                <span className="hidden sm:inline">{t("Refresh")}</span>
              </button>
            )}
            {addButton}
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {displayStats.map((stat, index) => {
              const style = getStatStyle(stat.color);
              return (
                <div key={index} className={`border rounded-xl p-3.5 ${style.chip}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs-custom font-semibold mb-1 ${style.label}`}>
                        {stat.label}
                      </p>
                      <p className="text-lg-custom font-bold text-ink-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.iconBg}`}>
                      <i className={`fa fa-${stat.icon} ${style.iconText} text-lg`}></i>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search and Filters */}
        {(showSearch || filters) && (
          <div className="bg-surface-50 rounded-xl p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <i className="fa fa-search text-ink-400"></i>
                    </div>
                    <input
                      type="text"
                      placeholder={finalSearchPlaceholder}
                      className="block w-full pl-10 pr-12 py-3 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      value={search}
                      onChange={(e) => setSearch && setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-400 hover:text-ink-600"
                        onClick={handleClearSearch}
                        title={t("Clear")}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-sm-custom text-ink-600 mt-2">
                      <i className="fa fa-filter mr-2"></i>
                      {t("Showing results for")}: "{searchTerm}"
                      <button
                        className="ml-2 text-brand-600 hover:text-brand-700 font-semibold"
                        onClick={handleClearSearch}
                      >
                        {t("Clear")}
                      </button>
                    </p>
                  )}
                </div>
              )}
              {filters}
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-3"></div>
              <p className="text-ink-600">{t("Loading...")}</p>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse" ref={tableRef}>
            <thead className="bg-surface-50">
              <tr>
                {columns.map((col, index) => {
                  let colWidth = col.width;
                  if (!colWidth && columnWidths[index]) {
                    colWidth = columnWidths[index];
                  } else if (!colWidth && columnDistribution === "equal") {
                    colWidth = `${Math.floor(100 / columns.length)}%`;
                  }

                  return (
                    <th
                      key={index}
                      className={`font-semibold text-ink-700 text-xs-custom uppercase tracking-wide ${index === 0 ? 'pl-6 pr-3' : 'px-3'} py-3.5 text-left ${col.headerClassName || ''}`}
                      style={{
                        width: colWidth || 'auto',
                        minWidth: col.minWidth || '100px',
                        maxWidth: col.maxWidth || 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div className="truncate">
                        {col.header}
                      </div>
                    </th>
                  );
                })}
                {renderRowActions && (
                  <th
                    className="font-semibold text-ink-700 text-xs-custom px-4 py-3.5 text-center sticky right-0"
                    style={{
                      width: actionColumnWidth,
                      minWidth: actionColumnWidth,
                      backgroundColor: '#f8fafc',
                      boxShadow: '-1px 0 0 0 #e2e8f0',
                    }}
                  >
                    <div className="truncate uppercase tracking-wide">
                      {finalActionColumnText}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr key={row._id || row.id || rowIndex} className="hover:bg-surface-50/70 transition-colors">
                    {columns.map((col, colIndex) => {
                      let colWidth = col.width;
                      if (!colWidth && columnWidths[colIndex]) {
                        colWidth = columnWidths[colIndex];
                      }

                      return (
                        <td
                          key={colIndex}
                          className={`text-sm-custom text-ink-700 ${colIndex === 0 ? 'pl-6 pr-3' : 'px-3'} py-3 ${col.className || ''} ${compactMode ? 'py-2' : ''}`}
                          style={{
                            width: colWidth || 'auto',
                            minWidth: col.minWidth || '100px',
                            maxWidth: col.maxWidth || 'none',
                            overflow: 'hidden',
                            verticalAlign: 'middle',
                          }}
                        >
                          <div className="truncate">
                            {col.render ? col.render(row[col.accessor], row, rowIndex) : <span>{row[col.accessor]}</span>}
                          </div>
                        </td>
                      );
                    })}
                    {renderRowActions && (
                      <td
                        className="px-2 py-2 text-center bg-white sticky right-0"
                        style={{
                          width: '1%',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          boxShadow: '-1px 0 0 0 #e2e8f0',
                        }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {renderRowActions(row, rowIndex)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-4 py-8 text-center">
                    {emptyState || defaultEmptyState}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showPagination && hasPagination && (
          <div className="border-t border-surface-100 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm-custom text-ink-600">
                <p>
                  {t("Showing")}{" "}
                  <span className="font-semibold text-ink-900">
                    {((currentPage - 1) * limit) + 1} -{" "}
                    {Math.min(currentPage * limit, pagination.total)}
                  </span>{" "}
                  {t("of")}{" "}
                  <span className="font-semibold text-ink-900">{pagination.total}</span>{" "}
                  {t("records")}
                </p>
                {setLimit && (
                  <div className="mt-2 flex items-center gap-2">
                    <span>{t("Show")}:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-surface-200 rounded-lg px-2 py-1 text-sm-custom focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    >
                      {[5, 8, 10, 15, 20, 50].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span>{t("per page")}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                  showIcons
                  previousLabel=""
                  nextLabel=""
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {renderFooterInfo && renderFooterInfo()}
    </div>
  );
};

export { DataTableContainer };
