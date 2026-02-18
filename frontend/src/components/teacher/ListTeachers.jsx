import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteUserMutation,
  useGetUserByTypeQuery,
} from "../../redux/api/userApi";

import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton"; // ✅ Sahi import
import AdminLayout from "../GUI/AdminLayout";

const ListTeachers = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  // Delete modal state
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

  // ✅ Fixed width columns
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
      render: (value) => (
        <div className="truncate">
          <span className={`text-xs px-2 py-1 rounded-full ${value === "male"
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : value === "Female"
                ? "bg-pink-100 text-pink-800 border border-pink-200"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}>
            {value || t("N/A")}
          </span>
        </div>
      )
    },
    {
      header: t("Country"),
      accessor: "nationality",
      width: "13%",
      minWidth: "110px",
      render: (value) => (
        <div className="truncate">
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
            {value || t("Global")}
          </span>
        </div>
      )
    },
    {
      header: t("Contact Number"),
      accessor: "phoneNumber",
      width: "15%",
      minWidth: "130px",
      render: (value) => (
        <div className="truncate">
          <div className="flex items-center gap-1">
            <i className="fa fa-phone text-xs text-gray-400"></i>
            <span className="text-sm text-gray-700 font-medium">
              {value ? (
                <a href={`tel:${value}`} className="hover:text-blue-600 transition-colors">
                  {value}
                </a>
              ) : (
                <span className="text-gray-400">{t("N/A")}</span>
              )}
            </span>
          </div>
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isActive
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
              }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-green-500" : "bg-red-500"
                }`}></span>
              {isActive ? t("Active") : t("Deactive")}
            </span>
          </div>
        );
      }
    }
  ];

  // ✅ NEW: Calculate stats from SINGLE API response
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

  // ✅ Using new AddButton component
  const addButton = userRole === "admin" ? (
    <AddButton
      to="/admin/teacher/new"
      text="Add New Teacher"
      icon="plus"
    />
  ) : null;

  // ✅ Refresh button component
  const refreshButton = (
    <RefreshButton
      onClick={handleRefresh}
      text="Refresh"
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  // ✅ Filters component
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
              {/* ✅ Gender Filter */}
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
  
              {/* ✅ Status Filter */}
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

  // ✅ Custom row actions renderer
  const renderRowActions = (row, index) => (
    <div className="flex justify-end items-center gap-1">
      <Link
        to={`/admin/teacher/${row._id}/details`}
        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
        title={t("View Details")}
        style={{ width: "36px", height: "36px" }}
      >
        <i className="fa fa-eye text-sm"></i>
      </Link>

      {userRole === "admin" && (
        <>
          <Link
            to={`/admin/teachers/${row._id}`}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("Edit")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-edit text-sm"></i>
          </Link>

          <button
            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

  // ✅ Empty state component
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-chalkboard-teacher text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {searchTerm
          ? t("No teachers found matching your search")
          : t("No teachers found")
        }
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm
          ? t("Try adjusting your search or filter to find what you're looking for")
          : t("Add your first teacher to get started")
        }
      </p>
      {!searchTerm && userRole === "admin" && (
        <AddButton
          to="/admin/teacher/new"
          text="Add New Teacher"
          icon="plus"
        />
      )}
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allTeachers")} />

      <DataTableContainer
        // Basic props
        title={t("All Teachers")}
        subtitle={t("Manage faculty members and their assignments")}
        data={data?.users || []}
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
        searchPlaceholder={t("Search teachers by name, contact or email...")}

        // ✅ Action props
        onRefresh={handleRefresh}
        refreshButton={refreshButton} // ✅ Add refresh button
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
        className="teacher-table-container"
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
        message={t("Do you want to delete this teacher?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListTeachers;