// src/components/finance/salary/PaidSalariesList.jsx
//
// "Kis kis teacher ko salary pay ki, kis month" — full paid-salary
// history across every employee and month, filterable, paginated. Each
// row already IS one employee/one month (salaries never explode into
// installments the way fees do), so no aggregation is needed here.
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminLayout from "../../layout/AdminLayout";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import AppInput from "../../GUI/AppInput";
import FilterDropdown from "../../GUI/FilterDropdown";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import AppBadge from "../../GUI/AppBadge";
import PhoneLink from "../../GUI/PhoneLink";
import SelectField from "./SelectField";
import { useGetSalariesQuery } from "../../../redux/api/salaryApi";
import { MONTH_NAMES } from "../../../constants/salaryConstants";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const PaidSalariesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setCurrentPage(1), [monthFilter, yearFilter, genderFilter]);

  const { data: countData } = useGetSalariesQuery(
    { status: "Paid", countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetSalariesQuery(
    {
      status: "Paid",
      month: monthFilter || undefined,
      year: yearFilter || undefined,
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

  const rows = data?.salaries || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [{ label: t("Total Salary Payments"), value: countData?.total ?? 0, icon: "receipt", color: "green" }];

  const columns = [
    {
      header: t("Employee"),
      width: "18%",
      minWidth: "180px",
      render: (_, row) => <TruncatedCell maxChars={35}>{row.employeeId?.fullName}</TruncatedCell>,
    },
    { header: t("Gender"), width: "8%", minWidth: "90px", render: (_, row) => <AppBadge type="gender" value={row.employeeId?.gender} /> },
    { header: t("Phone Number"), width: "13%", minWidth: "150px", render: (_, row) => <PhoneLink number={row.employeeId?.phoneNumber} /> },
    { header: t("Month"), width: "12%", minWidth: "120px", render: (_, row) => `${t(row.month)} ${row.year}` },
    {
      header: t("Net Paid"),
      width: "12%",
      minWidth: "120px",
      render: (_, row) => <span className="font-medium text-green-700">{row.currency} {row.netSalary.toFixed(2)}</span>,
    },
    { header: t("Payment Method"), width: "12%", minWidth: "130px", render: (_, row) => t(row.paymentMethod) },
    { header: t("Payment Date"), width: "12%", minWidth: "120px", render: (_, row) => formatDate(row.paymentDate) },
    {
      header: t("Action"),
      width: "13%",
      minWidth: "140px",
      render: (_, row) => (
        <AppButton label={t("View Receipt")} icon="receipt" size="sm" onClick={() => navigate(`/finance/salaries/receipt/${row._id}`)} />
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
        setMonthFilter("");
        setYearFilter("");
        setGenderFilter("");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      <SelectField
        label={t("Month")}
        value={monthFilter}
        onChange={setMonthFilter}
        placeholder={t("All Months")}
        options={MONTH_NAMES}
        optionLabel={(m) => t(m)}
      />
      <AppInput
        label={t("Year")}
        type="number"
        value={yearFilter}
        onChange={(e) => setYearFilter(e.target.value)}
        placeholder={t("Any year")}
      />
      <SelectField
        label={t("Gender")}
        value={genderFilter}
        onChange={setGenderFilter}
        placeholder={t("All Genders")}
        options={["male", "female", "other"]}
        optionLabel={(g) => t(g.charAt(0).toUpperCase() + g.slice(1))}
      />
    </FilterDropdown>
  );

  const emptyState = <EmptyState icon="receipt" title={t("No salary payments yet")} message={t("Payments made via Pay Salary will show up here.")} />;

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
      <MetaData title={t("Paid Salaries")} />

      <DataTableContainer
        title={t("Paid Salaries — All Employees")}
        subtitle={t("Every salary payment made, across all months")}
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
            {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("payments")}
          </p>
        )}
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default PaidSalariesList;
