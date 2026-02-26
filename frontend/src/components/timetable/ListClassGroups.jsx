import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import {
  useGetClassGroupsQuery,
  useDeleteClassGroupMutation,
} from "../../redux/api/classGroupApi";

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

const ListClassGroups = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // User role for permissions
  const [userRole, setUserRole] = useState("");

  // Search & pagination
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false); // controls filter dropdown

  // Filter states – only status remains
  const [selectedStatus, setSelectedStatus] = useState("");

  // Delete modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // ──────────────────────────────────────────────────────────────
  // Toast from navigation (e.g., after creating a class group)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Class group created successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t]);

  // ──────────────────────────────────────────────────────────────
  // Debounced search term
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ──────────────────────────────────────────────────────────────
  // Build query parameters for API
  // ──────────────────────────────────────────────────────────────
  const queryParams = {
    page: currentPage,
    limit,
    keyword: searchTerm || undefined,
    paginate: true,
    ...(selectedStatus && { status: selectedStatus }),
    populateCourses: false,
    populateTeacher: false,
  };

  // ──────────────────────────────────────────────────────────────
  // Main data fetching
  // ──────────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetClassGroupsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [
    deleteClassGroup,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteClassGroupMutation();

  // ──────────────────────────────────────────────────────────────
  // Side effects and role
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === "admin") setUserRole("admin");
    else if (user?.role === "teacher") setUserRole("teacher");
    else setUserRole("");
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Something went wrong"));
    }
    if (deleteError) {
      toast.error(deleteError?.data?.message || t("Failed to delete class group"));
    }
    if (deleteSuccess) {
      toast.success(t("Class group deleted successfully"));
      refetch();
      setShowModal(false);
      setSelectedGroupId(null);
    }
  }, [error, deleteError, deleteSuccess, t, refetch]);

  // ──────────────────────────────────────────────────────────────
  // Refetch when requested from navigation state
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  // ──────────────────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────────────────
  const handleDeleteClick = (id) => {
    setSelectedGroupId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGroupId) {
      deleteClassGroup(selectedGroupId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditClassGroup = (id) => {
    navigate(`/admin/class-groups/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/class-group/${id}/details`);
  };

  // Reset filters – only status and limit remain
  const resetFilters = () => {
    setSelectedStatus("");
    setSearch("");
    setSearchTerm("");
    setCurrentPage(1);
    setLimit(10);
    setShowFilters(false);
  };

  // ──────────────────────────────────────────────────────────────
  // Column definitions
  // ──────────────────────────────────────────────────────────────
  const columns = [
    {
      header: t("Display Name"),
      accessor: "displayName",
      width: "20%",
      minWidth: "140px",
      render: (value) => <TruncatedCell maxChars={55}>{value}</TruncatedCell>
    },
    {
      header: t("Grade"),
      accessor: "grade",
      width: "15%",
      minWidth: "100px",
      render: (value) => (
        <TruncatedCell lines={1} className="text-sm text-gray-700">
          {value?.gradeName || "—"}
        </TruncatedCell>
      ),
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "15%",
      minWidth: "120px",
      render: (value) => (
        <TruncatedCell lines={1} className="text-sm text-gray-700">
          {value?.name || "—"}
        </TruncatedCell>
      ),
    },
    {
      header: t("Section"),
      accessor: "section",
      width: "10%",
      minWidth: "80px",
      render: (value) => (
        <span className="text-sm font-medium text-gray-800">
          {value || "—"}
        </span>
      ),
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "100px",
      render: (value) => <AppBadge type="booleanStatus" active={value === true || value === 1} />
    },
  ];

  // ──────────────────────────────────────────────────────────────
  // Stats cards
  // ──────────────────────────────────────────────────────────────
  const stats = [
    {
      label: t("Total Class Groups"),
      value: data?.pagination?.total || 0,
      icon: "users-class",
      color: "blue",
    },
    {
      label: t("Active Groups"),
      value: data?.classGroups?.filter(g => g.status).length || 0,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Inactive Groups"),
      value: data?.classGroups?.filter(g => !g.status).length || 0,
      icon: "times-circle",
      color: "red",
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "orange",
    },
  ];

  // ──────────────────────────────────────────────────────────────
  // Action buttons
  // ──────────────────────────────────────────────────────────────
  const addButton =
    userRole === "admin" ? (
      <AppButton
        to="/admin/class-groups/new"
        label={t("Add New Class Group")}
        icon="plus"
      />
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

  // ──────────────────────────────────────────────────────────────
  // Single Filter Button with integrated dropdown (only items per page and status)
  // ──────────────────────────────────────────────────────────────
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
            {t("Filter Class Groups")}
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
                {[5, 10, 15, 20, 25, 50].map((n) => (
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
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">{t("All Status")}</option>
                <option value="active">{t("Active")}</option>
                <option value="deactive">{t("Inactive")}</option>
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

  // ──────────────────────────────────────────────────────────────
  // Row actions
  // ──────────────────────────────────────────────────────────────
  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      editHref={`/admin/class-groups/${row._id}`}
      onView={handleViewDetails}
      onEdit={handleEditClassGroup}
    />
  );

  // ──────────────────────────────────────────────────────────────
  // Empty state
  // ──────────────────────────────────────────────────────────────
  const emptyState = (
    <EmptyState
      icon="users-class"
      title={searchTerm || selectedStatus ? t("No class groups found matching your criteria") : t("No class groups found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  // ──────────────────────────────────────────────────────────────
  // Loading & Render
  // ──────────────────────────────────────────────────────────────
  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allClassGroups")} />

      <DataTableContainer
        title={t("Class Group Management")}
        subtitle={t("Manage class groups, sections and their academic settings")}
        data={data?.classGroups || []}
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
        searchPlaceholder={t("Search by display name or section...")}
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
            {t("Showing")}: {data?.classGroups?.length || 0} {t("class groups")}
          </p>
        )}
        className="class-group-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this class group?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListClassGroups;