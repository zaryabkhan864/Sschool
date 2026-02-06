import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campusFilter, setCampusFilter] = useState("");

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

  // Delete modal state
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

  // ✅ Columns Definition WITH TRUNCATION (Like Course List)

const columns = [
  {
    header: t("Student Name"),
    accessor: "name",
    width: "25%",
    minWidth: "200px",
    render: (value, row) => {
      if (!value) return <span className="text-xs text-gray-400 italic">{t("N/A")}</span>;
      
      const maxLength = 25;
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
          <p className="text-xs text-gray-500 truncate" title={row?.email}>
            {row?.email || ""}
          </p>
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
  
      return (
        <div className="truncate">
          {gradeName ? (
            <span
              className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-100 truncate font-medium"
              title={gradeName}
            >
              {gradeName}
            </span>
          ) : (
            <span className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded border border-gray-100">
              {t("Not Assigned")}
            </span>
          )}
        </div>
      );
    }
  },
  {
    header: t("Gender"),
    accessor: "gender",
    width: "12%",
    minWidth: "100px",
    render: (value) => {
      const genderLower = value?.toLowerCase() || "";
      let colorClass = "bg-gray-100 text-gray-700 border border-gray-200";
      
      if (genderLower === 'male') {
        colorClass = "bg-blue-100 text-blue-800 border border-blue-200";
      } else if (genderLower === 'female') {
        colorClass = "bg-pink-100 text-pink-800 border border-pink-200";
      }
      
      return (
        <div className="truncate">
          <span className={`text-xs px-3 py-1.5 rounded-full ${colorClass}`}>
            {value || t("N/A")}
          </span>
        </div>
      );
    }
  },
  {
    header: t("Nationality"),
    accessor: "nationality",
    width: "13%",
    minWidth: "120px",
    render: (value) => (
      <div className="truncate">
        <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded border border-purple-100 truncate" title={value}>
          {value || t("Global")}
        </span>
      </div>
    )
  },
  {
    header: t("Status"),
    accessor: "status",
    width: "12%",
    minWidth: "100px",
    render: (value) => {
      const isActive = Boolean(value);
      return (
        <div className="flex items-center justify-start">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${isActive
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
            }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-green-500" : "bg-red-500"
              }`}></span>
            {isActive ? t("Active") : t("Inactive")}
          </span>
        </div>
      );
    }
  }
];

  const counts = data?.pagination?.counts || data?.counts || { 
    total: 0, 
    active: 0, 
    inactive: 0 
  };
  
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
    <AddButton to="/admin/student/new" text="Add New Student" icon="plus" />
  ) : null;

  const refreshButton = (
    <RefreshButton 
      onClick={handleRefresh} 
      text="Refresh" 
      icon="sync-alt" 
      disabled={isFetching} 
      className="ml-2" 
    />
  );

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
                    setGenderFilter("");
                    setStatusFilter("");
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

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-user-graduate text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {searchTerm
          ? t("No students found matching your search")
          : t("No students found")
        }
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm
          ? t("Try adjusting your search or filter to find what you're looking for")
          : t("Add your first student to get started")
        }
      </p>
      {!searchTerm && userRole === "admin" && (
        <AddButton
          to="/admin/student/new"
          text="Add New Student"
          icon="plus"
        />
      )}
    </div>
  );

  const renderRowActions = (row) => {
    const studentId = row?._id;
    if (!studentId) return null;
    
    return (
      <div className="flex justify-end items-center gap-1">
        <Link
          to={`/admin/student/${studentId}/details`}
          className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
          title={t("View Details")}
          style={{ width: "36px", height: "36px" }}
        >
          <i className="fa fa-eye text-sm"></i>
        </Link>

        {userRole === "admin" && (
          <>
            <Link
              to={`/admin/students/${studentId}`}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
              title={t("Edit")}
              style={{ width: "36px", height: "36px" }}
            >
              <i className="fa fa-edit text-sm"></i>
            </Link>

            <button
              className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
              onClick={() => handleDeleteClick(studentId)}
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