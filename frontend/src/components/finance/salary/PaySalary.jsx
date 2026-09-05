// src/components/finance/salary/PaySalary.jsx
//
// Pay a teacher/employee's salary — mirrors the Fees module's
// PaymentFees screen: a paginated picker when no employee is chosen
// yet, then a table of that employee's unpaid month(s) to select, a
// POS-style payment panel (Cash shows tendered/change, Bank Transfer/
// Online shows an optional reference field), and finally a printable
// SalaryReceipt.
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminLayout from "../../layout/AdminLayout";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import AppInfoBox from "../../layout/AppInfoBox";
import AppCard from "../../GUI/AppCard";
import AppInput from "../../GUI/AppInput";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import AppBadge from "../../GUI/AppBadge";
import PhoneLink from "../../GUI/PhoneLink";
import SelectField from "./SelectField";

import SalaryReceipt from "./SalaryReceipt";
import {
  useGetSalariesByEmployeeQuery,
  useGetUnpaidSalariesByEmployeeQuery,
  usePaySalariesBulkMutation,
} from "../../../redux/api/salaryApi";
import { PAYMENT_METHODS } from "../../../constants/salaryConstants";

const formatTotals = (totals = []) => totals.map((t) => `${t.currency} ${Number(t.amount).toFixed(2)}`).join(", ");

const todayISO = () => new Date().toISOString().split("T")[0];

// ============================================================
// PART A — Employee picker (no ?employeeId= yet)
// ============================================================
const EmployeePicker = ({ onSelect }) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: countData } = useGetUnpaidSalariesByEmployeeQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetUnpaidSalariesByEmployeeQuery(
    { page: currentPage, limit, keyword: searchTerm || undefined },
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

  const stats = [{ label: t("Employees With Unpaid Salary"), value: countData?.total ?? 0, icon: "user-clock", color: "orange" }];

  const columns = [
    {
      header: t("Employee"),
      width: "24%",
      minWidth: "200px",
      render: (_, row) => <TruncatedCell maxChars={35}>{row.employee?.fullName}</TruncatedCell>,
    },
    {
      header: t("Phone Number"),
      width: "16%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.employee?.phoneNumber} />,
    },
    { header: t("Months Unpaid"), width: "18%", minWidth: "160px", render: (_, row) => row.months.join(", ") },
    { header: t("Unpaid Count"), width: "14%", minWidth: "120px", render: (_, row) => row.unpaidCount },
    {
      header: t("Total Owed"),
      width: "16%",
      minWidth: "140px",
      render: (_, row) => <span className="font-medium text-red-600">{formatTotals(row.totals)}</span>,
    },
    {
      header: t("Action"),
      width: "12%",
      minWidth: "130px",
      render: (_, row) => (
        <AppButton label={t("Select")} icon="hand-pointer" size="sm" onClick={() => onSelect(row.employee?._id)} />
      ),
    },
  ];

  const emptyState = (
    <EmptyState
      icon="check-circle"
      title={searchTerm ? t("No records found matching your search") : t("No unpaid salaries")}
      message={t("Every generated salary has already been paid.")}
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
    <DataTableContainer
      title={t("Choose an Employee")}
      subtitle={t("Pick which employee's salary you're paying")}
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
      stats={stats}
      showSearch={true}
      showStats={true}
      showPagination={true}
    />
  );
};

// ============================================================
// PART B — Main component
// ============================================================
const PaySalary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const employeeIdFromUrl = searchParams.get("employeeId") || "";
  const preselectSalaryIds = (searchParams.get("salaryIds") || "").split(",").filter(Boolean);

  const [selectedIds, setSelectedIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentReference, setPaymentReference] = useState("");
  const [tenderedByCurrency, setTenderedByCurrency] = useState({});
  const [receiptData, setReceiptData] = useState(null);

  const {
    data: salariesData,
    isLoading: salariesLoading,
    isFetching: salariesFetching,
    refetch: refetchSalaries,
  } = useGetSalariesByEmployeeQuery(employeeIdFromUrl, { skip: !employeeIdFromUrl });

  const [paySalariesBulk, { isLoading: isPaying }] = usePaySalariesBulkMutation();

  const allSalaries = salariesData?.salaries || [];
  const payableSalaries = useMemo(() => allSalaries.filter((s) => s.status === "Unpaid"), [allSalaries]);
  const employeeInfo = allSalaries[0]?.employeeId || null;

  useEffect(() => {
    if (preselectSalaryIds.length && payableSalaries.length) {
      setSelectedIds((prev) => {
        const valid = preselectSalaryIds.filter((id) => payableSalaries.some((s) => s._id === id));
        return Array.from(new Set([...prev, ...valid]));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectSalaryIds.join(","), payableSalaries.length]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const allIds = payableSalaries.map((s) => s._id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const selectedLines = useMemo(() => payableSalaries.filter((s) => selectedIds.includes(s._id)), [payableSalaries, selectedIds]);

  const selectedTotals = useMemo(() => {
    const totals = {};
    selectedLines.forEach((s) => {
      totals[s.currency] = (totals[s.currency] || 0) + s.netSalary;
    });
    return totals;
  }, [selectedLines]);

  const selectedCurrencies = Object.keys(selectedTotals);
  const selectedTotalsLabel =
    selectedCurrencies.length === 0 ? t("None selected") : selectedCurrencies.map((c) => `${c} ${selectedTotals[c].toFixed(2)}`).join(", ");

  useEffect(() => {
    setTenderedByCurrency((prev) => {
      const next = {};
      selectedCurrencies.forEach((c) => {
        next[c] = prev[c] ?? "";
      });
      return next;
    });
  }, [selectedCurrencies.join(",")]);

  const changeByCurrency = useMemo(() => {
    const result = {};
    selectedCurrencies.forEach((c) => {
      const tendered = Number(tenderedByCurrency[c]);
      if (!isNaN(tendered)) result[c] = Math.max(0, tendered - selectedTotals[c]);
    });
    return result;
  }, [tenderedByCurrency, selectedTotals, selectedCurrencies]);

  const stats = [
    { label: t("Unpaid Months"), value: payableSalaries.length, icon: "list-ol", color: "orange" },
    { label: t("Selected For Payment"), value: selectedIds.length, icon: "check-square", color: "green" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return toast.error(t("Please select at least one month to pay"));
    if (!paymentMethod) return toast.error(t("Please choose a payment method"));

    if (paymentMethod === "Cash") {
      for (const c of selectedCurrencies) {
        const tendered = Number(tenderedByCurrency[c]);
        if (isNaN(tendered) || tendered < selectedTotals[c]) {
          return toast.error(
            t("Cash received for {{currency}} must be at least {{amount}}", { currency: c, amount: selectedTotals[c].toFixed(2) })
          );
        }
      }
    }

    try {
      const result = await paySalariesBulk({
        salaryIds: selectedIds,
        paymentMethod,
        paymentDate,
        ...(paymentMethod !== "Cash" && paymentReference ? { paymentReference } : {}),
      }).unwrap();

      setReceiptData({
        receiptNo: result?.salaries?.[0]?.receiptNo,
        lines: selectedLines,
        totals: selectedTotals,
        tendered:
          paymentMethod === "Cash"
            ? Object.fromEntries(selectedCurrencies.map((c) => [c, Number(tenderedByCurrency[c])]))
            : {},
        change: paymentMethod === "Cash" ? changeByCurrency : {},
      });
    } catch (err) {
      toast.error(err?.data?.message || t("Error recording payment"));
    }
  };

  const resetForNewPayment = () => {
    setReceiptData(null);
    setSelectedIds([]);
    setTenderedByCurrency({});
    setPaymentReference("");
    setSearchParams({});
  };

  if (!employeeIdFromUrl) {
    return (
      <AdminLayout>
        <MetaData title={t("Pay Salary")} />
        <div className="max-w-6xl mx-auto">
          <AppPageHeader
            title={t("Pay Salary")}
            subtitle={t("Choose an employee to see their unpaid month(s)")}
            backUrl="/finance/employees/salaries"
          />
          <EmployeePicker onSelect={(employeeId) => setSearchParams({ employeeId })} />
        </div>
      </AdminLayout>
    );
  }

  if (receiptData) {
    return (
      <AdminLayout>
        <MetaData title={t("Salary Receipt")} />
        <SalaryReceipt
          receiptNo={receiptData.receiptNo}
          employee={employeeInfo}
          lines={receiptData.lines}
          paymentMethod={paymentMethod}
          paymentDate={paymentDate}
          paymentReference={paymentMethod !== "Cash" ? paymentReference : null}
          tendered={receiptData.tendered}
          change={receiptData.change}
          totals={receiptData.totals}
          onNewPayment={resetForNewPayment}
          onDone={() => navigate("/finance/employees/salaries")}
        />
      </AdminLayout>
    );
  }

  if (salariesLoading) return <Loader />;

  const columns = [
    {
      header: "",
      width: "6%",
      minWidth: "50px",
      render: (_, row) => (
        <input type="checkbox" checked={selectedIds.includes(row._id)} onChange={() => toggleSelected(row._id)} />
      ),
    },
    { header: t("Month"), width: "16%", minWidth: "130px", render: (_, row) => `${t(row.month)} ${row.year}` },
    { header: t("Gross"), width: "14%", minWidth: "120px", render: (_, row) => `${row.currency} ${row.amount.toFixed(2)}` },
    {
      header: t("Deduction"),
      width: "14%",
      minWidth: "120px",
      render: (_, row) => (row.deductions > 0 ? `-${row.currency} ${row.deductions.toFixed(2)}` : "-"),
    },
    {
      header: t("Net"),
      width: "14%",
      minWidth: "120px",
      render: (_, row) => <span className="font-medium">{row.currency} {row.netSalary.toFixed(2)}</span>,
    },
    { header: t("Status"), width: "12%", minWidth: "110px", render: (_, row) => <AppBadge type="salaryStatus" value={row.status} /> },
  ];

  const emptyState = (
    <EmptyState icon="check-circle" title={t("Nothing unpaid for this employee")} message={t("All of this employee's salaries are already paid.")} />
  );

  const refreshButton = (
    <AppButton
      onClick={() => {
        refetchSalaries();
        toast.success(t("Refreshed"));
      }}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={salariesFetching}
      className="ml-2"
    />
  );

  return (
    <AdminLayout>
      <MetaData title={t("Pay Salary")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Pay Salary")}
          subtitle={t("Select the month(s) being paid now, then confirm below")}
          backUrl="/finance/employees/salaries"
        />

        {employeeInfo && (
          <AppInfoBox icon="fa-user-tie">
            <strong>{employeeInfo.fullName}</strong>
            {employeeInfo.phoneNumber ? ` — ${employeeInfo.phoneNumber}` : ""}
            {employeeInfo.email ? ` — ${employeeInfo.email}` : ""}
          </AppInfoBox>
        )}

        <DataTableContainer
          title={t("Unpaid Months")}
          subtitle={t("Tick every month being paid right now")}
          data={payableSalaries}
          columns={columns}
          isLoading={salariesLoading}
          isFetching={salariesFetching}
          onRefresh={refetchSalaries}
          refreshButton={refreshButton}
          emptyState={emptyState}
          stats={stats}
          renderHeaderInfo={() => (
            <p className="text-sm-custom text-dark-light mt-1">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Amount selected")}: <span className="font-medium">{selectedTotalsLabel}</span>
              {payableSalaries.length > 0 && (
                <button type="button" onClick={toggleSelectAll} className="ml-4 text-primary underline">
                  {t("Select / Unselect All")}
                </button>
              )}
            </p>
          )}
          showSearch={false}
          showStats={true}
          showPagination={false}
        />

        {payableSalaries.length > 0 && (
          <form onSubmit={handleSubmit}>
            <AppCard
              title={t("Payment Details")}
              icon="fa-money-bill-wave"
              footer={
                <div className="flex justify-end gap-2">
                  <AppButton backUrl="/finance/employees/salaries" />
                  <AppButton
                    type="submit"
                    label={t("Confirm Payment")}
                    loadingLabel={t("Processing...")}
                    isLoading={isPaying}
                    icon="fa-check"
                    disabled={selectedIds.length === 0}
                  />
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label={t("Payment Method")}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={PAYMENT_METHODS}
                  optionLabel={(m) => t(m)}
                />
                <AppInput
                  label={t("Payment Date")}
                  type="date"
                  name="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
                <AppInput label={t("Amount Due")} value={selectedTotalsLabel} readOnly />
              </div>

              {paymentMethod === "Cash" && selectedCurrencies.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                  <p className="text-sm-custom font-medium text-gray-700">{t("Cash handed to employee (per currency)")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCurrencies.map((c) => (
                      <div key={c} className="grid grid-cols-2 gap-3 items-end">
                        <AppInput
                          label={`${t("Amount Given")} (${c})`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={tenderedByCurrency[c] ?? ""}
                          onChange={(e) => setTenderedByCurrency((prev) => ({ ...prev, [c]: e.target.value }))}
                          placeholder={selectedTotals[c].toFixed(2)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t("Change to Return")}</label>
                          <div
                            className={`p-2 border rounded-md text-sm-custom font-medium ${
                              changeByCurrency[c] > 0 ? "border-amber-300 bg-amber-50 text-amber-700" : "border-gray-200"
                            }`}
                          >
                            {c} {(changeByCurrency[c] ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod !== "Cash" && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <AppInput
                    label={t("Reference / Transaction No.")}
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder={t("e.g. bank transfer slip no. or online txn id")}
                    helperText={t("Optional")}
                  />
                </div>
              )}
            </AppCard>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaySalary;
