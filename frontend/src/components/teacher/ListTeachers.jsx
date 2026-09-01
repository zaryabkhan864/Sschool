import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useDeleteUserMutation,
  useGetUserByTypeQuery,
  useGetAcademicYearsQuery,
} from "../../redux/api/authApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";

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
import PhoneLink from "../GUI/PhoneLink";
import AppBadge from "../GUI/AppBadge";
import SearchableDropdown from "../layout/SearchableDropdown";

const getFullName = (user) => {
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const ListTeachers = () => {
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
  const [statusFilter, setStatusFilter] = useState(""); // now filters by accountStatus
  const [campusFilter, setCampusFilter] = useState("");
  const [campusSearchTerm, setCampusSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");

  // Fetch campuses
  const { data: campusesData, isFetching: campusesLoading } = useGetCampusQuery({
    limit: 0,
    keyword: campusSearchTerm,
  });

  const campusOptions = useMemo(() => {
    const campuses = campusesData?.campuses || [];
    const options = [{ value: "", label: t("All Campuses"), subtitle: "" }];
    campuses.forEach((c) =>
      options.push({ value: c._id, label: c.name, subtitle: c.location })
    );
    return options;
  }, [campusesData, t]);

  // Fetch academic years
  const { data: academicYearsData, isFetching: academicYearsLoading } =
    useGetAcademicYearsQuery();
  const academicYearsOptions = useMemo(() => {
    const years = academicYearsData || [];
    return [
      { value: "", label: t("All Academic Years") },
      ...years.map((y) => ({
        value: y._id || y,
        label: y.name || y.year || y,
      })),
    ];
  }, [academicYearsData, t]);

  // Success toast from navigation state
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Teacher created successfully!"));
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

  // Main data query – note the field name change
  const { data, isLoading, error, refetch, isFetching } = useGetUserByTypeQuery(
    {
      type: "teacher",
      contracted: true,
      campus: campusFilter || undefined,
      academicYear: academicYearFilter || undefined,
      page: currentPage,
      limit,
      keyword: searchTerm,
      gender: genderFilter || undefined,
      accountStatus: statusFilter || undefined,   // ✅ changed from "status" to "accountStatus"
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteUser, { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess }] =
    useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  // Error / success handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete teacher"));
    if (deleteSuccess) {
      toast.success(t("Teacher deleted successfully"));
      setShowModal(false);
      setSelectedTeacherId(null);
      refetch();
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, deleteSuccess, user, t, refetch]);

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

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

  const handleEditTeacher = (id) => navigate(`/admin/teachers/${id}`);
  const handleViewDetails = (id) => navigate(`/admin/teacher/${id}/details`);

  // Column definitions – updated status column
  const columns = [
    {
      header: t("Teacher Name"),
      accessor: "firstName",
      width: "30%",
      minWidth: "200px",
      render: (_, row) => <TruncatedCell maxChars={30}>{getFullName(row)}</TruncatedCell>,
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "12%",
      minWidth: "100px",
      render: (value) => <AppBadge type="gender" value={value} />,
    },
    {
      header: t("Country"),
      accessor: "nationality",
      width: "15%",
      minWidth: "120px",
      render: (value) => <TruncatedCell maxChars={18}>{value || "—"}</TruncatedCell>,
    },
    {
      header: t("Contact Number"),
      accessor: "phoneNumber",
      width: "20%",
      minWidth: "150px",
      render: (value) => <PhoneLink number={value} />,
    },
    {
      header: t("Status"),
      accessor: "accountStatus",                              // ✅ changed to accountStatus
      width: "15%",
      minWidth: "100px",
      render: (value) => <AppBadge type="accountStatus" value={value} />,   // ✅ uses new badge type
    },
  ];

  // Stats – still uses counts.active / counts.deactive (backend should supply these)
  const counts = data?.pagination?.counts || data?.counts || {
    total: 0, active: 0, deactive: 0,
  };

  const stats = [
    { label: t("Total Teachers"), value: counts.total, icon: "chalkboard-teacher", color: "blue" },
    { label: t("Active"), value: counts.active, icon: "check-circle", color: "green" },
    { label: t("Deactive"), value: counts.deactive, icon: "times-circle", color: "red" },
    { label: t("Total Pages"), value: data?.pagination?.totalPages || 1, icon: "file-alt", color: "purple" },
  ];

  const addButton =
    userRole === "admin" ? (
      <AppButton to="/admin/teacher/new" label={t("Add New Teacher")} icon="plus" />
    ) : null;

  const refreshButton = (
    <AppButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} className="ml-2" />
  );

  // Filter panel
  const filters = (
    <FilterDropdown
      limit={limit}
      onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1); }}
      onReset={() => {
        setSearch("");
        setSearchTerm("");
        setGenderFilter("");
        setStatusFilter("");
        setCampusFilter("");
        setAcademicYearFilter("");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      {/* Academic Year filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Academic Year")}
        </label>
        <select
          value={academicYearFilter}
          onChange={(e) => {
            setAcademicYearFilter(e.target.value);
            setCurrentPage(1);
          }}
          disabled={academicYearsLoading}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {academicYearsOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Campus filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Campus")}</label>
        <SearchableDropdown
          value={campusFilter}
          onChange={(val) => { setCampusFilter(val); setCurrentPage(1); }}
          onSearch={setCampusSearchTerm}
          options={campusOptions}
          isLoading={campusesLoading}
          placeholder={t("All Campuses")}
        />
      </div>

      {/* Gender filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Gender")}</label>
        <select
          value={genderFilter}
          onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("All Genders")}</option>
          <option value="male">{t("Male")}</option>
          <option value="female">{t("Female")}</option>
          <option value="other">{t("Other")}</option>
        </select>
      </div>

      {/* Account Status filter – updated to reflect accountStatus values */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Status")}</label>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("All Status")}</option>
          <option value="active">{t("Active")}</option>
          <option value="inactive">{t("Inactive")}</option>
          <option value="pending">{t("Pending")}</option>
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
      onEdit={handleEditTeacher}
    />
  );

  const emptyState = (
    <EmptyState
      icon="chalkboard-teacher"
      title={searchTerm ? t("No teachers found matching your search") : t("No teachers found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allTeachers")} />

      <DataTableContainer
        title={t("Teacher Management")}
        subtitle={t("Manage faculty members and their assignments")}
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
        searchPlaceholder={t("Search teachers by name, contact or email...")}
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
            {t("Showing")}: {data?.users?.length || 0} {t("teachers")}
          </p>
        )}
        className="teacher-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this teacher?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListTeachers;