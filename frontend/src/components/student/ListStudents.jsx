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
import StatusBadge from "../GUI/StatusBadge";
import GradeBadge from "../GUI/GradeBadge";

const ListStudents = () => {
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
  const [campusFilter, setCampusFilter] = useState(""); // kept for API, no UI

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
  } = useGetUserByTypeQuery({
    type: "student",
    page: currentPage,
    limit,
    keyword: searchTerm,
    gender: genderFilter || undefined,
    status: statusFilter || undefined,
    campus: campusFilter || undefined,
  });

  const [
    deleteUser,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (deleteError) toast.error(deleteError?.data?.message);
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
    if (isSuccess) {
      toast.success(t("studentDeleted"));
      refetch();
      setShowModal(false);
      setSelectedStudentId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, isSuccess, user, t, refetch, location.state]);

  const handleDeleteClick = (id) => {
    setSelectedStudentId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedStudentId) deleteUser(selectedStudentId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // Columns using shared components
  const columns = [
    {
      header: t("Student Name"),
      accessor: "name",
      width: "25%",
      minWidth: "200px",
      render: (value, row) => {
        if (!value) return <span className="text-xs text-gray-400 italic">{t("N/A")}</span>;
        return (
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
        );
      }
    },
    {
      header: t("Grade"),
      width: "18%",
      minWidth: "150px",
      render: (_, row) => {
        const gradeName = row?.grade?.[0]?.gradeDetails?.gradeName;
        return <GradeBadge gradeName={gradeName} />;
      }
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "12%",
      minWidth: "100px",
      render: (value) => <GenderBadge gender={value} />
    },
    {
      header: t("Nationality"),
      accessor: "nationality",
      width: "13%",
      minWidth: "120px",
      render: (value) => <CountryBadge country={value} />
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
  const counts = data?.pagination?.counts || data?.counts || { total: 0, active: 0, inactive: 0 };

  const stats = [
    {
      label: t("Total Students"),
      value: counts.total || 0,
      icon: "users",
      color: "blue"
    },
    {
      label: t("Active"),
      value: counts.active || 0,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Inactive"),
      value: counts.inactive || 0,
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
    <AddButton to="/admin/student/new" text={t("Add New Student")} icon="plus" />
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
          <option value="inactive">{t("Inactive")}</option>
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
      icon="user-graduate"
      title={searchTerm ? t("No students found matching your search") : t("No students found")}
      message={searchTerm ? t("Try adjusting your search or filter to find what you're looking for") : t("Add your first student to get started")}
    >
      {!searchTerm && userRole === "admin" && (
        <AddButton to="/admin/student/new" text={t("Add New Student")} icon="plus" />
      )}
    </EmptyState>
  );

  const renderRowActions = (row) => {
    const studentId = row?._id;
    if (!studentId) return null;
    return (
      <ActionButtons
        id={studentId}
        userRole={userRole}
        onDelete={handleDeleteClick}
        isDeleteLoading={isDeleteLoading}
        viewLink={`/admin/student/${studentId}/details`}
        editLink={`/admin/students/${studentId}`}
      />
    );
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allStudents")} />

      <DataTableContainer
        title={t("All Students")}
        subtitle={t("Manage student enrollments and information")}
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
        searchPlaceholder={t("Search students by name, email or contact...")}
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
        className="student-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Do you want to delete this student?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListStudents;