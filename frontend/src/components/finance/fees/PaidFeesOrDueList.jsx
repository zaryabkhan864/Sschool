// src/components/finance/fees/PaidFeesOrDueList.jsx
//
// Upcoming-dues screen: ONE ROW PER STUDENT whose next installment(s)
// fall due within the next 10 days (Monthly/Quarterly/Half Yearly/
// Annually payers), not one row per installment — same reasoning as
// PaidFeesList: stays flat instead of growing with every installment
// at 2000-5000+ students.
//
// "Pay Now" carries that student's exact due-soon feeIds into
// PaymentFees so only those (not every pending installment) are
// pre-selected. "Mark Reminded" clears the whole group in one call.
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetUpcomingDuesByStudentQuery,
  useMarkFeeRemindersSentBulkMutation,
} from "../../../redux/api/feesApi";

import AdminLayout from "../../layout/AdminLayout";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import FilterDropdown from "../../GUI/FilterDropdown";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import AppBadge from "../../GUI/AppBadge";
import PhoneLink from "../../GUI/PhoneLink";

const DUE_WINDOW_DAYS = 10;

const getFullName = (student) => {
  const { firstName = "", middleName = "", lastName = "" } = student || {};
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const formatTotals = (totals = []) =>
  totals.map((t) => `${t.currency} ${Number(t.amount).toFixed(2)}`).join(", ");

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const daysUntil = (date) => {
  if (!date) return null;
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (24 * 60 * 60 * 1000));
};

const PaidFeesOrDueList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setCurrentPage(1), [genderFilter]);

  const { data: countData } = useGetUpcomingDuesByStudentQuery(
    { days: DUE_WINDOW_DAYS, countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetUpcomingDuesByStudentQuery(
    {
      days: DUE_WINDOW_DAYS,
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [markRemindersSentBulk, { isLoading: isMarking }] = useMarkFeeRemindersSentBulkMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
  }, [error, t]);

  const rows = data?.dues || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [
    { label: t("Students Due Soon"), value: countData?.total ?? 0, icon: "bell", color: "orange" },
  ];

  const handlePayNow = (row) => {
    const studentId = row.student?._id;
    if (!studentId) {
      toast.error(t("Could not resolve the student for this due"));
      return;
    }
    navigate(`/admin/finance/fees/payment?studentId=${studentId}&feeIds=${row.feeIds.join(",")}`);
  };

  const handleMarkReminded = async (row) => {
    try {
      await markRemindersSentBulk(row.feeIds).unwrap();
      toast.success(t("Reminder(s) marked as sent"));
    } catch (err) {
      toast.error(err?.data?.message || t("Error updating reminder"));
    }
  };

  const columns = [
    {
      header: t("Student Name"),
      width: "18%",
      minWidth: "190px",
      render: (_, row) => <TruncatedCell maxChars={35}>{getFullName(row.student)}</TruncatedCell>,
    },
    {
      header: t("Gender"),
      width: "7%",
      minWidth: "90px",
      render: (_, row) => <AppBadge type="gender" value={row.student?.gender} />,
    },
    {
      header: t("Phone Number"),
      width: "13%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.student?.phoneNumber} />,
    },
    {
      header: t("Fee Types"),
      width: "13%",
      minWidth: "130px",
      render: (_, row) => (row.feeTypes || []).map((ft) => t(ft)).join(", "),
    },
    {
      header: t("Installments Due"),
      width: "10%",
      minWidth: "120px",
      render: (_, row) => row.dueCount,
    },
    {
      header: t("Due In"),
      width: "9%",
      minWidth: "100px",
      render: (_, row) => {
        const days = daysUntil(row.nextDueDate);
        if (days === null) return "-";
        if (days < 0) return <AppBadge type="feeDue" value="Overdue" />;
        if (days === 0) return <span className="text-red-600 font-medium">{t("Today")}</span>;
        return `${days} ${t("day(s)")}`;
      },
    },
    {
      header: t("Total Due Soon"),
      width: "12%",
      minWidth: "140px",
      render: (_, row) => (
        <span className="font-medium text-amber-700">{formatTotals(row.totals)}</span>
      ),
    },
    {
      header: t("Action"),
      width: "18%",
      minWidth: "220px",
      render: (_, row) => (
        <div className="flex gap-2">
          <AppButton label={t("Pay Now")} icon="money-bill-wave" size="sm" onClick={() => handlePayNow(row)} />
          <AppButton
            label={t("Mark Reminded")}
            icon="bell"
            size="sm"
            disabled={isMarking}
            onClick={() => handleMarkReminded(row)}
          />
        </div>
      ),
    },
  ];

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
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Gender")}</label>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
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
      icon="calendar-check"
      title={t("No dues coming up")}
      message={t("Nothing is due within the next {{days}} days.", { days: DUE_WINDOW_DAYS })}
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

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Upcoming Fee Dues")} />

      <DataTableContainer
        title={t("Upcoming Fee Dues — By Student")}
        subtitle={t("Students whose installment(s) are due within {{days}} days", { days: DUE_WINDOW_DAYS })}
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
        searchPlaceholder={t("Search by name or phone...")}
        onRefresh={refetch}
        refreshButton={refreshButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        renderHeaderInfo={() => (
          <p className="text-sm-custom text-dark-light mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("students")}
          </p>
        )}
        className="fees-due-table-container bg-surface-50 shadow-soft rounded-xl"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default PaidFeesOrDueList;