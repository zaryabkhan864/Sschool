import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteUserMutation,
  useGetUserByTypeQuery,
} from "../../redux/api/authApi";

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

const ListStudents = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campusFilter, setCampusFilter] = useState(""); // kept for API, no UI

  // Toast from navigation (e.g., after creating a student)
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Student created successfully!"));
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
  } = useGetUserByTypeQuery({
    type: "student",
    page: currentPage,
    limit,
    keyword: searchTerm,
    gender: genderFilter || undefined,
    status: statusFilter || undefined,
    campus: campusFilter || undefined,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [
    deleteUser,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Global error / success handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete student"));
    if (deleteSuccess) {
      toast.success(t("Student deleted successfully"));
      setShowModal(false);
      setSelectedStudentId(null);
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

  const handleEditStudent = (id) => {
    navigate(`/admin/students/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/student/${id}/details`);
  };

  // Columns using AppBadge
  const columns = [
    {
      header: t("Student Name"),
      accessor: "name",
      width: "40%",
      minWidth: "200px",
      render: (value) => <TruncatedCell maxChars={35}>{value}</TruncatedCell>
    },
    {
      header: t("Nationality"),
      accessor: "nationality",
      width: "30%",
      minWidth: "120px",
      render: (value) => <TruncatedCell maxChars={33}>{value}</TruncatedCell>
    },
    {
      header: t("Grade"),
      accessor: "grade",
      width: "10%",
      minWidth: "120px",
      render: (_, row) => {
        const gradeName = row?.grade?.[0]?.gradeDetails?.gradeName;
        return gradeName ? <AppBadge type="grade" value={gradeName} /> : <span className="text-gray-400">—</span>;
      }
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "10%",
      minWidth: "100px",
      render: (value) => <AppBadge type="gender" value={value} />
    },
 
    {
      header: t("Status"),
      accessor: "status",
      width: "10%",
      minWidth: "100px",
      render: (value) => {
        // Normalize to boolean
        const isActive = 
          value === true ||
          value === "active" ||
          value === "Active" ||
          value === "ACTIVE" ||
          value === 1;
          return <AppBadge type="booleanStatus" active={isActive} />;
      }
    }
  ];

  // Stats
  const counts = data?.pagination?.counts || data?.counts || { total: 0, active: 0, deactive: 0 };

  const stats = [
    {
      label: t("Total Students"),
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
    <AppButton to="/admin/student/new" label={t("Add New Student")} icon="plus" />
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

  // Filter dropdown using shared component
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
          <option value="inactive">{t("Deactive")}</option>
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
      onEdit={handleEditStudent}
    />
  );

  const emptyState = (
    <EmptyState
      icon="user-graduate"
      title={searchTerm ? t("No students found matching your search") : t("No students found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allStudents")} />

      <DataTableContainer
        title={t("Student Management")}
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
            {t("Showing")}: {data?.users?.length || 0} {t("students")}
          </p>
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
        message={t("Are you sure you want to delete this student?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListStudents;