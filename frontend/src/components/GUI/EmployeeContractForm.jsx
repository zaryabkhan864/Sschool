// src/components/GUI/EmployeeContractForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import AppCard from "./AppCard";
import AppInput from "./AppInput";
import AppButton from "./AppButton";
import StatusSelect from "./StatusSelect";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppInfoBox from "../layout/AppInfoBox";

const STAFF_ROLES = [
  "student",
  "teacher",
  "coordinator",
  "principle",
  "vice_principal",
  "finance",
  "admin",
  "registrar",
  "manager",
  "assistant",
  "librarian",
  "counselor",
  "it_support",
  "security",
  "maintenance",
  "superadmin",
  "parent",
  "receptionist",
  "transport_manager",
  "driver",
  "cleaner",
];

// ✅ Payment Type options — MUST stay in sync with PAYMENT_TYPES in
//    backend/models/salaries.js
const PAYMENT_TYPE_OPTIONS = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly / Annual" },
];

// ✅ Currency options — MUST stay in sync with CURRENCIES in
//    backend/models/salaries.js
const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "TRY", label: "TRY - Turkish TL" },
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "AED", label: "AED - UAE Dirham (Dubai)" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
];

const EmployeeContractForm = ({
  isEditMode,
  contract, // entire contract state object
  onChange, // (field, value) => void
  onAllowanceChange, // (field, value) => void
  onSubmit,
  isSubmitting, // boolean – creating or updating

  // Employee dropdown
  employeeSearch,
  onEmployeeSearch,
  employeeOptions,
  employeesLoading,
  preselectedEmployeeName,
  employeeReadOnly, // true when employeeIdFromUrl or isEditMode
  employeeValue, // the id

  // Role dropdown
  roleOptions,
  roleValue,
  onRoleChange,

  // Campus dropdown
  campusSearch,
  onCampusSearch,
  campusOptions,
  campusesLoading,
  campusValue,
  onCampusChange,

  // Academic Year dropdown
  academicYearSearch,
  onAcademicYearSearch,
  academicYearOptions,
  academicYearsLoading,
  academicYearValue,
  onAcademicYearChange,
  academicYearDisabled,

  // Salary - Payment Type & Currency
  paymentType,
  onPaymentTypeChange,
  currency,
  onCurrencyChange,
}) => {
  const { t } = useTranslation();

  const {
    employee,
    role,
    campus,
    academicYear,
    startDate,
    endDate,
    baseSalary,
    allowances,
    annualLeaveAllowance,
    status,
    note,
  } = contract;

  // Allow local role options if not passed
  const finalRoleOptions = roleOptions || STAFF_ROLES.map((r) => ({
    value: r,
    label: t(r.charAt(0).toUpperCase() + r.slice(1)),
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AppCard
        title={t("Contract Information")}
        icon="fa-file-contract"
        footer={
          <div className="flex justify-end gap-3">
            <AppButton backUrl="/admin/employee-contracts" />
            <AppButton
              type="submit"
              label={isEditMode ? t("Update Contract") : t("Create Contract")}
              loadingLabel={t("Saving...")}
              isLoading={isSubmitting}
              icon="fa-save"
            />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee field */}
          <div className="md:col-span-2">
            {employeeReadOnly ? (
              <div>
                <label className="block text-xs-custom font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                  {t("Employee")} <span className="text-red-500">*</span>
                </label>
                <AppInput value={preselectedEmployeeName || employeeValue} disabled />
                <p className="text-xs-custom text-ink-400 mt-1">{t("Employee is pre‑selected")}</p>
              </div>
            ) : (
              <SearchableDropdown
                label={t("Employee")}
                value={employeeValue}
                options={employeeOptions}
                onChange={(val) => onChange("employee", val)}
                onSearch={onEmployeeSearch}
                placeholder={t("Select Staff Member")}
                isLoading={employeesLoading}
                required
              />
            )}
          </div>

          {/* Role */}
          <SearchableDropdown
            label={t("Role")}
            value={role}
            options={finalRoleOptions}
            onChange={(val) => onChange("role", val)}
            placeholder={t("Select Role")}
            required
          />

          {/* Campus */}
          <SearchableDropdown
            label={t("Campus")}
            value={campus}
            options={campusOptions}
            onChange={(val) => onChange("campus", val)}
            onSearch={onCampusSearch}
            placeholder={t("Select Campus")}
            isLoading={campusesLoading}
            required
          />

          {/* Academic Year */}
          <SearchableDropdown
            label={t("Academic Year")}
            value={academicYear}
            options={academicYearOptions}
            onChange={(val) => onChange("academicYear", val)}
            onSearch={onAcademicYearSearch}
            placeholder={t("Select Academic Year")}
            isLoading={academicYearsLoading}
            required
            disabled={academicYearDisabled}
          />

          {/* Base Salary */}
          <AppInput
            label={t("Base Salary")}
            type="number"
            name="baseSalary"
            value={baseSalary}
            onChange={(e) => onChange("baseSalary", e.target.value)}
            required
            min="0"
            step="0.01"
          />

          {/* ✅ Payment Type */}
          <SearchableDropdown
            label={t("Payment Type")}
            value={paymentType}
            options={PAYMENT_TYPE_OPTIONS}
            onChange={(val) => onPaymentTypeChange(val)}
            placeholder={t("Select Payment Type")}
            required
          />

          {/* ✅ Currency */}
          <SearchableDropdown
            label={t("Currency")}
            value={currency}
            options={CURRENCY_OPTIONS}
            onChange={(val) => onCurrencyChange(val)}
            placeholder={t("Select Currency")}
            required
          />

          {/* ✅ NEW: Annual Leave Allowance */}
          <AppInput
            label={t("Annual Leave Allowance (days)")}
            type="number"
            name="annualLeaveAllowance"
            value={annualLeaveAllowance}
            onChange={(e) => onChange("annualLeaveAllowance", e.target.value)}
            min="0"
            step="1"
            helperText={t("Number of paid leave days allowed per year for this contract. Leave 0 to skip enforcement.")}
          />

          {/* Start Date */}
          <AppInput
            label={t("Start Date")}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
            required
          />

          {/* End Date */}
          <AppInput
            label={t("End Date")}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            helperText={t("Optional. Leave blank if still active.")}
          />
        </div>

        {/* Allowances */}
        <div className="mt-6">
          <h4 className="text-sm-custom font-semibold text-ink-700 mb-2">{t("Allowances")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              label={t("House Rent")}
              type="number"
              name="allowances.houseRent"
              value={allowances.houseRent}
              onChange={(e) => onAllowanceChange("houseRent", e.target.value)}
              min="0"
              step="0.01"
            />
            <AppInput
              label={t("Medical")}
              type="number"
              name="allowances.medical"
              value={allowances.medical}
              onChange={(e) => onAllowanceChange("medical", e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Status select */}
        <div className="mt-4">
          <StatusSelect
            name="status"
            value={status}
            onChange={(val) => onChange("status", val)}
          />
        </div>

        {/* Note */}
        <div className="mt-4">
          <AppInput
            label={t("Note (optional)")}
            type="textarea"
            name="note"
            value={note}
            onChange={(e) => onChange("note", e.target.value)}
            rows={3}
          />
        </div>

        <AppInfoBox icon="fa-info-circle" className="mt-6">
          <strong>{t("Note")}:</strong>{" "}
          {t("Overlapping contracts for the same employee and academic year are not allowed.")}
        </AppInfoBox>
      </AppCard>
    </form>
  );
};

export default EmployeeContractForm;
