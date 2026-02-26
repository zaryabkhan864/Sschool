import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  useGetGradesQuery,
  useDeleteGradeMutation,
} from "../../redux/api/gradesApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import ActionButtons from "../GUI/ActionButtons";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import AppBadge from "../GUI/AppBadge";

const ListGrades = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [statusFilter, setStatusFilter] = useState(""); // "active", "inactive", or ""
  const [showFilters, setShowFilters] = useState(false); // filter dropdown visibility

  // Toast from navigation (e.g., after creating a grade)
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Grade created successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // API query
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetGradesQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    status: statusFilter || undefined,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [
    deleteGrade,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteGradeMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState(null);

  // Global error / success handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete grade"));
    if (deleteSuccess) {
      toast.success(t("Grade deleted successfully"));
      setShowModal(false);
      setSelectedGradeId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, deleteSuccess, user, t]);

  // Refetch when requested from navigation state (e.g., after edit)
  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const handleDeleteClick = (id) => {
    setSelectedGradeId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGradeId) deleteGrade(selectedGradeId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditGrade = (id) => {
    navigate(`/admin/grades/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/grade/${id}/details`);
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("");
    setSearch("");
    setSearchTerm("");
    setCurrentPage(1);
    setLimit(8);
    setShowFilters(false);
  };

  // Columns
  const columns = [
    {
      header: t("Grade Name"),
      accessor: "gradeName",
      width: "25%",
      minWidth: "200px",
      render: (value) => <TruncatedCell maxChars={55}>{value}</TruncatedCell>
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "20%",
      minWidth: "150px",
      render: (value) => value ? (
        <div className="truncate">
          <span className="text-sm text-gray-700 font-medium truncate block" title={value.name}>
            {value.name}
          </span>
          {value.level && (
            <p className="text-[10px] text-gray-400 truncate" title={value.level}>
              {value.level}
            </p>
          )}
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">{t("Not assigned")}</span>
      )
    },
    {
      header: t("Description"),
      accessor: "description",
      width: "30%",
      minWidth: "250px",
      render: (value) => <TruncatedCell maxChars={70}>{value}</TruncatedCell>
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "100px",
      render: (value) => <AppBadge type="booleanStatus" active={value === true || value === 1} />
    }
  ];

  // Stats (based on counts from API response)
  const stats = [
    {
      label: t("Total Grades"),
      value: data?.pagination?.total || 0,
      icon: "layer-group",
      color: "blue"
    },
    {
      label: t("Active Grades"),
      value: data?.pagination?.counts?.active || 0,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Inactive Grades"),
      value: data?.pagination?.counts?.deactive || 0,
      icon: "times-circle",
      color: "red"
    },
    {
      label: t("Items Shown"),
      value: data?.grades?.length || 0,
      icon: "list-ul",
      color: "purple"
    }
  ];

  const addButton = userRole === "admin" ? (
    <AppButton to="/admin/grade/new" label={t("Add New Grade")} icon="plus" />
  ) : null;

  const refreshButton = (
    <AppButton
      onClick={handleRefresh}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  // Single filter button with integrated dropdown
  const filters = (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 shadow-soft"
      >
        <i className="fa fa-sliders-h"></i>
        <span>{t("Filters")}</span>
        <i className={`fa fa-chevron-${showFilters ? "up" : "down"} text-sm`}></i>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-premium z-20 p-5">
          <h3 className="font-medium text-gray-700 mb-3">
            {t("Filter Grades")}
          </h3>
          <div className="space-y-4">
            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Items per page")}
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {[5, 8, 10, 15, 20, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} {t("items")}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">{t("All Status")}</option>
                <option value="active">{t("Active")}</option>
                <option value="inactive">{t("Inactive")}</option>
              </select>
            </div>

            {/* Reset button */}
            <div className="pt-2 border-t">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center justify-center gap-2"
              >
                <i className="fa fa-undo"></i>
                {t("Reset Filters")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      editHref={`/admin/grades/${row._id}`}
      onView={handleViewDetails}
      onEdit={handleEditGrade}
    />
  );

  const emptyState = (
    <EmptyState
      icon="layer-group"
      title={searchTerm || statusFilter ? t("No grades found matching your criteria") : t("No grades found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allGrades")} />

      <DataTableContainer
        title={t("Grade Management")}
        subtitle={t("Manage grade levels and their details")}
        data={data?.grades || []}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search grades by name or description...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {data?.grades?.length || 0} {t("grades")}
          </p>
        )}
        className="grade-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this grade?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListGrades;