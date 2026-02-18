import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteUserMutation,
  useGetAdminUsersQuery, // Assuming your API supports params like page, limit, keyword
} from "../../redux/api/userApi";

import AdminLayout from "../GUI/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton";

const ListUsers = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ✅ Debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ API Query with Pagination and Filters
  const { data, isLoading, error, refetch, isFetching } = useGetAdminUsersQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    gender: genderFilter || undefined,
    status: statusFilter !== "" ? statusFilter : undefined,
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

  // ✅ Columns Definition
  const columns = [
    {
      header: t("Name"),
      accessor: "name",
      width: "25%",
      render: (value, row) => (
        <div className="truncate">
          <p className="font-medium text-gray-800 truncate" title={value}>
            {value}
          </p>
          <p className="text-xs text-gray-500 truncate">{row?.email}</p>
        </div>
      ),
    },
    {
      header: t("Role"),
      accessor: "role",
      width: "15%",
      render: (value) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs border border-gray-200">
          {value}
        </span>
      ),
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "12%",
      render: (value) => {
        const genderLower = value?.toLowerCase() || "";
        const colorClass = 
          genderLower === 'male' ? "bg-blue-100 text-blue-800" : 
          genderLower === 'female' ? "bg-pink-100 text-pink-800" : "bg-gray-100 text-gray-800";
        return (
          <span className={`text-xs px-2.5 py-1 rounded-full border ${colorClass}`}>
            {value || t("N/A")}
          </span>
        );
      },
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      render: (value) => {
        const isActive = value === true || value === "true" || value === "active";
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
          }`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${isActive ? "bg-green-500" : "bg-red-500"}`}></span>
            {isActive ? t("Active") : t("Inactive")}
          </span>
        );
      },
    },
  ];

  // ✅ Stats Configuration
  const stats = [
    {
      label: t("Total Users"),
      value: data?.usersCount || data?.users?.length || 0,
      icon: "users",
      color: "blue"
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "purple"
    }
  ];

  const filters = (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
      >
        <i className="fa fa-sliders-h"></i>
        <span>{t("Filters")}</span>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t("Status")}</label>
              <select
                className="w-full p-2 border rounded text-sm"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">{t("All Status")}</option>
                <option value="true">{t("Active")}</option>
                <option value="false">{t("Inactive")}</option>
              </select>
            </div>
            <button
              onClick={() => { setStatusFilter(""); setGenderFilter(""); setSearch(""); }}
              className="w-full py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              {t("Reset All")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRowActions = (row) => (
    <div className="flex justify-end gap-2">
      <Link
        to={`/admin/users/${row?._id}`}
        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        title={t("Edit")}
      >
        <i className="fa fa-pencil-alt text-sm"></i>
      </Link>
      <button
        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
        onClick={() => handleDeleteClick(row?._id)}
        disabled={isDeleteLoading}
        title={t("Delete")}
      >
        <i className="fa fa-trash-alt text-sm"></i>
      </button>
    </div>
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
        searchPlaceholder={t("Search users...")}
        onRefresh={handleRefresh}
        refreshButton={<RefreshButton onClick={handleRefresh} disabled={isFetching} />}
        addButton={userRole === "admin" && <AddButton to="/admin/user/new" text="Add User" />}
        filters={filters}
        stats={stats}
        renderRowActions={renderRowActions}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this user?")}
      />
    </AdminLayout>
  );
};

export default ListUsers;