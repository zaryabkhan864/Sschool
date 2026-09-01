import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "../../redux/api/courseApi";

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

const ListCourses = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Toast from navigation (e.g., after creating a course)
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Course created successfully!"));
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
  } = useGetCoursesQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [
    deleteCourse,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteCourseMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Global error / success handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError)
      toast.error(deleteError?.data?.message || t("Failed to delete course"));
    if (deleteSuccess) {
      toast.success(t("Course deleted successfully"));
      setShowModal(false);
      setSelectedCourseId(null);
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
    setSelectedCourseId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedCourseId) deleteCourse(selectedCourseId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditCourse = (id) => {
    navigate(`/admin/courses/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/course/${id}/details`);
  };

  // ✅ Improved status badge – covers all teacher statuses
  const getStatusBadge = (status) => {
    if (!status) return null;
    const base =
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            {t("active")}
          </span>
        );
      case "inactive":
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>
            {t("inactive")}
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            {t("pending")}
          </span>
        );
      case "suspended":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            {t("suspended")}
          </span>
        );
      case "uncontracted":           // ✅ new – teacher whose contract ended
        return (
          <span className={`${base} bg-orange-100 text-orange-800`}>
            {t("uncontracted")}
          </span>
        );
      case "transferred":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            {t("transferred")}
          </span>
        );
      case "resigned":
      case "terminated":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            {t(status)}
          </span>
        );
      default:
        // fallback – shows the raw status text
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  // Columns
  const columns = [
    {
      header: t("Course Name"),
      accessor: "courseName",
      width: "55%",
      minWidth: "200px",
      render: (value) => <TruncatedCell maxChars={55}>{value}</TruncatedCell>,
    },
    {
      header: t("Course Code"),
      accessor: "code",
      width: "20%",
      minWidth: "120px",
      render: (value) => (
        <TruncatedCell
          lines={1}
          className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100"
        >
          {value || <span className="text-gray-400 italic">{t("N/A")}</span>}
        </TruncatedCell>
      ),
    },
    {
      header: t("Teacher"),
      accessor: "teacher",
      width: "25%",
      minWidth: "200px",
      render: (value) => {
        // ✅ Handle missing or deleted teacher reference
        if (!value || (typeof value === "object" && !value.firstName && !value.lastName)) {
          return (
            <div className="flex flex-col">
              <span className="text-gray-700 font-medium">—</span>
              <span className="text-xs text-gray-400 italic">
                {t("Not assigned")}
              </span>
            </div>
          );
        }

        // Build teacher’s full name
        const fullName = [value.firstName, value.lastName]
          .filter(Boolean)
          .join(" ");

        return (
          <div className="flex flex-col">
            {/* Name (truncated if long) */}
            <span
              className="text-gray-700 font-medium truncate"
              title={fullName || value.email}
            >
              {fullName || value.email}
            </span>
            {/* Status badge – now always visible */}
            <div className="mt-1">{getStatusBadge(value.status)}</div>
          </div>
        );
      },
    },
  ];

  // Stats (unchanged)
  const stats = [
    {
      label: t("Total Courses"),
      value: data?.pagination?.total || 0,
      icon: "book",
      color: "blue",
    },
    {
      label: t("Active Courses"),
      value: data?.pagination?.counts?.active ?? 0,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Items Shown"),
      value: data?.courses?.length || 0,
      icon: "list-ul",
      color: "purple",
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "orange",
    },
  ];

  const addButton =
    userRole === "admin" ? (
      <AppButton
        to="/admin/course/new"
        label={t("Add New Course")}
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
      editHref={`/admin/courses/${row._id}`}
      onView={handleViewDetails}
      onEdit={handleEditCourse}
    />
  );

  const emptyState = (
    <EmptyState
      icon="book"
      title={
        searchTerm
          ? t("No courses found matching your search")
          : t("No courses found")
      }
      message={t(
        "Try adjusting your search or filters to find what you're looking for."
      )}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allCourses")} />

      <DataTableContainer
        title={t("Course Management")}
        subtitle={t("Manage curriculum and assignments")}
        data={data?.courses || []}
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
        searchPlaceholder={t("Search courses by name or code...")}
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
            {t("Showing")}: {data?.courses?.length || 0} {t("courses")}
          </p>
        )}
        className="course-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this course?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListCourses;