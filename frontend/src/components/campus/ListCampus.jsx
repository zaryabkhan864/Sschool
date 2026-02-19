import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
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
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton";
import StatusBadge from "../GUI/StatusBadge";
import ActionButtons from "../GUI/ActionButtons";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";

const ListCampus = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // API Query
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetCampusQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
  });

  const [
    deleteCampus,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteCampusMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message);
    if (isSuccess) {
      toast.success(t("Campus Deleted"));
      refetch();
      setShowModal(false);
      setSelectedCampusId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, isSuccess, user, t, refetch]);

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

  // Columns definition
  const columns = [
    {
      header: t("Campus Name"),
      accessor: "name",
      width: "30%",
      minWidth: "200px",
      render: (value) => <TruncatedCell lines={1}>{value}</TruncatedCell>
    },
    {
      header: t("Location"),
      accessor: "location",
      width: "30%",
      minWidth: "200px",
      render: (value) => value ? (
        <TruncatedCell lines={1}>{value}</TruncatedCell>
      ) : (
        <span className="text-sm text-gray-400 italic">{t("No location")}</span>
      )
    },
    {
      header: t("Phone Number"),
      accessor: "contactNumber",
      width: "20%",
      minWidth: "150px",
      render: (value) => value ? (
        <TruncatedCell lines={1}>{value}</TruncatedCell>
      ) : (
        <span className="text-sm text-gray-400 italic">{t("No phone")}</span>
      )
    },
    // Add status column if campus has a status field
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "100px",
      render: (value) => <StatusBadge active={value} />
    }
  ];

  // Stats cards
  const stats = [
    {
      label: t("Total Campuses"),
      value: data?.pagination?.total || 0,
      icon: "university",
      color: "blue"
    },
    {
      label: t("Active Campuses"),
      value: data?.campus?.filter(c => c.status).length || 0,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Items Shown"),
      value: data?.campus?.length || 0,
      icon: "list-ul",
      color: "purple"
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "orange"
    }
  ];

  const addButton = userRole === "admin" ? (
    <AddButton to="/admin/campus/new" text={t("Add New Campus")} icon="plus" />
  ) : null;

  const refreshButton = (
    <RefreshButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} className="ml-2" />
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
        setCurrentPage(1);
        setLimit(8);
      }}
    />
  );

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allCampus")} />

      <DataTableContainer
        title={t("Campus Management")}
        subtitle={t("Manage campus locations and their details")}
        data={data?.campus || []}
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
        emptyState={
          <EmptyState
            icon="university"
            title={searchTerm ? t("No campuses found matching your search") : t("No campuses found")}
          />
        }
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {data?.campus?.length || 0} {t("campuses")}
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