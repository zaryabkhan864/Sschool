import React, { useRef, useEffect, useState } from 'react';
import { Table, Pagination, Dropdown } from 'flowbite-react';

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
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});
  
  // Default empty state
  const defaultEmptyState = (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fa fa-inbox text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No data found</h3>
      <p className="text-gray-500">No records to display</p>
    </div>
  );

  // ✅ FIXED: Handle both paginated and non-paginated stats
  const getStats = () => {
    if (stats && stats.length > 0) return stats;
    
    // Default stats when not provided
    return [
      { 
        label: "Total Records", 
        value: pagination?.total || pagination?.counts?.total || data?.length || 0, 
        icon: "database", 
        color: "blue" 
      },
      { 
        label: "Current Page", 
        value: data?.length || 0, 
        icon: "list", 
        color: "green" 
      },
      { 
        label: "Total Pages", 
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

  // Calculate dynamic column widths
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

  // Updated Action Column Width logic for maximum compactness
  const getActionColumnWidth = () => {
    if (compactMode) return '1%';
    return actionColumnMinWidth;
  };

  const actionColumnWidth = getActionColumnWidth();

  // ✅ Check if pagination exists
  const hasPagination = pagination && pagination.totalPages > 1;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            {renderHeaderInfo && renderHeaderInfo()}
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
                title="Refresh"
              >
                <i className="fa fa-refresh"></i>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            {addButton}
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {displayStats.map((stat, index) => (
              <div key={index} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs text-${stat.color}-600 font-medium mb-1`}>
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <i className={`fa fa-${stat.icon} text-${stat.color}-600 text-lg`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        {(showSearch || filters) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa fa-search text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={search}
                      onChange={(e) => setSearch && setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={handleClearSearch}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      <i className="fa fa-filter mr-2"></i>
                      Showing results for: "{searchTerm}"
                      <button className="ml-2 text-blue-600 hover:text-blue-800" onClick={handleClearSearch}>
                        Clear
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse" ref={tableRef}>
            <thead className="bg-gray-50">
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
                      className={`font-semibold text-gray-700 ${index === 0 ? 'pl-6 pr-3' : 'px-3'} py-3 text-left ${col.headerClassName || ''}`}
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
                    className="font-semibold text-gray-700 px-4 py-3 text-center bg-gray-50 sticky right-0"
                    style={{
                      width: actionColumnWidth,
                      minWidth: actionColumnWidth,
                      backgroundColor: '#f9fafb',
                      boxShadow: '-1px 0 0 0 #e5e7eb',
                    }}
                  >
                    <div className="truncate text-xs uppercase tracking-wider">
                      {actionColumnText}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr key={row._id || row.id || rowIndex} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col, colIndex) => {
                      let colWidth = col.width;
                      if (!colWidth && columnWidths[colIndex]) {
                        colWidth = columnWidths[colIndex];
                      }

                      return (
                        <td
                          key={colIndex}
                          className={`${colIndex === 0 ? 'pl-6 pr-3' : 'px-3'} py-3 ${col.className || ''} ${compactMode ? 'py-2' : ''}`}
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
                        className="px-2 py-2 text-center bg-white hover:bg-gray-50 sticky right-0"
                        style={{
                          width: '1%',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          boxShadow: '-1px 0 0 0 #e5e7eb',
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

        {/* ✅ FIXED: Only show pagination if we have pagination data */}
        {showPagination && hasPagination && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p>
                  Showing{" "}
                  <span className="font-semibold">
                    {((currentPage - 1) * limit) + 1} -{" "}
                    {Math.min(currentPage * limit, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">{pagination.total}</span>{" "}
                  records
                </p>
                {setLimit && (
                  <div className="mt-2 flex items-center gap-2">
                    <span>Show:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[5, 8, 10, 15, 20, 50].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span>per page</span>
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

      {/* Footer Info */}
      {renderFooterInfo && renderFooterInfo()}
    </div>
  );
};

export { DataTableContainer };