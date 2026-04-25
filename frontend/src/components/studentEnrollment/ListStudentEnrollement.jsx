import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetUnenrolledStudentsQuery } from "../../redux/api/authApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import EnrollButton from "../GUI/EnrollButton";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import AppBadge from "../GUI/AppBadge";

// Helper to read cookies
const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) return decodeURIComponent(cookieValue);
  }
  return null;
};

const ListStudentEnrollement = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Read cookies
  const academicYearId = getCookie("academicYear");
  const campusId = getCookie("campus");

  // ✅ Build query params only if values exist
  const queryParams = {};
  if (academicYearId) queryParams.academicYear = academicYearId;
  if (campusId) queryParams.campus = campusId;

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Student created successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t, location.pathname]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetUnenrolledStudentsQuery(
    queryParams,  // ✅ Pass only defined params
    { refetchOnMountOrArgChange: true }
  );

  // Error handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (user?.role === "admin") setUserRole("admin");
  }, [error, user, t]);

  // Refetch on navigation state
  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const getFullName = (row) => {
    const { firstName = "", middleName = "", lastName = "" } = row;
    return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
  };

  const columns = [
    {
      header: t("Student Name"),
      accessor: "firstName",
      width: "35%",
      minWidth: "200px",
      render: (_, row) => <TruncatedCell maxChars={35}>{getFullName(row)}</TruncatedCell>,
    },
    {
      header: t("Nationality"),
      accessor: "nationality",
      width: "20%",
      minWidth: "120px",
      render: (value) => <TruncatedCell maxChars={33}>{value || "—"}</TruncatedCell>,
    },
    {
      header: t("Phone Number"),
      accessor: "phoneNumber",
      width: "25%",
      minWidth: "150px",
      render: (value) => value || <span className="text-gray-400">—</span>,
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "10%",
      minWidth: "100px",
      render: (value) => <AppBadge type="gender" value={value} />,
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "10%",
      minWidth: "100px",
      render: (value) => {
        const isActive =
          value === true ||
          value === "active" ||
          value === "Active" ||
          value === "ACTIVE" ||
          value === 1;
        return <AppBadge type="booleanStatus" active={isActive} />;
      },
    },
  ];

  const students = data?.students || [];
  const totalUnenrolled = students.length;
  const stats = [
    {
      label: t("Total Unenrolled Students"),
      value: totalUnenrolled,
      icon: "users",
      color: "blue",
    },
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
    >
      <div className="text-sm text-gray-500">
        {t("Only students without enrollment in the selected academic year are shown.")}
      </div>
    </FilterDropdown>
  );

  const renderRowActions = (row) => (
    <EnrollButton
      studentId={row._id}
      onSuccess={() => {
        refetch();
        toast.success(t("Student enrolled successfully!"));
      }}
    />
  );

  const emptyState = (
    <EmptyState
      icon="user-graduate"
      title={
        searchTerm
          ? t("No unenrolled students match your search")
          : t("No unenrolled students")
      }
      message={t(
        "All students are already enrolled for the selected academic year, or try adjusting your search."
      )}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Unenrolled Students")} />

      <DataTableContainer
        title={t("Unenrolled Student Management")}
        subtitle={t("Manage students who are not yet enrolled in the selected academic year")}
        data={students}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={null}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search unenrolled students by name, nationality or phone...")}
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
            {t("Showing")}: {students.length} {t("unenrolled students")}
          </p>
        )}
        className="student-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default ListStudentEnrollement;