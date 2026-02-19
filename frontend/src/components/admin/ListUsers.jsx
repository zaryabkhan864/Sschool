import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteUserMutation,
  useGetAdminUsersQuery,
} from "../../redux/api/userApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton";
import ActionButtons from "../GUI/ActionButtons";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import GenderBadge from "../GUI/GenderBadge";
import StatusBadge from "../GUI/StatusBadge";
import RoleBadge from "../GUI/RoleBadge";

const ListUsers = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // API Query with Pagination and Filters
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetAdminUsersQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    gender: genderFilter || undefined,
    status: statusFilter || undefined, // now "active" or "deactive"
  });

  const [
    deleteUser,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (deleteError) toast.error(deleteError?.data?.message);
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
    if (isSuccess) {
      toast.success(t("User Deleted"));
      refetch();
      setShowModal(false);
      setSelectedUserId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, isSuccess, user, t, refetch, location.state]);

  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedUserId) deleteUser(selectedUserId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // Columns using shared components
  const columns = [
    {
      header: t("Name"),
      accessor: "name",
      width: "25%",
      render: (value, row) => (
        <div className="truncate">
          <TruncatedCell lines={1} className="font-medium text-gray-800">
            {value}
          </TruncatedCell>
          {row?.email && (
            <TruncatedCell lines={1} className="text-xs text-gray-500">
              {row.email}
            </TruncatedCell>
          )}
        </div>
      ),
    },
    {
      header: t("Role"),
      accessor: "role",
      width: "15%",
      render: (value) => <RoleBadge role={value} />,
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "12%",
      render: (value) => <GenderBadge gender={value} />,
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      render: (value) => <StatusBadge active={value} dot />,
    },
  ];

  // Stats using pagination counts (like teacher list)
  const counts = data?.pagination?.counts || { total: 0, active: 0, deactive: 0 };

  const stats = [
    {
      label: t("Total Users"),
      value: counts.total,
      icon: "users",
      color: "blue"
    },
    {
      label: t("Active"),
      value: counts.active,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Deactive"),
      value: counts.deactive,
      icon: "times-circle",
      color: "red"
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "purple"
    }
  ];

  const addButton = userRole === "admin" ? (
    <AddButton to="/admin/user/new" text={t("Add New User")} icon="plus" />
  ) : null;

  const refreshButton = (
    <RefreshButton
      onClick={handleRefresh}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  // Filters using FilterDropdown (status values now "active"/"deactive")
  const filters = (
    <FilterDropdown
      onReset={() => {
        setSearch("");
        setSearchTerm("");
        setGenderFilter("");
        setStatusFilter("");
        setCurrentPage(1);
        setLimit(10);
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Gender")}
        </label>
        <select
          value={genderFilter}
          onChange={(e) => {
            setGenderFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("All Genders")}</option>
          <option value="male">{t("Male")}</option>
          <option value="female">{t("Female")}</option>
          <option value="other">{t("Other")}</option>
        </select>
      </div>
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
          <option value="">{t("All Status")}</option>
          <option value="active">{t("Active")}</option>
          <option value="deactive">{t("Deactive")}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Items per page")}
        </label>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {[5, 8, 10, 15, 20, 50].map(n => (
            <option key={n} value={n}>{n} {t("items")}</option>
          ))}
        </select>
      </div>
    </FilterDropdown>
  );

  const emptyState = (
    <EmptyState
      icon="users"
      title={searchTerm ? t("No users found matching your search") : t("No users found")}
      message={searchTerm ? t("Try adjusting your search or filter to find what you're looking for") : t("Add your first user to get started")}
    >
      {!searchTerm && userRole === "admin" && (
        <AddButton to="/admin/user/new" text={t("Add New User")} icon="plus" />
      )}
    </EmptyState>
  );

  const renderRowActions = (row) => (
    <ActionButtons
      id={row?._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      editLink={`/admin/users/${row?._id}`}
      // viewLink={`/admin/user/${row?._id}/details`} // uncomment if details page exists
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("All Users")} />

      <DataTableContainer
        title={t("User Management")}
        subtitle={t("View and manage all registered users in the system")}
        data={data?.users || []}
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
        searchPlaceholder={t("Search users by name or email...")}
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
            {t("Last updated")}: {new Date().toLocaleTimeString()}
          </p>
        )}
        className="user-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this user?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListUsers;