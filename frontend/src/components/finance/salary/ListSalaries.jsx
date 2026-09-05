// src/components/finance/salary/ListSalaries.jsx
//
// "Monthly Salaries" — one row per employee for the selected month+year.
// Actions per row: Pay (single), Add/Edit Deduction (while Unpaid), View
// Receipt (once Paid). A "Pay All Unpaid (this page)" button covers the
// common case of paying everyone for the month in one click.
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  useApplySalaryDeductionMutation,
  useGetSalariesQuery,
  useGetSalaryStatsQuery,
  usePaySalariesBulkMutation,
} from "../../../redux/api/salaryApi";
import { MONTH_NAMES, currentMonthName } from "../../../constants/salaryConstants";

// Small inline modal for applying a deduction — kept in this file since
// it's only ever used from this one screen.
const DeductionModal = ({ salary, onClose, onSaved }) => {
  const { t } = useTranslation();
  const [deductions, setDeductions] = useState(salary.deductions || 0);
  const [reason, setReason] = useState(salary.deductionReason || "");
  const [applyDeduction, { isLoading }] = useApplySalaryDeductionMutation();

  const handleSave = async () => {
    if (deductions < 0 || isNaN(Number(deductions))) {
      return toast.error(t("Please enter a valid deduction amount"));
    }
    try {
      await applyDeduction({ id: salary._id, deductions: Number(deductions), reason }).unwrap();
      toast.success(t("Deduction applied"));
      onSaved();
    } catch (err) {
      toast.error(err?.data?.message || t("Error applying deduction"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-base-custom font-semibold mb-1">
          {t("Deduction for")} {salary.employeeId?.fullName}
        </h3>
        <p className="text-sm-custom text-dark-light mb-4">
          {t("Gross")}: {salary.currency} {salary.amount.toFixed(2)}
        </p>

        <div className="grid grid-cols-1 gap-4">
          <AppInput
            label={t("Deduction Amount")}
            type="number"
            step="0.01"
            min="0"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
          />
          <AppInput
            label={t("Reason")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("e.g. unexcused absence, late arrivals")}
          />
        </div>

        <p className="text-sm-custom text-dark-light mt-3">
          {t("Net after deduction")}: {salary.currency} {Math.max(0, salary.amount - Number(deductions || 0)).toFixed(2)}
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <AppButton type="button" label={t("Cancel")} icon="times" onClick={onClose} />
          <AppButton type="button" label={t("Save Deduction")} icon="check" disabled={isLoading} onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

const ListSalaries = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [month, setMonth] = useState(searchParams.get("month") || currentMonthName());
  const [year, setYear] = useState(searchParams.get("year") || new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [deductionTarget, setDeductionTarget] = useState(null);

  useEffect(() => {
    setSearchParams({ month, year: String(year) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setCurrentPage(1), [statusFilter, genderFilter, month, year]);

  const { data: statsData } = useGetSalaryStatsQuery({ month, year }, { refetchOnMountOrArgChange: true });

  const { data, isLoading, isFetching, error, refetch } = useGetSalariesQuery(
    {
      month,
      year,
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      status: statusFilter || undefined,
      gender: genderFilter || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [paySalariesBulk, { isLoading: isBulkPaying }] = usePaySalariesBulkMutation();

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

  const paidStat = (statsData?.stats || []).filter((s) => s._id.status === "Paid");
  const unpaidStat = (statsData?.stats || []).filter((s) => s._id.status === "Unpaid");
  const countStat = (arr) => arr.reduce((sum, s) => sum + s.count, 0);

  const stats = [
    { label: t("Paid This Month"), value: countStat(paidStat), icon: "check-circle", color: "green" },
    { label: t("Unpaid This Month"), value: countStat(unpaidStat), icon: "clock", color: "orange" },
  ];

  const handlePayOne = (row) => {
    navigate(`/finance/salaries/pay?employeeId=${row.employeeId?._id}&salaryIds=${row._id}`);
  };

  const handlePayAllUnpaidOnPage = async () => {
    const unpaidIds = rows.filter((r) => r.status === "Unpaid").map((r) => r._id);
    if (unpaidIds.length === 0) {
      return toast.error(t("No unpaid salaries on this page"));
    }
    try {
      await paySalariesBulk({ salaryIds: unpaidIds, paymentMethod: "Bank Transfer" }).unwrap();
      toast.success(t("{{count}} salary(ies) marked as paid", { count: unpaidIds.length }));
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("Error paying salaries"));
    }
  };

  const columns = [
    {
      header: t("Employee"),
      width: "20%",
      minWidth: "190px",
      render: (_, row) => <TruncatedCell maxChars={35}>{row.employeeId?.fullName}</TruncatedCell>,
    },
    {
      header: t("Gender"),
      width: "8%",
      minWidth: "90px",
      render: (_, row) => <AppBadge type="gender" value={row.employeeId?.gender} />,
    },
    {
      header: t("Phone Number"),
      width: "13%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.employeeId?.phoneNumber} />,
    },
    {
      header: t("Gross"),
      width: "10%",
      minWidth: "110px",
      render: (_, row) => `${row.currency} ${row.amount.toFixed(2)}`,
    },
    {
      header: t("Deduction"),
      width: "10%",
      minWidth: "110px",
      render: (_, row) =>
        row.deductions > 0 ? (
          <span className="text-red-600 font-medium">
            -{row.currency} {row.deductions.toFixed(2)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      header: t("Net Salary"),
      width: "11%",
      minWidth: "120px",
      render: (_, row) => (
        <span className="font-medium text-green-700">
          {row.currency} {row.netSalary.toFixed(2)}
        </span>
      ),
    },
    {
      header: t("Status"),
      width: "9%",
      minWidth: "100px",
      render: (_, row) => <AppBadge type="salaryStatus" value={row.status} />,
    },
    {
      header: t("Action"),
      width: "19%",
      minWidth: "220px",
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === "Unpaid" ? (
            <>
              <AppButton label={t("Pay")} icon="money-bill-wave" size="sm" onClick={() => handlePayOne(row)} />
              <AppButton
                label={t("Deduct")}
                icon="minus-circle"
                size="sm"
                onClick={() => setDeductionTarget(row)}
              />
            </>
          ) : (
            <AppButton
              label={t("View Receipt")}
              icon="receipt"
              size="sm"
              onClick={() => navigate(`/finance/salaries/receipt/${row._id}`)}
            />
          )}
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
        setStatusFilter("");
        setGenderFilter("");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      <SelectField
        label={t("Status")}
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder={t("All Status")}
        options={["Unpaid", "Paid"]}
        optionLabel={(s) => t(s)}
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

  const monthYearPicker = (
    <div className="flex items-center gap-2 ml-auto">
      <SelectField value={month} onChange={setMonth} options={MONTH_NAMES} optionLabel={(m) => t(m)} />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="w-24 p-2 border border-gray-300 rounded-md text-sm-custom"
      />
    </div>
  );

  const emptyState = (
    <EmptyState
      icon="calendar-times"
      title={t("No salaries for {{month}} {{year}} yet", { month: t(month), year })}
      message={t("Generate this month's salaries from the Generate Monthly Salaries screen.")}
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
    <AppButton onClick={() => navigate("/finance/employee/salaries")} label={t("Generate Salaries")} icon="magic" />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Monthly Salaries")} />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg-custom font-semibold">
            {t("Monthly Salaries")} — {t(month)} {year}
          </h2>
          {monthYearPicker}
        </div>

        <DataTableContainer
          title={t("Salaries")}
          subtitle={t("One row per employee for the selected month")}
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
            <p className="text-sm-custom text-dark-light mt-1 flex items-center flex-wrap gap-3">
              <span>
                <i className="fa fa-info-circle mr-2"></i>
                {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("employees")}
              </span>
              {rows.some((r) => r.status === "Unpaid") && (
                <button
                  type="button"
                  onClick={handlePayAllUnpaidOnPage}
                  disabled={isBulkPaying}
                  className="text-primary underline"
                >
                  {t("Pay All Unpaid (this page)")}
                </button>
              )}
            </p>
          )}
          className="salaries-table-container"
          showSearch={true}
          showStats={true}
          showPagination={true}
        />
      </div>

      {deductionTarget && (
        <DeductionModal
          salary={deductionTarget}
          onClose={() => setDeductionTarget(null)}
          onSaved={() => {
            setDeductionTarget(null);
            refetch();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default ListSalaries;