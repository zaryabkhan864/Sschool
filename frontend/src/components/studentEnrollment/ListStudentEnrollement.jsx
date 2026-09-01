// component
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetUnenrolledStudentsQuery,
  useGetStudentEnrollmentsQuery,
} from "../../redux/api/studentEnrollment";

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
import PhoneLink from "../GUI/PhoneLink";

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
  const [statusFilter, setStatusFilter] = useState("unenrolled"); // "unenrolled" | "enrolled"
  const [genderFilter, setGenderFilter] = useState("");

  // ----- Side effects -----
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Student updated successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t, location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever a filter that changes the result set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genderFilter]);

  // ----- Queries -----
  // Lightweight, always-on "total" counts for the stats cards — these use
  // countOnly=true on the backend so they never pull the full student /
  // enrollment lists, just a count.
  const {
    data: unenrolledCountData,
    error: unenrolledCountError,
    refetch: refetchUnenrolledCount,
  } = useGetUnenrolledStudentsQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const {
    data: enrolledCountData,
    error: enrolledCountError,
    refetch: refetchEnrolledCount,
  } = useGetStudentEnrollmentsQuery(
    { status: "active", countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  // 1) Students not yet enrolled — server-side paginated + searched + filtered.
  // Only actually fetched while this tab is active.
  const {
    data: unenrolledData,
    isLoading: unenrolledLoading,
    error: unenrolledError,
    refetch: refetchUnenrolled,
    isFetching: unenrolledFetching,
  } = useGetUnenrolledStudentsQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    {
      skip: statusFilter !== "unenrolled",
      refetchOnMountOrArgChange: true,
    }
  );

  // 2) Active enrollments — server-side paginated + searched + filtered.
  // Only actually fetched while this tab is active.
  const {
    data: enrolledData,
    isLoading: enrolledLoading,
    error: enrolledError,
    refetch: refetchEnrolled,
    isFetching: enrolledFetching,
  } = useGetStudentEnrollmentsQuery(
    {
      status: "active",
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    {
      skip: statusFilter !== "enrolled",
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetchUnenrolledCount();
      refetchEnrolledCount();
      if (statusFilter === "unenrolled") refetchUnenrolled();
      else refetchEnrolled();
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (unenrolledError)
      toast.error(unenrolledError?.data?.message || t("Something went wrong"));
    if (enrolledError)
      toast.error(enrolledError?.data?.message || t("Something went wrong"));
    if (unenrolledCountError)
      toast.error(unenrolledCountError?.data?.message || t("Something went wrong"));
    if (enrolledCountError)
      toast.error(enrolledCountError?.data?.message || t("Something went wrong"));
    if (user?.role === "admin") setUserRole("admin");
  }, [unenrolledError, enrolledError, unenrolledCountError, enrolledCountError, user, t]);

  // ----- Helpers -----
  const handleRefresh = () => {
    refetchUnenrolledCount();
    refetchEnrolledCount();
    if (statusFilter === "unenrolled") refetchUnenrolled();
    else refetchEnrolled();
    toast.success(t("Refreshed"));
  };

  const getFullName = (row) => {
    // `row` can be a student object (unenrolled) or a student object inside an enrollment (enrolled)
    const userObj = row?.student || row; // enrollment has .student
    const { firstName = "", middleName = "", lastName = "" } = userObj || {};
    return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
  };

  // ----- Build rows for the CURRENT tab only (already paginated/filtered by the backend) -----
  const unenrolledStudents = unenrolledData?.students || [];
  const enrolledEnrollments = enrolledData?.enrollments || [];

  let rows = [];
  if (statusFilter === "unenrolled") {
    rows = unenrolledStudents.map((student) => ({
      ...student,
      type: "unenrolled",
    }));
  } else {
    rows = enrolledEnrollments.map((enrollment) => ({
      id: enrollment._id,
      name: getFullName(enrollment), // enrollment.student
      accountStatus: enrollment.student?.accountStatus,
      phoneNumber: enrollment.student?.phoneNumber,
      gender: enrollment.student?.gender,
      status: enrollment.status, // active/terminated/etc.
      enrollmentId: enrollment._id,
      type: "enrolled",
    }));
  }

  // ----- Pagination meta (comes straight from the backend response) -----
  const activePagination =
    statusFilter === "unenrolled" ? unenrolledData?.pagination : enrolledData?.pagination;
  const activeTotal =
    statusFilter === "unenrolled"
      ? unenrolledData?.total ?? rows.length
      : enrolledData?.total ?? rows.length;

  const paginationMeta =
    activePagination || {
      total: activeTotal,
      page: currentPage,
      limit,
      totalPages: Math.max(Math.ceil(activeTotal / limit), 1),
    };

  // ----- Stats (independent of the active tab / pagination) -----
  const stats = [
    {
      label: t("Unenrolled Students"),
      value: unenrolledCountData?.total ?? 0,
      icon: "user-slash",
      color: "orange",
    },
    {
      label: t("Enrolled Students"),
      value: enrolledCountData?.total ?? 0,
      icon: "user-check",
      color: "green",
    },
  ];

  // ----- Columns (mirrors the contract table structure) -----
  const columns = [
    {
      header: t("Student Name"),
      accessor: "name",
      width: "25%",
      minWidth: "200px",
      render: (_, row) => (
        <TruncatedCell maxChars={35}>
          {typeof row.name === "string" ? row.name : getFullName(row)}
        </TruncatedCell>
      ),
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "10%",
      minWidth: "100px",
      render: (value) => <AppBadge type="gender" value={value} />,
    },
    {
      header: "Account Status",
      accessor: "accountStatus",
      width: "15%",
      minWidth: "120px",
      render: (value) => <AppBadge type="accountStatus" value={value} />,
    },
    {
      // For enrolled tab we show Enrollment Status; for unenrolled we can hide or show N/A
      header: statusFilter === "enrolled" ? t("Enrollment Status") : t("Status"),
      accessor: statusFilter === "enrolled" ? "status" : "accountStatus",
      width: "15%",
      minWidth: "120px",
      render: (value, row) => {
        if (statusFilter === "enrolled") {
          // Use a badge for enrollment status (e.g., "active", "terminated")
          return <AppBadge type="enrollmentStatus" value={value} />;
        }
        // For unenrolled, we can reuse the accountStatus badge
        return <AppBadge type="accountStatus" value={row.accountStatus} />;
      },
    },
    {
      header: t("Phone Number"),
      width: "15%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.phoneNumber} />,
    },
    {
      header: t("Action"),
      accessor: "action",
      width: "20%",
      minWidth: "150px",
      render: (_, row) => {
        if (row.type === "unenrolled") {
          return (
            <EnrollButton
              studentId={row._id}
              onSuccess={() => {
                refetchUnenrolledCount();
                refetchEnrolledCount();
                refetchUnenrolled();
                toast.success(t("Student enrolled successfully!"));
              }}
            />
          );
        }
        // enrolled row – view enrollment details
        return (
          <AppButton
            label={t("View")}
            icon="eye"
            onClick={() =>
              navigate(`/admin/student-enrollments/${row.enrollmentId}/edit`)
            }
            size="sm"
          />
        );
      },
    },
  ];

  // ----- Filters -----
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
        setStatusFilter("unenrolled");
        setGenderFilter("");
      }}
    >
      <div className="text-sm-custom text-dark-light flex flex-col sm:flex-row sm:items-center gap-2">
        <span>{t("Filter by status")}:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm-custom"
        >
          <option value="unenrolled">{t("Unenrolled")}</option>
          <option value="enrolled">{t("Enrolled")}</option>
        </select>
      </div>

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
    </FilterDropdown>
  );

  // ----- Empty state -----
  const emptyState = (
    <EmptyState
      icon="user-graduate"
      title={
        searchTerm || genderFilter
          ? t("No records found matching your search")
          : statusFilter === "unenrolled"
          ? t("No unenrolled students")
          : t("No enrolled students found")
      }
      message={
        statusFilter === "unenrolled"
          ? t("All students are already enrolled for the selected academic year.")
          : t("There are no active enrollments.")
      }
    />
  );

  const isLoading =
    statusFilter === "unenrolled" ? unenrolledLoading : enrolledLoading;
  const isFetching =
    statusFilter === "unenrolled" ? unenrolledFetching : enrolledFetching;

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

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Student Enrollments")} />

      <DataTableContainer
        title={t("Student Enrollment Management")}
        subtitle={t("Manage students who are not yet enrolled, or view existing enrollments")}
        data={rows}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={paginationMeta}
        currentPage={paginationMeta.page}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search students by name or phone...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderHeaderInfo={() => (
          <p className="text-sm-custom text-dark-light mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("students")}
          </p>
        )}
        className="student-enrollment-table-container bg-surface-50 shadow-soft rounded-xl"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default ListStudentEnrollement;
