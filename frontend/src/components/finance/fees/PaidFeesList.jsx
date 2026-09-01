// src/components/finance/fees/PaidFeesList.jsx
//
// Step 3 of the fees flow: payment history — but ONE ROW PER STUDENT
// (total paid, how many installments, last payment date), not one row
// per installment. A flat per-installment list would grow unbounded as
// more payments happen; at 2000-5000 students this keeps the screen the
// same size as StudentEnrollmentUnPaidList instead of exploding.
//
// "View History" on a row opens PaidFeesStudentDetails, which shows that
// one student's full paid/receipt history (backed by the existing flat
// GET /fees/paid?studentId= endpoint).
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetPaidDuesByStudentQuery } from "../../../redux/api/feesApi";

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

const getFullName = (student) => {
  const { firstName = "", middleName = "", lastName = "" } = student || {};
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const formatTotals = (totals = []) =>
  totals.map((t) => `${t.currency} ${Number(t.amount).toFixed(2)}`).join(", ");

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const PaidFeesList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      toast.success(t("Payment recorded successfully"));
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setCurrentPage(1), [genderFilter]);

  const { data: countData } = useGetPaidDuesByStudentQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetPaidDuesByStudentQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
  }, [error, t]);

  const rows = data?.paidDues || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [
    { label: t("Students With Payments"), value: countData?.total ?? 0, icon: "receipt", color: "green" },
  ];

  const columns = [
    {
      header: t("Student Name"),
      width: "20%",
      minWidth: "190px",
      render: (_, row) => <TruncatedCell maxChars={35}>{getFullName(row.student)}</TruncatedCell>,
    },
    {
      header: t("Gender"),
      width: "8%",
      minWidth: "90px",
      render: (_, row) => <AppBadge type="gender" value={row.student?.gender} />,
    },
    {
      header: t("Phone Number"),
      width: "14%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.student?.phoneNumber} />,
    },
    {
      header: t("Fee Types Paid"),
      width: "16%",
      minWidth: "150px",
      render: (_, row) => (row.feeTypes || []).map((ft) => t(ft)).join(", "),
    },
    {
      header: t("Paid Installments"),
      width: "12%",
      minWidth: "120px",
      render: (_, row) => row.paidCount,
    },
    {
      header: t("Last Payment"),
      width: "10%",
      minWidth: "110px",
      render: (_, row) => formatDate(row.lastPaymentDate),
    },
    {
      header: t("Total Paid"),
      width: "12%",
      minWidth: "140px",
      render: (_, row) => (
        <span className="font-medium text-green-700">{formatTotals(row.totals)}</span>
      ),
    },
    {
      header: t("Action"),
      width: "8%",
      minWidth: "120px",
      render: (_, row) => (
        <AppButton
          label={t("View")}
          icon="eye"
          size="sm"
          onClick={() => navigate(`/admin/finance/fees/paid/${row.student?._id}`)}
        />
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
      icon="receipt"
      title={t("No paid fees yet")}
      message={t("Payments collected via the Payment Fees screen will show up here.")}
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

  const addButton = (
    <AppButton onClick={() => navigate("/admin/finance/fees/unpaid")} label={t("Collect New Payment")} icon="plus" />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Paid Fees")} />

      <DataTableContainer
        title={t("Paid Fees — By Student")}
        subtitle={t("One row per student who has made a payment. Open a row for full receipt history.")}
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
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        renderHeaderInfo={() => (
          <p className="text-sm-custom text-dark-light mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("students")}
          </p>
        )}
        className="paid-fees-table-container bg-surface-50 shadow-soft rounded-xl"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default PaidFeesList;
