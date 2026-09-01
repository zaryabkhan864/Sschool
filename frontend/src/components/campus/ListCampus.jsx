import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteCampusMutation,
  useGetCampusQuery,
} from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import ActionButtons from "../GUI/ActionButtons";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import AppBadge from "../GUI/AppBadge";

const ListCampus = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Default status filter: "active" taaki sirf active campuses dikhe
  const [statusFilter, setStatusFilter] = useState("active");

  // Toast from navigation (e.g., after creating a campus)
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Campus created successfully!"));
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

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetCampusQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm,
      status: statusFilter || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [
    deleteCampus,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteCampusMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError)
      toast.error(deleteError?.data?.message || t("Failed to delete campus"));
    if (deleteSuccess) {
      toast.success(t("Campus deleted successfully"));
      setShowModal(false);
      setSelectedCampusId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, deleteSuccess, user, t]);

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const handleDeleteClick = (id) => {
    setSelectedCampusId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedCampusId) deleteCampus(selectedCampusId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditCampus = (id) => {
    navigate(`/admin/campus/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/campus/${id}/details`);
  };

  const columns = [
    {
      header: t("Campus Name"),
      accessor: "name",
      width: "35%",
      minWidth: "200px",
      render: (value) => <TruncatedCell maxChars={30}>{value}</TruncatedCell>,
    },
    {
      header: t("Location"),
      accessor: "location",
      width: "35%",
      minWidth: "200px",
      render: (value) =>
        value ? (
          <TruncatedCell maxChars={30}>{value}</TruncatedCell>
        ) : (
          <span className="text-sm text-gray-400 italic">{t("No location")}</span>
        ),
    },
    {
      header: t("Phone Number"),
      accessor: "contactNumber",
      width: "30%",
      minWidth: "150px",
      render: (value) =>
        value ? (
          <TruncatedCell maxChars={20}>{value}</TruncatedCell>
        ) : (
          <span className="text-sm text-gray-400 italic">{t("No phone")}</span>
        ),
    },
  ];

  const counts = data?.pagination?.counts || data?.counts || {
    total: 0,
    active: 0,
    deactive: 0,
  };

  const stats = [
    {
      label: t("Total Campuses"),
      value: counts.total,
      icon: "university",
      color: "blue",
    },
    {
      label: t("Active"),
      value: counts.active,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Deactive"),
      value: counts.deactive,
      icon: "times-circle",
      color: "red",
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "purple",
    },
  ];

  const addButton =
    userRole === "admin" ? (
      <AppButton to="/admin/campus/new" label={t("Add New Campus")} icon="plus" />
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

  const filters = (
    <FilterDropdown
      limit={limit}
      onLimitChange={(newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
      }}
      onReset={() => {
        setSearch("");
        setSearchTerm("");
        setStatusFilter("active");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Status")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="active">{t("Active")}</option>
          <option value="inactive">{t("Deactive")}</option>
          <option value="">{t("All Status")}</option>
        </select>
      </div>
    </FilterDropdown>
  );

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      onView={handleViewDetails}
      onEdit={handleEditCampus}
    />
  );

  const emptyState = (
    <EmptyState
      icon="university"
      title={
        searchTerm
          ? t("No campuses found matching your search")
          : t("No campuses found")
      }
      message={t(
        "Try adjusting your search or filters to find what you're looking for."
      )}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allCampus")} />

      <DataTableContainer
        title={t("Campus Management")}
        subtitle={t("Manage campus locations and their details")}
        data={data?.campuses || []}
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
        searchPlaceholder={t("Search campuses by name or location...")}
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
            {t("Showing")}: {data?.campuses?.length || 0} {t("campuses")}
          </p>
        )}
        className="campus-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this campus?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListCampus;
