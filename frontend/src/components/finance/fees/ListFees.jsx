// component
// src/components/admin/fees/ListFees.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetPendingDuesQuery } from "../../../redux/api/feesApi";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import FilterDropdown from "../../GUI/FilterDropdown";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import PhoneLink from "../../GUI/PhoneLink";

const getFullName = (student) =>
  student
    ? `${student.firstName || ""} ${student.middleName ? student.middleName + " " : ""}${student.lastName || ""}`.trim()
    : "";

// Due-period tabs — matches the backend's classifyDuePeriod() buckets
// exactly, so "Coming Due" here means the same thing as the reminder
// window that's already open for that installment.
const DUE_PERIODS = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "this_month", label: "Due This Month" },
  { value: "next_month", label: "Due Next Month" },
];

const DUE_PERIOD_BADGE = {
  overdue: { label: "Overdue", className: "bg-rose-100 text-rose-600" },
  this_month: { label: "This Month", className: "bg-amber-100 text-amber-600" },
  next_month: { label: "Next Month", className: "bg-blue-100 text-blue-600" },
  later: { label: "Later", className: "bg-gray-100 text-gray-500" },
};

// Small inline badge for fee-collection status — not one of the shared
// AppBadge types, so kept local rather than guessing an unsupported type.
const DuesStatusBadge = ({ duePeriod }) => {
  const cfg = DUE_PERIOD_BADGE[duePeriod] || DUE_PERIOD_BADGE.later;
  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

const ListFees = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [genderFilter, setGenderFilter] = useState("");
  const [duePeriod, setDuePeriod] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter, duePeriod]);

  // Lightweight totals for the stat cards / tab badges — one countOnly
  // call per bucket, so switching tabs doesn't need a full refetch just
  // to know the numbers.
  const { data: totalCount } = useGetPendingDuesQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );
  const { data: overdueCount } = useGetPendingDuesQuery(
    { countOnly: true, duePeriod: "overdue" },
    { refetchOnMountOrArgChange: true }
  );
  const { data: thisMonthCount } = useGetPendingDuesQuery(
    { countOnly: true, duePeriod: "this_month" },
    { refetchOnMountOrArgChange: true }
  );
  const { data: nextMonthCount } = useGetPendingDuesQuery(
    { countOnly: true, duePeriod: "next_month" },
    { refetchOnMountOrArgChange: true }
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPendingDuesQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
      duePeriod: duePeriod !== "all" ? duePeriod : undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (user?.role === "admin") setUserRole("admin");
  }, [error, user, t]);

  const rows = data?.dues || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [
    { label: t("Total Pending"), value: totalCount?.total ?? 0, icon: "hand-holding-usd", color: "orange" },
    { label: t("Overdue"), value: overdueCount?.total ?? 0, icon: "exclamation-circle", color: "red" },
    { label: t("Due This Month"), value: thisMonthCount?.total ?? 0, icon: "calendar-day", color: "amber" },
    { label: t("Due Next Month"), value: nextMonthCount?.total ?? 0, icon: "calendar-plus", color: "blue" },
  ];

  const columns = [
    {
      header: t("Student Name"),
      accessor: "name",
      width: "20%",
      minWidth: "180px",
      render: (_, row) => <TruncatedCell maxChars={35}>{getFullName(row.student)}</TruncatedCell>,
    },
    {
      header: t("Class Group"),
      accessor: "classGroup",
      width: "13%",
      minWidth: "130px",
      render: (_, row) => (
        <TruncatedCell maxChars={25}>
          {row.student?.currentEnrollment?.classGroup?.displayName ||
            row.student?.currentEnrollment?.classGroup?.grade?.gradeName ||
            "-"}
        </TruncatedCell>
      ),
    },
    {
      header: t("Phone Number"),
      width: "12%",
      minWidth: "140px",
      render: (_, row) => <PhoneLink number={row.student?.phoneNumber} />,
    },
    {
      header: t("Fee Types Due"),
      accessor: "feeTypes",
      width: "16%",
      minWidth: "150px",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {(row.feeTypes || []).map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-600 rounded-full"
            >
              {t(type)}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: t("Total Due"),
      accessor: "totalDue",
      width: "13%",
      minWidth: "130px",
      render: (_, row) => (
        <div className="space-y-0.5">
          {(row.totals || []).map((tot) => (
            <p key={tot.currency} className="font-bold text-gray-800 text-sm">
              {tot.currency} {tot.amount?.toLocaleString()}
            </p>
          ))}
        </div>
      ),
    },
    {
      header: t("Next Due"),
      accessor: "nextDueDate",
      width: "12%",
      minWidth: "110px",
      render: (_, row) => (
        <span className="text-sm text-gray-600">
          {row.nextDueDate ? new Date(row.nextDueDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "10%",
      minWidth: "110px",
      render: (_, row) => <DuesStatusBadge duePeriod={row.duePeriod} />,
    },
    {
      header: t("Action"),
      accessor: "action",
      width: "12%",
      minWidth: "150px",
      render: (_, row) => (
        <AppButton
          label={t("Collect Payment")}
          icon="money-bill-wave"
          size="sm"
          onClick={() => navigate(`/finance/fees/Payment?studentId=${row.student?._id}`)}
        />
      ),
    },
  ];

  // Segmented tab control for the due-period filter — kept as its own
  // row above the table rather than tucked inside FilterDropdown, since
  // this is the primary way finance will narrow the list day to day.
  const duePeriodTabs = (
    <div className="flex flex-wrap gap-2 mb-4">
      {DUE_PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => setDuePeriod(period.value)}
          className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${
            duePeriod === period.value
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {t(period.label)}
        </button>
      ))}
    </div>
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
        setGenderFilter("");
        setDuePeriod("all");
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Gender")}</label>
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

  const emptyState = (
    <EmptyState
      icon="check-circle"
      title={
        searchTerm || genderFilter || duePeriod !== "all"
          ? t("No records found matching your filters")
          : t("No pending dues")
      }
      message={t("Every enrolled student is currently paid up. 🎉")}
    />
  );

  const refreshButton = (
    <AppButton
      onClick={() => {
        refetch();
        toast.success(t("Refreshed"));
      }}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  if (isLoading) return null;

  return (
    <AdminLayout>
      <MetaData title={t("Fees To Collect")} />

      {duePeriodTabs}

      <DataTableContainer
        title={t("Fees To Collect")}
        subtitle={t("Students with one or more pending fee installments")}
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
        onRefresh={refetch}
        refreshButton={refreshButton}
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
        className="fees-collection-table-container bg-surface-50 shadow-soft rounded-xl"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default ListFees;