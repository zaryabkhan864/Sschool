import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteUserMutation,
  useGetUserByTypeQuery,
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
import CountryBadge from "../GUI/CountryBadge";
import PhoneLink from "../GUI/PhoneLink";
import StatusBadge from "../GUI/StatusBadge";

const ListTeachers = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Debounced search term with page reset
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
  } = useGetUserByTypeQuery({
    type: "teacher",
    page: currentPage,
    limit,
    keyword: searchTerm,
    gender: genderFilter || undefined,
    status: statusFilter || undefined,
  });

  const [
    deleteUser,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (deleteError) toast.error(deleteError?.data?.message);
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
    if (isSuccess) {
      toast.success(t("teacherDeleted"));
      refetch();
      setShowModal(false);
      setSelectedTeacherId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, isSuccess, user, t, refetch, location.state]);

  const handleDeleteClick = (id) => {
    setSelectedTeacherId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedTeacherId) deleteUser(selectedTeacherId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleViewDetails = (id) => {
    // navigate is not directly available; we'll use Link in ActionButtons
  };

  const handleEdit = (id) => {
    // navigate is not directly available; we'll use Link in ActionButtons
  };

  // Columns using shared components
  const columns = [
    {
      header: t("Teacher Name"),
      accessor: "name",
      width: "25%",
      minWidth: "180px",
      render: (value, row) => (
        <div className="truncate">
          <p className="font-medium text-gray-800 truncate">{value}</p>
          <p className="text-xs text-gray-500 truncate">{row.email}</p>
        </div>
      )
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "12%",
      minWidth: "100px",
      render: (value) => <GenderBadge gender={value} />
    },
    {
      header: t("Country"),
      accessor: "nationality",
      width: "13%",
      minWidth: "110px",
      render: (value) => <CountryBadge country={value} />
    },
    {
      header: t("Contact Number"),
      accessor: "phoneNumber",
      width: "15%",
      minWidth: "130px",
      render: (value) => <PhoneLink number={value} />
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "12%",
      minWidth: "100px",
      render: (value) => <StatusBadge active={value} dot />
    }
  ];

  // Stats
  const counts = data?.pagination?.counts || data?.counts || { total: 0, active: 0, deactive: 0 };

  const stats = [
    {
      label: t("Total Teachers"),
      value: counts.total,
      icon: "chalkboard-teacher",
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
    <AddButton to="/admin/teacher/new" text={t("Add New Teacher")} icon="plus" />
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

  // Filters using FilterDropdown
  const filters = (
    <FilterDropdown
      onReset={() => {
        setSearch("");
        setSearchTerm("");
        setGenderFilter("");
        setStatusFilter("");
        setCurrentPage(1);
        setLimit(8);
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

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      viewLink={`/admin/teacher/${row._id}/details`}
      editLink={`/admin/teachers/${row._id}`}
    />
  );

  const emptyState = (
    <EmptyState
      icon="chalkboard-teacher"
      title={searchTerm ? t("No teachers found matching your search") : t("No teachers found")}
      message={searchTerm ? t("Try adjusting your search or filter to find what you're looking for") : t("Add your first teacher to get started")}
    >
      {!searchTerm && userRole === "admin" && (
        <AddButton to="/admin/teacher/new" text={t("Add New Teacher")} icon="plus" />
      )}
    </EmptyState>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allTeachers")} />

      <DataTableContainer
        title={t("All Teachers")}
        subtitle={t("Manage faculty members and their assignments")}
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
        searchPlaceholder={t("Search teachers by name, contact or email...")}
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
        renderFooterInfo={() => (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              {userRole === "admin" && (
                <span className="text-blue-600">
                  <i className="fa fa-user-shield mr-1"></i>
                  {t("Admin Mode")}
                </span>
              )}
            </p>
          </div>
        )}
        className="teacher-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Do you want to delete this teacher?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListTeachers;