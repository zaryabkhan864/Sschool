import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  useDeleteGradeMutation,
  useGetGradesQuery,
} from "../../redux/api/gradesApi";

import AdminLayout from "../GUI/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton";

const ListGrades = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ API Query
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useGetGradesQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
  });

  const [
    deleteGrade,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteGradeMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message);

    if (isSuccess) {
      toast.success(t("Grade Deleted"));
      refetch();
      setShowModal(false);
      setSelectedGradeId(null);
    }

    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, isSuccess, user, t, refetch]);

  const handleDeleteClick = (id) => {
    setSelectedGradeId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGradeId) deleteGrade(selectedGradeId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // ✅ Updated columns with only fields from NewGrade
  const columns = [
    {
      header: t("Grade Name"),
      accessor: "gradeName",
      width: "25%",
      minWidth: "180px",
      render: (value) => (
        <div className="max-w-[200px]">
          <p 
            className="font-medium text-gray-800 text-base" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-all'
            }}
            title={value}
          >
            {value}
          </p>
        </div>
      )
    },
    {
      header: t("Description"),
      accessor: "description",
      width: "35%",
      minWidth: "250px",
      render: (value) => {
        if (!value) return <span className="text-sm text-gray-400 italic">{t("No description")}</span>;
        return (
          <div className="max-w-[300px]">
            <p 
              className="text-sm text-gray-600 leading-normal" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '1',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word'
              }}
              title={value}
            >
              {value}
            </p>
          </div>
        );
      }
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "20%",
      minWidth: "150px",
      render: (value) => {
        // academicLevel is an object with _id and name
        return (
          <div className="max-w-[200px]">
            <p 
              className="text-sm text-gray-800" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '1',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word'
              }}
              title={value?.name}
            >
              {value?.name || 'N/A'}
            </p>
          </div>
        );
      }
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "100px",
      render: (value) => {
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <i className={`fas ${value ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
              {value ? t("Active") : t("Inactive")}
            </span>
          </div>
        );
      }
    }
  ];

  // ✅ Updated stats without courses count
  const stats = [
    { 
      label: t("Total Grades"), 
      value: data?.pagination?.total || 0, 
      icon: "graduation-cap", 
      color: "blue" 
    },
    { 
      label: t("Active Grades"), 
      value: data?.grades?.filter(grade => grade.status).length || 0, 
      icon: "check-circle", 
      color: "green" 
    },
    { 
      label: t("Items Shown"), 
      value: data?.grades?.length || 0, 
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
    <AddButton to="/admin/grade/new" text={t("Add New Grade")} icon="plus" />
  ) : null;

  const refreshButton = (
    <RefreshButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} className="ml-2" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("Items per page")}</label>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {[5, 8, 10, 15, 20, 50].map(n => <option key={n} value={n}>{n} {t("items")}</option>)}
                </select>
              </div>
              <div className="pt-2 border-t">
                <button
                  onClick={() => { setSearch(""); setSearchTerm(""); setCurrentPage(1); setLimit(8); }}
                  className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                >
                  <i className="fa fa-undo mr-2"></i>{t("Reset Filters")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRowActions = (row) => (
    <div className="flex justify-end items-center gap-1">
      <a href={`/admin/grade/${row._id}/details`} className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors" title={t("View Details")} style={{ width: "36px", height: "36px" }}>
        <i className="fa fa-eye text-sm"></i>
      </a>
      {userRole === "admin" && (
        <>
          <a href={`/admin/grades/${row._id}`} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors" title={t("Edit")} style={{ width: "36px", height: "36px" }}>
            <i className="fa fa-edit text-sm"></i>
          </a>
          <button className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50" onClick={() => handleDeleteClick(row._id)} disabled={isDeleteLoading} title={t("Delete")} style={{ width: "36px", height: "36px" }}>
            <i className="fa fa-trash text-sm"></i>
          </button>
        </>
      )}
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allGrades")} />

      <DataTableContainer
        title={t("Grade Management")}
        subtitle={t("Manage grade levels and their details")}
        data={data?.grades || []}
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
        searchPlaceholder={t("Search grades by name or description...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={(
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fa fa-graduation-cap text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm ? t("No grades found matching your search") : t("No grades found")}
              </h3>
            </div>
        )}
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {data?.grades?.length || 0} {t("grades")}
          </p>
        )}
        className="grade-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this grade?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListGrades;