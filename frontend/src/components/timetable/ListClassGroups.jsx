import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import {
  useGetClassGroupsQuery,
  useDeleteClassGroupMutation,
} from "../../redux/api/classGroupApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

import AdminLayout from "../GUI/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton";

const ListClassGroups = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // User role for permissions
  const [userRole, setUserRole] = useState("");

  // Search & pagination
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Delete modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // ──────────────────────────────────────────────────────────────
  // 1. Fetch dropdown data for filters
  // ──────────────────────────────────────────────────────────────
  const { data: academicLevelsData } = useGetAcademicLevelsQuery(
    { paginate: false },
    { skip: !showFilters }
  );
  const { data: gradesData } = useGetGradesQuery(
    { paginate: false },
    { skip: !showFilters }
  );

  // Year options for filter dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  // ──────────────────────────────────────────────────────────────
  // 2. Debounced search term
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ──────────────────────────────────────────────────────────────
  // 3. Build query parameters for API
  // ──────────────────────────────────────────────────────────────
  const queryParams = {
    page: currentPage,
    limit,
    keyword: searchTerm || undefined,
    paginate: true,
    ...(selectedCampus && { campus: selectedCampus }),
    ...(selectedYear && { year: parseInt(selectedYear) }),
    ...(selectedGrade && { gradeId: selectedGrade }),
    ...(selectedAcademicLevel && { academicLevelId: selectedAcademicLevel }),
    ...(selectedSection && { section: selectedSection }),
    ...(selectedStatus && { status: selectedStatus }),
    populateCourses: false,
    populateTeacher: false,
  };

  // ──────────────────────────────────────────────────────────────
  // 4. Main data fetching
  // ──────────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetClassGroupsQuery(queryParams);

  const [
    deleteClassGroup,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteClassGroupMutation();

  // ──────────────────────────────────────────────────────────────
  // 5. Effects – side effects and role
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === "admin") setUserRole("admin");
    else if (user?.role === "teacher") setUserRole("teacher");
    else setUserRole("");
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Something went wrong"));
    }
    if (deleteError) {
      toast.error(deleteError?.data?.message || t("Delete failed"));
    }
    if (isSuccess) {
      toast.success(t("Class group deleted successfully"));
      refetch();
      setShowModal(false);
      setSelectedGroupId(null);
    }
  }, [error, deleteError, isSuccess, t, refetch]);

  // ──────────────────────────────────────────────────────────────
  // 6. Delete handlers
  // ──────────────────────────────────────────────────────────────
  const handleDeleteClick = (id) => {
    setSelectedGroupId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGroupId) {
      deleteClassGroup(selectedGroupId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // ──────────────────────────────────────────────────────────────
  // 7. Reset all filters
  // ──────────────────────────────────────────────────────────────
  const resetFilters = () => {
    setSelectedCampus("");
    setSelectedYear("");
    setSelectedGrade("");
    setSelectedAcademicLevel("");
    setSelectedSection("");
    setSelectedStatus("");
    setSearch("");
    setSearchTerm("");
    setCurrentPage(1);
    setLimit(10);
  };

  // ──────────────────────────────────────────────────────────────
  // 8. Column definitions – CAMPUS and YEAR columns removed
  // ──────────────────────────────────────────────────────────────
  const columns = [
    {
      header: t("Display Name"),
      accessor: "displayName",
      width: "20%",
      minWidth: "140px",
      render: (value, row) => (
        <div className="max-w-[200px]">
          <p
            className="font-medium text-gray-800 text-base"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: "1",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-all",
            }}
            title={value}
          >
            {value}
          </p>
        </div>
      ),
    },
    {
      header: t("Grade"),
      accessor: "grade",
      width: "15%",
      minWidth: "100px",
      render: (value) => (
        <span className="text-sm text-gray-700">
          {value?.gradeName || "—"}
        </span>
      ),
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "15%",
      minWidth: "120px",
      render: (value) => (
        <span className="text-sm text-gray-700">
          {value?.name || "—"}
        </span>
      ),
    },
    {
      header: t("Section"),
      accessor: "section",
      width: "10%",
      minWidth: "80px",
      render: (value) => (
        <span className="text-sm font-medium text-gray-800">
          {value || "—"}
        </span>
      ),
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "100px",
      render: (value) => (
        <div className="flex items-center justify-start">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              value
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <i
              className={`fas ${value ? "fa-check-circle" : "fa-times-circle"} mr-2`}
            ></i>
            {value ? t("Active") : t("Inactive")}
          </span>
        </div>
      ),
    },
  ];

  // ──────────────────────────────────────────────────────────────
  // 9. Stats cards – adjusted to remove year/campus references
  // ──────────────────────────────────────────────────────────────
  const stats = [
    {
      label: t("Total Class Groups"),
      value: data?.pagination?.total || 0,
      icon: "users-class",
      color: "blue",
    },
    {
      label: t("Active Groups"),
      value: data?.counts?.active || 0,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Inactive Groups"),
      value: data?.counts?.deactive || 0,
      icon: "times-circle",
      color: "red",
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "orange",
    },
  ];

  // ──────────────────────────────────────────────────────────────
  // 10. Action buttons (add, refresh)
  // ──────────────────────────────────────────────────────────────
  const addButton =
    userRole === "admin" ? (
      <AddButton
        to="/admin/class-groups/new"
        text={t("Add New Class Group")}
        icon="plus"
      />
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

  // ──────────────────────────────────────────────────────────────
  // 11. Filters UI (dropdown panel) – remains unchanged
  // ──────────────────────────────────────────────────────────────
  const filters = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
        >
          <i className="fa fa-sliders-h"></i>
          <span>{t("Filters")}</span>
          <i
            className={`fa fa-chevron-${showFilters ? "up" : "down"} text-sm`}
          ></i>
        </button>

        {showFilters && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-5">
            <h3 className="font-medium text-gray-700 mb-3">
              {t("Filter Class Groups")}
            </h3>
            <div className="space-y-4">
              {/* Campus filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Campus")}
                </label>
                <input
                  type="text"
                  value={selectedCampus}
                  onChange={(e) => {
                    setSelectedCampus(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t("Campus ID or name")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("Enter campus ObjectId")}
                </p>
              </div>

              {/* Year filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Year")}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">{t("All Years")}</option>
                  {yearOptions.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Grade")}
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">{t("All Grades")}</option>
                  {gradesData?.grades?.map((grade) => (
                    <option key={grade._id} value={grade._id}>
                      {grade.gradeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Level filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Academic Level")}
                </label>
                <select
                  value={selectedAcademicLevel}
                  onChange={(e) => {
                    setSelectedAcademicLevel(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">{t("All Levels")}</option>
                  {academicLevelsData?.academicLevels?.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Section")}
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">{t("All Sections")}</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="ENG">ENG</option>
                  <option value="SCIENCE">SCIENCE</option>
                  <option value="COMMERCE">COMMERCE</option>
                  <option value="ARTS">ARTS</option>
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Status")}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">{t("All Status")}</option>
                  <option value="active">{t("Active")}</option>
                  <option value="deactive">{t("Inactive")}</option>
                </select>
              </div>

              {/* Items per page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Items per page")}
                </label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  {[5, 10, 15, 20, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} {t("items")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset button */}
              <div className="pt-2 border-t">
                <button
                  onClick={resetFilters}
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

  // ──────────────────────────────────────────────────────────────
  // 12. Row actions (view, edit, delete)
  // ──────────────────────────────────────────────────────────────
  const renderRowActions = (row) => (
    <div className="flex justify-end items-center gap-1">
      <a
        href={`/admin/class-group/${row._id}/details`}
        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center transition-colors"
        title={t("View Details")}
        style={{ width: "36px", height: "36px" }}
      >
        <i className="fa fa-eye text-sm"></i>
      </a>
      {userRole === "admin" && (
        <>
          <a
            href={`/admin/class-groups/${row._id}`}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center transition-colors"
            title={t("Edit")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-edit text-sm"></i>
          </a>
          <button
            onClick={() => handleDeleteClick(row._id)}
            disabled={isDeleteLoading}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            title={t("Delete")}
            style={{ width: "36px", height: "36px" }}
          >
            <i className="fa fa-trash text-sm"></i>
          </button>
        </>
      )}
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // 13. Loading & Render
  // ──────────────────────────────────────────────────────────────
  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allClassGroups")} />

      <DataTableContainer
        title={t("Class Group Management")}
        subtitle={t("Manage class groups, sections and their academic settings")}
        data={data?.classGroups || []}
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
        searchPlaceholder={t("Search by display name or section...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa fa-users-class text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchTerm
                ? t("No class groups found matching your search")
                : t("No class groups found")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("Try adjusting your filters or add a new class group")}
            </p>
          </div>
        }
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {data?.classGroups?.length || 0}{" "}
            {t("class groups")}
          </p>
        )}
        className="class-group-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this class group?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListClassGroups;