import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "../../redux/api/courseApi";

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
  const [teacherFilter] = useState(""); // kept for API compatibility, no UI

  // Toast from navigation
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
  } = useGetCoursesQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    teacherId: teacherFilter || undefined,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [
    deleteCourse,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteCourseMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete course"));
    if (deleteSuccess) {
      toast.success(t("Course deleted successfully"));
      setShowModal(false);
      setSelectedCourseId(null);
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

  // Columns using shared components
  const columns = [
    {
      header: t("Course Name"),
      accessor: "courseName",
      width: "35%",
      minWidth: "220px",
      render: (value) => {
        if (!value) return <span className="text-xs text-gray-400 italic">{t("No name")}</span>;
        return <TruncatedCell lines={1}>{value}</TruncatedCell>;
      }
    },
    {
      header: t("Course Code"),
      accessor: "code",
      width: "15%",
      minWidth: "120px",
      render: (value) => (
        <div className="truncate">
          <span className="text-sm font-mono font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
            {value || <span className="text-gray-400 italic">{t("N/A")}</span>}
          </span>
        </div>
      )
    },
    {
      header: t("Grade"),
      accessor: "grade",
      width: "15%",
      minWidth: "100px",
      render: (value) => {
        if (!value || !value.gradeName) {
          return <span className="text-xs text-gray-400 italic">{t("Not assigned")}</span>;
        }
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              {value.gradeName}
            </span>
          </div>
        );
      }
    },
    {
      header: t("Teacher"),
      accessor: "teacher",
      width: "20%",
      minWidth: "150px",
      render: (value) => (
        <div className="truncate">
          <span className="text-sm text-gray-700 font-medium truncate block" title={value?.name}>
            {value?.name || <span className="text-gray-400 italic">{t("Not assigned")}</span>}
          </span>
          {value?.email && (
            <p className="text-[10px] text-gray-400 truncate" title={value.email}>
              {value.email}
            </p>
          )}
        </div>
      )
    }
  ];

  // Stats
  const stats = [
    {
      label: t("Total Courses"),
      value: data?.pagination?.total || 0,
      icon: "book",
      color: "blue"
    },
    {
      label: t("Active Filters"),
      value: teacherFilter ? 1 : 0,
      icon: "filter",
      color: "green"
    },
    {
      label: t("Items Shown"),
      value: data?.courses?.length || 0,
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
    <AddButton to="/admin/course/new" text={t("Add New Course")} icon="plus" />
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
      // No hrefs provided, so click handlers will be used
    />
  );

  const emptyState = (
    <EmptyState
      icon="book"
      title={searchTerm ? t("No courses found matching your search") : t("No courses found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
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
        searchPlaceholder={t("Search courses by course name and course code...")}
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