// src/components/finance/salary/TeacherSalaryLookup.jsx
//
// "Detect/find/deduct a specific teacher's salary for some reason" —
// search for one employee and see every month's salary record in one
// place, regardless of paid/unpaid status. From here you can apply a
// deduction (while Unpaid), pay a specific month, or view an existing
// receipt (once Paid) — without needing to know which monthly list it's
// sitting in.
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetUserByTypeQuery } from "../../../redux/api/authApi";
import { useGetSalariesByEmployeeQuery, useApplySalaryDeductionMutation } from "../../../redux/api/salaryApi";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import AppInfoBox from "../../layout/AppInfoBox";
import Loader from "../../layout/Loader";
import AppCard from "../../GUI/AppCard";
import AppInput from "../../GUI/AppInput";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import EmptyState from "../../GUI/EmptyState";
import AppBadge from "../../GUI/AppBadge";

const DeductionInlineForm = ({ salary, onSaved, onCancel }) => {
  const { t } = useTranslation();
  const [deductions, setDeductions] = useState(salary.deductions || 0);
  const [reason, setReason] = useState(salary.deductionReason || "");
  const [applyDeduction, { isLoading }] = useApplySalaryDeductionMutation();

  const handleSave = async () => {
    try {
      await applyDeduction({ id: salary._id, deductions: Number(deductions), reason }).unwrap();
      toast.success(t("Deduction applied"));
      onSaved();
    } catch (err) {
      toast.error(err?.data?.message || t("Error applying deduction"));
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 border border-gray-200 rounded-md bg-surface-50">
      <input
        type="number"
        step="0.01"
        min="0"
        value={deductions}
        onChange={(e) => setDeductions(e.target.value)}
        className="p-1 border border-gray-300 rounded text-xs"
        placeholder={t("Amount")}
      />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="p-1 border border-gray-300 rounded text-xs"
        placeholder={t("Reason")}
      />
      <div className="flex gap-1">
        <AppButton size="sm" label={t("Cancel")} icon="times" onClick={onCancel} />
        <AppButton size="sm" label={t("Save")} icon="check" disabled={isLoading} onClick={handleSave} />
      </div>
    </div>
  );
};

const TeacherSalaryLookup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { data: employeesData, isFetching: employeesLoading } = useGetUserByTypeQuery(
    { type: "teacher", status: "active", limit: 0, keyword },
    { skip: !!employeeId }
  );

  const { data, isLoading, refetch } = useGetSalariesByEmployeeQuery(employeeId, { skip: !employeeId });

  const employeeOptions = (employeesData?.users || []).map((u) => ({
    value: u._id,
    label: u.fullName || u.email,
    subtitle: u.email,
  }));

  const rows = data?.salaries || [];
  const employeeInfo = rows[0]?.employeeId || null;

  const columns = [
    { header: t("Month"), width: "16%", minWidth: "130px", render: (_, row) => `${t(row.month)} ${row.year}` },
    { header: t("Gross"), width: "14%", minWidth: "120px", render: (_, row) => `${row.currency} ${row.amount.toFixed(2)}` },
    {
      header: t("Deduction"),
      width: "20%",
      minWidth: "220px",
      render: (_, row) =>
        editingId === row._id ? (
          <DeductionInlineForm salary={row} onCancel={() => setEditingId(null)} onSaved={() => { setEditingId(null); refetch(); }} />
        ) : row.deductions > 0 ? (
          <span className="text-red-600">
            -{row.currency} {row.deductions.toFixed(2)} {row.deductionReason ? `(${row.deductionReason})` : ""}
          </span>
        ) : (
          "-"
        ),
    },
    {
      header: t("Net"),
      width: "12%",
      minWidth: "110px",
      render: (_, row) => <span className="font-medium">{row.currency} {row.netSalary.toFixed(2)}</span>,
    },
    { header: t("Status"), width: "10%", minWidth: "100px", render: (_, row) => <AppBadge type="salaryStatus" value={row.status} /> },
    {
      header: t("Action"),
      width: "28%",
      minWidth: "220px",
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === "Unpaid" ? (
            <>
              <AppButton
                label={t("Pay")}
                icon="money-bill-wave"
                size="sm"
                onClick={() => navigate(`/finance/salaries/pay?employeeId=${employeeId}&salaryIds=${row._id}`)}
              />
              {editingId !== row._id && (
                <AppButton label={t("Deduct")} icon="minus-circle" size="sm" onClick={() => setEditingId(row._id)} />
              )}
            </>
          ) : (
            <AppButton label={t("View Receipt")} icon="receipt" size="sm" onClick={() => navigate(`/finance/salaries/receipt/${row._id}`)} />
          )}
        </div>
      ),
    },
  ];

  const emptyState = <EmptyState icon="folder-open" title={t("No salary records")} message={t("This employee has no generated salary records yet.")} />;

  return (
    <AdminLayout>
      <MetaData title={t("Find Teacher Salary")} />

      {/* Same container class in BOTH states (search screen and results
          screen) — max-w-6xl mx-auto space-y-6, matching every other
          admin/finance page. Previously the search screen used max-w-2xl
          and the results screen used max-w-6xl, which made the page jump
          width and left a lot of unused space on the sides. */}
      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Find Teacher Salary")}
          subtitle={t("Search a teacher to see and manage their full salary history")}
          backUrl="/finance/employees/salaries"
        />

        {!employeeId ? (
          <AppCard title={t("Search")} icon="fa-search">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label={t("Teacher")}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("Search teacher by name or email...")}
              />
            </div>
            <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-md divide-y divide-gray-100 mt-3">
              {employeesLoading && <p className="p-3 text-sm-custom text-dark-light">{t("Loading...")}</p>}
              {!employeesLoading && employeeOptions.length === 0 && (
                <p className="p-3 text-sm-custom text-dark-light">{t("No teachers found")}</p>
              )}
              {employeeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmployeeId(opt.value)}
                  className="w-full text-left p-3 hover:bg-surface-100 transition-colors flex items-center justify-between gap-3"
                >
                  <span className="text-sm-custom font-medium">{opt.label}</span>
                  <span className="text-xs text-dark-light">{opt.subtitle}</span>
                </button>
              ))}
            </div>
          </AppCard>
        ) : isLoading ? (
          <Loader />
        ) : (
          <>
            {employeeInfo && (
              <AppInfoBox icon="fa-user-tie">
                <strong>{employeeInfo.fullName}</strong>
                {employeeInfo.email ? ` — ${employeeInfo.email}` : ""}
              </AppInfoBox>
            )}

            <DataTableContainer
              title={t("Salary History")}
              data={rows}
              columns={columns}
              isLoading={isLoading}
              onRefresh={refetch}
              refreshButton={<AppButton onClick={refetch} text={t("Refresh")} icon="sync-alt" className="ml-2" />}
              emptyState={emptyState}
              showSearch={false}
              showStats={false}
              showPagination={false}
            />

            <AppButton text={t("Search Another Teacher")} icon="search" onClick={() => setEmployeeId("")} />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherSalaryLookup;