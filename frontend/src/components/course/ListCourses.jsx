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
  const [showFilters, setShowFilters] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState("");

  // ✅ Check for success toast from navigation
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Course created successfully!"));
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t]);

  // ✅ Debounced search term with page reset
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ SINGLE Query with all parameters
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
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

  // Delete modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Something went wrong"));
    }
    
    if (deleteError) {
      toast.error(deleteError?.data?.message || t("Failed to delete course"));
    }
    
    if (deleteSuccess) {
      toast.success(t("Course deleted successfully"));
      setShowModal(false);
      setSelectedCourseId(null);
    }

    if (user?.role === "admin") {
      setUserRole("admin");
    }
  }, [error, deleteError, deleteSuccess, user, t]);

  // ✅ Auto-refresh when coming from create/update
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
    if (selectedCourseId) {
      deleteCourse(selectedCourseId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditCourse = (id) => {
    navigate(`/admin/courses/${id}/edit`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/course/${id}/details`);
  };

  // ✅ Updated columns WITH CLAMP/TRUNCATION - EXACTLY LIKE YOUR ORIGINAL
  const columns = [
    {
      header: t("Course Name"),
      accessor: "courseName",
      width: "35%", // Increased width
      minWidth: "220px",
      render: (value) => {
        if (!value) return <span className="text-xs text-gray-400 italic">{t("No name")}</span>;
        
        const maxLength = 30; // Show 30 characters max
        const truncated = value.length > maxLength 
          ? value.substring(0, maxLength) + "..." 
          : value;

        return (
          <div className="truncate">
            <p 
              className="font-medium text-gray-800 truncate" 
              title={value.length > maxLength ? value : ""}
            >
              {truncated}
            </p>
          </div>
        );
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
    },
    {
      header: t("Description"),
      accessor: "description",
      width: "20%", // Decreased width
      minWidth: "180px",
      render: (value) => {
        if (!value) return <span className="text-xs text-gray-400 italic">{t("No description")}</span>;
        
        const maxLength = 40; // Show 40 characters max
        const truncated = value.length > maxLength 
          ? value.substring(0, maxLength) + "..." 
          : value;

        return (
          <p className="text-xs text-gray-500 leading-normal truncate" title={value}>
            {truncated}
          </p>
        );
      }
    }
  ];

  // ✅ Stats EXACTLY like your original
  const stats = [
    { 
      label: t("Total Courses"), 
      value: data?.pagination?.total || 0, 
      icon: "book", 
      color: "blue" 
    },
    { 
      label: t("Active Filters"), 
      value: (teacherFilter ? 1 : 0), 
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

  // ✅ Add Button
  const addButton = userRole === "admin" ? (
    <AddButton
      to="/admin/course/new"
      text={t("Add New Course")}
      icon="plus"
    />
  ) : null;

  // ✅ Refresh Button
  const refreshButton = (
    <RefreshButton
      onClick={handleRefresh}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  // ✅ Filters
  const filters = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
        >
          <i className="fa fa-sliders-h"></i>
          <span>{t("Filters")}</span>
          <i className={`fa fa-chevron-${showFilters ? 'up' : 'down'} text-sm`}></i>
        </button>

        {showFilters && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
            <div className="space-y-4">
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
                    <option key={n} value={n}>
                      {n} {t("items")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t">
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchTerm("");
                    setTeacherFilter("");
                    setCurrentPage(1);
                    setLimit(8);
                  }}
                  className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                >
                  <i className="fa fa-undo mr-2"></i>
                  {t("Reset Filters")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ✅ Row Actions
  const renderRowActions = (row) => (
    <div className="flex justify-end items-center gap-1">
      <a
        href={`/admin/course/${row._id}/details`}
        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
        title={t("View Details")}
        style={{ width: "36px", height: "36px" }}
      >
        <i className="fa fa-eye text-sm"></i>
      </a>

      {userRole === "admin" && (
        <>
          <a
            href={`/admin/courses/${row._id}`}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("Edit")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-edit text-sm"></i>
          </a>

          <button
            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            onClick={() => handleDeleteClick(row._id)}
            disabled={isDeleteLoading}
            title={t("Delete")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-trash text-sm"></i>
          </button>
        </>
      )}
    </div>
  );

  // ✅ Empty State
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-book text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {searchTerm ? t("No courses found matching your search") : t("No courses found")}
      </h3>
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allCourses")} />

      <DataTableContainer
        // Basic props
        title={t("Course Management")}
        subtitle={t("Manage curriculum and assignments")}
        data={data?.courses || []}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}

        // ✅ Pagination props
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}

        // ✅ Search props
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search courses by course name and course code...")}

        // ✅ Action props
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole={userRole}

        // ✅ Row actions
        renderRowActions={renderRowActions}

        // ✅ Custom render props
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

        // ✅ Custom styling
        className="course-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      {/* ✅ Delete Modal */}
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