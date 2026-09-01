// src/components/finance/fees/PaymentFees.jsx
//
// Step 2 of the fees flow: finance physically collects cash / bank
// transfer / online payment from the parent, then types it in here.
// Submitting turns the selected Fees installment(s) into a real "Paid"
// transaction in the database (usePayFeesMutation -> PATCH /fees/pay),
// then shows a printable receipt (FeeReceipt).
//
// Three states, driven by the URL query string:
//  1. No ?studentId= at all        -> full ListStudents-style picker
//     (paginated, searchable, stats) to choose which student to collect
//     payment from.
//  2. ?studentId=...[&feeIds=a,b]  -> installment picker + payment panel
//     (Cash shows tendered/change inputs; Bank Transfer/Online shows a
//     reference-number field instead). feeIds pre-selects specific
//     installments when arriving from PaidFeesOrDueList.
//  3. After a successful payFees call -> printable receipt.
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetFeesByStudentQuery,
  useGetPendingDuesQuery,
  usePayFeesMutation,
} from "../../../redux/api/feesApi";

import AdminLayout from "../../layout/AdminLayout";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import AppInfoBox from "../../layout/AppInfoBox";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import FilterDropdown from "../../GUI/FilterDropdown";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import AppBadge from "../../GUI/AppBadge";
import PhoneLink from "../../GUI/PhoneLink";

import FeeReceipt from "./FeeReceipt";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online"];
const FEE_TYPES = ["Admission", "Tuition", "Exam", "Transport", "Hostel"];

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() : "";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const formatTotals = (totals = []) =>
  totals.map((t) => `${t.currency} ${Number(t.amount).toFixed(2)}`).join(", ");

const todayISO = () => new Date().toISOString().split("T")[0];

// ============================================================
// PART A — Student picker (no ?studentId= yet). Exactly the
// ListStudents/StudentEnrollmentUnPaidList theme: DataTableContainer
// with pagination, search, filters and stats, so it stays usable even
// with thousands of students.
// ============================================================
const StudentPicker = ({ onSelect }) => {
  const { t } = useTranslation();

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

  const { data: countData } = useGetPendingDuesQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetPendingDuesQuery(
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

  const rows = data?.dues || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [
    {
      label: t("Students with Pending Dues"),
      value: countData?.total ?? 0,
      icon: "user-clock",
      color: "orange",
    },
  ];

  const columns = [
    {
      header: t("Student Name"),
      width: "24%",
      minWidth: "200px",
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
      header: t("Fee Types"),
      width: "16%",
      minWidth: "150px",
      render: (_, row) => (row.feeTypes || []).map((ft) => t(ft)).join(", "),
    },
    {
      header: t("Pending Installments"),
      width: "12%",
      minWidth: "120px",
      render: (_, row) => row.pendingCount,
    },
    {
      header: t("Total Due"),
      width: "14%",
      minWidth: "140px",
      render: (_, row) => (
        <span className="font-medium text-red-600">{formatTotals(row.totals)}</span>
      ),
    },
    {
      header: t("Action"),
      width: "12%",
      minWidth: "130px",
      render: (_, row) => (
        <AppButton
          label={t("Select")}
          icon="hand-pointer"
          size="sm"
          onClick={() => onSelect(row.student?._id)}
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
      icon="check-circle"
      title={searchTerm || genderFilter ? t("No records found matching your search") : t("No pending dues")}
      message={t("Every enrolled student is fully paid up right now.")}
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
      title={t("Choose a Student")}
      subtitle={t("Pick which student's fee installments you're collecting payment for")}
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
      className="payment-fees-picker-container bg-surface-50 shadow-soft rounded-xl"
      showSearch={true}
      showStats={true}
      showPagination={true}
    />
  );
};

// ============================================================
// PART B — Main component
// ============================================================
const PaymentFees = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentIdFromUrl = searchParams.get("studentId") || "";
  const preselectFeeIds = (searchParams.get("feeIds") || searchParams.get("feeId") || "")
    .split(",")
    .filter(Boolean);

  const [selectedIds, setSelectedIds] = useState([]);
  const [feeTypeFilter, setFeeTypeFilter] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentReference, setPaymentReference] = useState("");
  const [tenderedByCurrency, setTenderedByCurrency] = useState({});
  const [receiptData, setReceiptData] = useState(null); // set after a successful payment

  const {
    data: feesData,
    isLoading: feesLoading,
    isFetching: feesFetching,
    refetch: refetchFees,
  } = useGetFeesByStudentQuery(studentIdFromUrl, { skip: !studentIdFromUrl });

  const [payFees, { isLoading: isPaying }] = usePayFeesMutation();

  const allFees = feesData?.fees || [];
  const payableFees = useMemo(
    () => allFees.filter((f) => f.status === "Pending" || f.status === "Overdue"),
    [allFees]
  );
  const filteredFees = feeTypeFilter ? payableFees.filter((f) => f.feeType === feeTypeFilter) : payableFees;
  const studentInfo = allFees[0]?.student || null;

  useEffect(() => {
    if (preselectFeeIds.length && payableFees.length) {
      setSelectedIds((prev) => {
        const valid = preselectFeeIds.filter((id) => payableFees.some((f) => f._id === id));
        return Array.from(new Set([...prev, ...valid]));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectFeeIds.join(","), payableFees.length]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredFees.map((f) => f._id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const selectedFeeLines = useMemo(
    () => payableFees.filter((f) => selectedIds.includes(f._id)),
    [payableFees, selectedIds]
  );

  const selectedTotals = useMemo(() => {
    const totals = {};
    selectedFeeLines.forEach((f) => {
      totals[f.currency] = (totals[f.currency] || 0) + f.amount;
    });
    return totals;
  }, [selectedFeeLines]);

  const selectedCurrencies = Object.keys(selectedTotals);

  const selectedTotalsLabel =
    selectedCurrencies.length === 0
      ? t("None selected")
      : selectedCurrencies.map((c) => `${c} ${selectedTotals[c].toFixed(2)}`).join(", ");

  // Only keep tendered inputs for currencies that are actually selected.
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
    { label: t("Payable Installments"), value: payableFees.length, icon: "list-ol", color: "orange" },
    { label: t("Selected For Payment"), value: selectedIds.length, icon: "check-square", color: "green" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      return toast.error(t("Please select at least one installment to collect payment for"));
    }
    if (!paymentMethod) {
      return toast.error(t("Please choose a payment method"));
    }

    let amountTendered = null;
    let changeReturned = null;

    if (paymentMethod === "Cash") {
      for (const c of selectedCurrencies) {
        const tendered = Number(tenderedByCurrency[c]);
        if (isNaN(tendered) || tendered < selectedTotals[c]) {
          return toast.error(
            t("Cash received for {{currency}} must be at least {{amount}}", {
              currency: c,
              amount: selectedTotals[c].toFixed(2),
            })
          );
        }
      }
      // Fees model stores one number for these fields; only meaningful
      // when a single currency was collected in this batch — still
      // stored as an audit note either way, the receipt itself always
      // does the real per-currency math from what's on screen.
      if (selectedCurrencies.length === 1) {
        const c = selectedCurrencies[0];
        amountTendered = Number(tenderedByCurrency[c]);
        changeReturned = changeByCurrency[c];
      }
    }

    try {
      const result = await payFees({
        feeIds: selectedIds,
        paymentMethod,
        paymentDate,
        studentId: studentIdFromUrl,
        ...(paymentMethod !== "Cash" && paymentReference ? { paymentReference } : {}),
        ...(amountTendered != null ? { amountTendered } : {}),
        ...(changeReturned != null ? { changeReturned } : {}),
      }).unwrap();

      setReceiptData({
        receiptNo: result?.receiptNo,
        lines: selectedFeeLines,
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

  // ----- PART 1: no student chosen -----
  if (!studentIdFromUrl) {
    return (
      <AdminLayout>
        <MetaData title={t("Collect Fee Payment")} />
        <div className="max-w-6xl mx-auto space-y-6">
          <AppPageHeader
            title={t("Collect Fee Payment")}
            subtitle={t("Choose a student to see their pending installments")}
            backUrl="/admin/finance/fees/unpaid"
          />
          <StudentPicker onSelect={(studentId) => setSearchParams({ studentId })} />
        </div>
      </AdminLayout>
    );
  }

  // ----- PART 3: receipt after successful payment -----
  if (receiptData) {
    return (
      <AdminLayout>
        <MetaData title={t("Payment Receipt")} />
        <FeeReceipt
          receiptNo={receiptData.receiptNo}
          student={studentInfo}
          lines={receiptData.lines}
          paymentMethod={paymentMethod}
          paymentDate={paymentDate}
          paymentReference={paymentMethod !== "Cash" ? paymentReference : null}
          tendered={receiptData.tendered}
          change={receiptData.change}
          totals={receiptData.totals}
          onNewPayment={resetForNewPayment}
          onDone={() => navigate("/admin/finance/fees/paid")}
        />
      </AdminLayout>
    );
  }

  if (feesLoading) return <Loader />;

  // ----- PART 2: installment picker + payment panel -----
  const columns = [
    {
      header: "",
      width: "6%",
      minWidth: "50px",
      render: (_, row) => (
        <input type="checkbox" checked={selectedIds.includes(row._id)} onChange={() => toggleSelected(row._id)} />
      ),
    },
    { header: t("Fee Type"), width: "16%", minWidth: "120px", render: (_, row) => t(row.feeType) },
    {
      header: t("Installment"),
      width: "12%",
      minWidth: "110px",
      render: (_, row) => `${row.installmentNumber}/${row.totalInstallments}`,
    },
    {
      header: t("Amount"),
      width: "14%",
      minWidth: "120px",
      render: (_, row) => (
        <span className="font-medium">
          {row.currency} {Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    { header: t("Due Date"), width: "14%", minWidth: "120px", render: (_, row) => formatDate(row.dueDate) },
    {
      header: t("Status"),
      width: "12%",
      minWidth: "110px",
      render: (_, row) => <AppBadge type="feeStatus" value={row.status} />,
    },
  ];

  const filters = (
    <FilterDropdown
      onReset={() => {
        setFeeTypeFilter("");
        setSelectedIds([]);
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Fee Type")}</label>
        <select
          value={feeTypeFilter}
          onChange={(e) => setFeeTypeFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("All Fee Types")}</option>
          {FEE_TYPES.map((ft) => (
            <option key={ft} value={ft}>
              {t(ft)}
            </option>
          ))}
        </select>
      </div>
    </FilterDropdown>
  );

  const emptyState = (
    <EmptyState
      icon="check-circle"
      title={t("Nothing pending for this student")}
      message={t("All of this student's fee installments are already paid.")}
    />
  );

  const refreshButton = (
    <AppButton
      onClick={() => {
        refetchFees();
        toast.success(t("Refreshed"));
      }}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={feesFetching}
      className="ml-2"
    />
  );

  return (
    <AdminLayout>
      <MetaData title={t("Collect Fee Payment")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Collect Fee Payment")}
          subtitle={t("Select the installment(s) being paid now, then confirm below")}
          backUrl="/admin/finance/fees/unpaid"
        />

        {studentInfo && (
          <AppInfoBox icon="fa-user-graduate">
            <strong>{getFullName(studentInfo)}</strong>
            {studentInfo.phoneNumber ? ` — ${studentInfo.phoneNumber}` : ""}
            {studentInfo.email ? ` — ${studentInfo.email}` : ""}
          </AppInfoBox>
        )}

        <DataTableContainer
          title={t("Fee Installments")}
          subtitle={t("Tick every installment the parent is paying for right now")}
          data={filteredFees}
          columns={columns}
          isLoading={feesLoading}
          isFetching={feesFetching}
          onRefresh={refetchFees}
          refreshButton={refreshButton}
          emptyState={emptyState}
          filters={filters}
          stats={stats}
          renderHeaderInfo={() => (
            <p className="text-sm-custom text-dark-light mt-1">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Amount selected")}: <span className="font-medium">{selectedTotalsLabel}</span>
              {filteredFees.length > 0 && (
                <button type="button" onClick={toggleSelectAll} className="ml-4 text-primary underline">
                  {t("Select / Unselect All")}
                </button>
              )}
            </p>
          )}
          className="payment-fees-table-container bg-surface-50 shadow-soft rounded-xl"
          showSearch={false}
          showStats={true}
          showPagination={false}
        />

        {filteredFees.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-surface-50 shadow-soft rounded-xl p-6 space-y-4">
            <h3 className="text-base-custom font-semibold">{t("Payment Details")}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("Payment Method")}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {t(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("Payment Date")}</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("Amount Due")}</label>
                <div className="p-2 border border-dashed border-gray-300 rounded-md text-sm-custom">
                  {selectedTotalsLabel}
                </div>
              </div>
            </div>

            {paymentMethod === "Cash" && selectedCurrencies.length > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <p className="text-sm-custom font-medium text-gray-700">
                  {t("Cash received from parent (per currency)")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCurrencies.map((c) => (
                    <div key={c} className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t("Amount Received")} ({c})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tenderedByCurrency[c] ?? ""}
                          onChange={(e) =>
                            setTenderedByCurrency((prev) => ({ ...prev, [c]: e.target.value }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder={selectedTotals[c].toFixed(2)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t("Change to Return")}</label>
                        <div
                          className={`p-2 border rounded-md text-sm-custom font-medium ${
                            changeByCurrency[c] > 0
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : "border-gray-200"
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
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Reference / Transaction No.")} <span className="text-gray-400">({t("optional")})</span>
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder={t("e.g. bank transfer slip no. or online txn id")}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <AppButton type="button" text={t("Cancel")} onClick={() => navigate("/admin/finance/fees/unpaid")} />
              <AppButton
                type="submit"
                label={t("Confirm Payment")}
                icon="check"
                disabled={isPaying || selectedIds.length === 0}
              />
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentFees;
