// src/components/GUI/StudentEnrollmentForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import AppCard from "./AppCard";
import AppInput from "./AppInput";
import AppButton from "./AppButton";
import StatusSelect from "./StatusSelect";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppInfoBox from "../layout/AppInfoBox";

// fee-plan option lists — keep in sync with backend
// models/fees.js / models/studentEnrollment.js (FEE_TYPES, FEE_CURRENCIES,
// PAYMENT_FREQUENCIES).
const FEE_CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "TL", "AUD", "CAD", "AED"].map((v) => ({
  value: v,
  label: v,
}));
const PAYMENT_FREQUENCY_OPTIONS = ["Monthly", "Quarterly", "Half Yearly", "Annually"].map((v) => ({
  value: v,
  label: v,
}));

// Not every fee type makes sense to split the same way — Admission is
// always a one-time charge, Exam is either one-time or Quarterly, while
// recurring costs like Tuition/Transport/Hostel support the full range
// including Monthly. Keep this in sync with the backend's
// FEE_TYPE_ALLOWED_FREQUENCIES in studentEnrollmentController.js.
const FEE_TYPE_ALLOWED_FREQUENCIES = {
  Admission: ["Annually"],
  Exam: ["Quarterly", "Annually"],
  Tuition: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Transport: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Hostel: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
};
const PAYMENT_METHOD_OPTIONS = ["Cash", "Bank Transfer", "Online"].map((v) => ({
  value: v,
  label: v,
}));

// scholarship option lists — keep in sync with backend models/Scholarship.js
const SCHOLARSHIP_TYPE_OPTIONS = [
  { value: "Percentage", label: "Percentage (%)" },
  { value: "Fixed", label: "Fixed Amount" },
];
const SCHOLARSHIP_STATUS_OPTIONS = ["Pending", "Approved", "Rejected"].map((v) => ({
  value: v,
  label: v,
}));

// Enrollment status is a different set of values than contract status
// (active / transferred / completed / left), so it's passed in as its own
// options list to StatusSelect rather than relying on that component's
// built-in default set. If StatusSelect doesn't accept an `options` prop
// in your version, swap this back to a SearchableDropdown instead.
const ENROLLMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "transferred", label: "Transferred" },
  { value: "completed", label: "Completed" },
  { value: "left", label: "Left" },
];

// Small pill toggle switch, kept local — used for "give this student a
// scholarship?" and for each fee-type row's on/off switch in the planner.
// ✅ FIX: the "on" state previously used bg-red-600 — red reads as a
// warning/destructive color everywhere else in the app (delete buttons,
// terminate contract, etc), so a fee type being *enabled* looked like an
// error state. Switched the "on" state to the brand color, which is what
// every other positive/active toggle and selection in the app uses.
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    {label && <span className="text-sm-custom font-medium text-ink-700">{label}</span>}
    <span
      onClick={() => onChange(!checked)}
      className={
        "rounded-full p-0.5 transition-colors flex items-center " +
        (checked ? "bg-brand-500 justify-end" : "bg-surface-300 justify-start")
      }
      style={{ width: 40, height: 22 }}
    >
      <span className="bg-white rounded-full shadow" style={{ width: 18, height: 18 }} />
    </span>
  </label>
);

const StudentEnrollmentForm = ({
  isEditMode,
  enrollment, // entire enrollment state object
  onChange, // (field, value) => void
  onSubmit,
  isSubmitting,

  // Student dropdown
  studentSearch,
  onStudentSearch,
  studentOptions,
  studentsLoading,
  preselectedStudentName,
  studentReadOnly,
  studentValue,

  // Academic Year dropdown
  academicYearSearch,
  onAcademicYearSearch,
  academicYearOptions,
  academicYearsLoading,
  academicYearValue,
  onAcademicYearChange,
  academicYearDisabled,

  // Class Group dropdown
  classGroupSearch,
  onClassGroupSearch,
  classGroupOptions,
  classGroupsLoading,
  classGroupValue,
  onClassGroupChange,

  // Campus dropdown
  campusSearch,
  onCampusSearch,
  campusOptions,
  campusesLoading,
  campusValue,
  onCampusChange,

  // Fee plan (multi-line planner: one row per fee type)
  feeTypes, // e.g. ["Admission","Tuition","Exam","Transport","Hostel"]
  feeTypeFrequencies, // { [feeType]: allowed paymentFrequency values }
  feePlan, // { [feeType]: { enabled, amount, currency, paymentFrequency, dueDate, paymentMethod } }
  onFeeLineChange, // (feeType, field, value) => void
  linkedFees, // Fees installments already generated for this enrollment (edit mode)

  // Scholarship
  scholarship,
  onScholarshipChange,
  discountedAmountPreview,
}) => {
  const { t } = useTranslation();

  const { startDate, endDate, status } = enrollment;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ================== ENROLLMENT INFORMATION ================== */}
      <AppCard title={t("Enrollment Information")} icon="fa-graduation-cap">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Student field (full width) */}
          <div className="md:col-span-6">
            {studentReadOnly ? (
              <div>
                <label className="block text-xs-custom font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                  {t("Student")} <span className="text-red-500">*</span>
                </label>
                <AppInput value={preselectedStudentName || studentValue} disabled />
                <p className="text-xs-custom text-ink-400 mt-1">{t("Student is pre‑selected")}</p>
              </div>
            ) : (
              <SearchableDropdown
                label={t("Student")}
                value={studentValue}
                options={studentOptions}
                onChange={(val) => onChange("student", val)}
                onSearch={onStudentSearch}
                placeholder={t("Select Student")}
                isLoading={studentsLoading}
                required
              />
            )}
          </div>

          {/* First row: Campus, Academic Year, Class Group (3 columns) */}
          <div className="md:col-span-2">
            <SearchableDropdown
              label={t("Campus")}
              value={campusValue}
              options={campusOptions}
              onChange={onCampusChange}
              onSearch={onCampusSearch}
              placeholder={t("Select Campus (optional)")}
              isLoading={campusesLoading}
            />
          </div>

          <div className="md:col-span-2">
            <SearchableDropdown
              label={t("Academic Year")}
              value={academicYearValue}
              options={academicYearOptions}
              onChange={onAcademicYearChange}
              onSearch={onAcademicYearSearch}
              placeholder={t("Select Academic Year")}
              isLoading={academicYearsLoading}
              required
              disabled={academicYearDisabled}
            />
          </div>

          <div className="md:col-span-2">
            <SearchableDropdown
              label={t("Class Group")}
              value={classGroupValue}
              options={classGroupOptions}
              onChange={onClassGroupChange}
              onSearch={onClassGroupSearch}
              placeholder={t("Select Class Group")}
              isLoading={classGroupsLoading}
              required
            />
          </div>

          {/* Second row: Start Date, End Date (2 columns) */}
          <div className="md:col-span-3">
            <AppInput
              label={t("Start Date")}
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-3">
            <AppInput
              label={t("End Date")}
              type="date"
              name="endDate"
              value={endDate}
              onChange={(e) => onChange("endDate", e.target.value)}
              helperText={t("Optional — set a planned end date; enrollment auto-completes after this date.")}
            />
          </div>
        </div>

        {/* Status select */}
        <div className="mt-4">
          <StatusSelect
            name="status"
            value={status}
            onChange={(val) => onChange("status", val)}
            options={ENROLLMENT_STATUS_OPTIONS}
          />
        </div>

        <AppInfoBox icon="fa-info-circle" className="mt-6">
          <strong>{t("Note")}:</strong>{" "}
          {t(
            "Overlapping enrollments for the same student and academic year are not allowed. Setting an end date on an active enrollment schedules automatic completion on that date."
          )}
        </AppInfoBox>
      </AppCard>

      {/* ================== FEE PLAN — multi fee-type planner ================== */}
      {/* One row per fee type. Ticking a row on reveals its own
          amount/currency/frequency/due-date/method — only ticked rows are
          actually charged to the student (e.g. leave "Transport" off for
          a student who doesn't take the bus). Each row is split into
          installments on the backend according to its own payment
          frequency, so a Monthly Tuition payer and an Annual Hostel payer
          can coexist on the same enrollment. */}
      <AppCard title={t("Fee Plan")} icon="fa-wallet">
        <p className="text-sm-custom text-ink-600 mb-4">
          {t("Turn on each fee type that applies to this student and set its own amount, currency, and how often it's paid.")}
        </p>

        <div className="space-y-4">
          {feeTypes.map((feeType) => {
            const line = feePlan[feeType] || {};
            // Not every fee type makes sense on every schedule — Admission
            // is always a one-off charge, Exam is only ever Quarterly or
            // once a year. Only offer the frequencies that are actually
            // valid for this fee type.
            const allowedFrequencies = feeTypeFrequencies?.[feeType] || null;
            const frequencyOptions = allowedFrequencies
              ? PAYMENT_FREQUENCY_OPTIONS.filter((o) => allowedFrequencies.includes(o.value))
              : PAYMENT_FREQUENCY_OPTIONS;
            const isSingleFrequency = frequencyOptions.length === 1;
            return (
              <div
                key={feeType}
                className={
                  "border rounded-xl p-4 transition-colors " +
                  (line.enabled ? "border-brand-200 bg-brand-50/30" : "border-surface-200")
                }
              >
                <div className="flex items-center justify-between">
                  <Toggle
                    checked={!!line.enabled}
                    onChange={(val) => onFeeLineChange(feeType, "enabled", val)}
                    label={t(feeType)}
                  />
                  {feeType === "Tuition" && (
                    <span className="text-xs-custom text-ink-400">
                      {t("Scholarships apply to Tuition only")}
                    </span>
                  )}
                </div>

                {line.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Amount */}
                    <AppInput
                      label={t("Amount")}
                      type="number"
                      name={`${feeType}-amount`}
                      value={line.amount}
                      onChange={(e) => onFeeLineChange(feeType, "amount", e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder={t("e.g. 500")}
                    />

                    {/* Currency */}
                    <SearchableDropdown
                      label={t("Currency")}
                      value={line.currency}
                      options={FEE_CURRENCY_OPTIONS}
                      onChange={(val) => onFeeLineChange(feeType, "currency", val)}
                      placeholder={t("Select Currency")}
                      required
                    />

                    {/* Payment Frequency — restricted to what makes sense
                        for this fee type. When there's only one valid
                        option (Admission), show it as a fixed label
                        instead of a dropdown with nothing to choose. */}
                    {isSingleFrequency ? (
                      <div>
                        <label className="block text-xs-custom font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                          {t("Payment Frequency")}
                        </label>
                        <div className="px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm-custom text-ink-700">
                          {t("One-time payment")} ({t(frequencyOptions[0].label)})
                        </div>
                      </div>
                    ) : (
                      <SearchableDropdown
                        label={t("Payment Frequency")}
                        value={line.paymentFrequency}
                        options={frequencyOptions}
                        onChange={(val) => onFeeLineChange(feeType, "paymentFrequency", val)}
                        placeholder={t("Select Payment Frequency")}
                        required
                      />
                    )}

                    {/* Due Date (first installment) */}
                    <AppInput
                      label={t("First Due Date")}
                      type="date"
                      name={`${feeType}-dueDate`}
                      value={line.dueDate}
                      onChange={(e) => onFeeLineChange(feeType, "dueDate", e.target.value)}
                      required
                      helperText={t("Later installments are spaced from this date based on the frequency above.")}
                    />

                    {/* Payment Method */}
                    <SearchableDropdown
                      label={t("Payment Method")}
                      value={line.paymentMethod}
                      options={PAYMENT_METHOD_OPTIONS}
                      onChange={(val) => onFeeLineChange(feeType, "paymentMethod", val)}
                      placeholder={t("Select (optional)")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AppInfoBox icon="fa-info-circle" className="mt-6">
          {t(
            "Each ticked fee type is split into installments for finance (e.g. Monthly = 12 installments, Annually = 1) and a reminder is scheduled ahead of every due date."
          )}
        </AppInfoBox>

        {/* ================== read-only fee/installment history (edit mode) ================== */}
        {isEditMode && linkedFees && linkedFees.length > 0 && (
          <div className="mt-6">
            <label className="block text-xs-custom font-semibold text-ink-700 uppercase tracking-wider mb-2">
              {t("Fee History")}
            </label>
            <div className="border border-surface-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs-custom">
                <thead className="bg-surface-50 text-ink-600 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("Type")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("Installment")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("Amount")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("Due Date")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedFees.map((fee) => (
                    <tr key={fee._id} className="border-t border-surface-100">
                      <td className="px-4 py-2.5 text-ink-700">
                        {fee.feeType}
                        {fee.scholarshipApplied && (
                          <span className="ml-1 text-[10px] text-emerald-600">
                            ({t("discounted")})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">
                        {fee.totalInstallments > 1
                          ? `${fee.installmentNumber}/${fee.totalInstallments}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">
                        {fee.amount} {fee.currency}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                            (fee.status === "Paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : fee.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700")
                          }
                        >
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs-custom text-ink-400 mt-1">
              {t("Editing the fee plan above regenerates installments that are still Pending — installments already Paid or Overdue are never changed.")}
            </p>
          </div>
        )}
      </AppCard>

      {/* ================== SCHOLARSHIP (optional, per student) ================== */}
      <AppCard title={t("Scholarship")} icon="fa-award">
        {/* Toggle is rendered inside the card body (not passed as a header
            prop) so it always shows regardless of what AppCard supports. */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-surface-100">
          <p className="text-sm-custom text-ink-600">
            {t("Turn this on to set up a scholarship for this student. It only ever discounts the Tuition fee.")}
          </p>
          <Toggle
            checked={scholarship.enabled}
            onChange={(val) => onScholarshipChange("enabled", val)}
            label={t("Give scholarship")}
          />
        </div>

        {!scholarship.enabled ? (
          <p className="text-sm-custom text-ink-600">
            {t('No scholarship for this student. Turn on "Give scholarship" to set one up.')}
          </p>
        ) : !feePlan.Tuition?.enabled ? (
          <AppInfoBox icon="fa-triangle-exclamation" tone="warning">
            {t('Enable "Tuition" in the Fee Plan above first — scholarships only apply to Tuition.')}
          </AppInfoBox>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scholarship Type */}
              <SearchableDropdown
                label={t("Scholarship Type")}
                value={scholarship.type}
                options={SCHOLARSHIP_TYPE_OPTIONS}
                onChange={(val) => onScholarshipChange("type", val)}
                placeholder={t("Select Type")}
                required
              />

              {scholarship.type === "Percentage" ? (
                <AppInput
                  label={t("Percentage")}
                  type="number"
                  name="scholarshipPercentage"
                  value={scholarship.percentage}
                  onChange={(e) => onScholarshipChange("percentage", e.target.value)}
                  required
                  min="0"
                  max="100"
                  step="1"
                  placeholder={t("e.g. 25")}
                />
              ) : (
                <AppInput
                  label={t("Fixed Discount Amount")}
                  type="number"
                  name="scholarshipAmount"
                  value={scholarship.amount}
                  onChange={(e) => onScholarshipChange("amount", e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder={t("e.g. 100")}
                />
              )}

              {/* Criteria */}
              <AppInput
                label={t("Criteria")}
                type="text"
                name="scholarshipCriteria"
                value={scholarship.criteria}
                onChange={(e) => onScholarshipChange("criteria", e.target.value)}
                required
                placeholder={t("e.g. Merit-based, financial need, sibling discount")}
              />

              {/* Approval Status */}
              <SearchableDropdown
                label={t("Approval Status")}
                value={scholarship.status}
                options={SCHOLARSHIP_STATUS_OPTIONS}
                onChange={(val) => onScholarshipChange("status", val)}
                placeholder={t("Select Status")}
              />
            </div>

            {discountedAmountPreview !== null ? (
              <AppInfoBox icon="fa-award" className="mt-6" tone="success">
                <strong>{t("Tuition after scholarship")}:</strong> {discountedAmountPreview}{" "}
                {feePlan.Tuition?.currency}{" "}
                <span className="text-emerald-600">
                  ({t("was")} {feePlan.Tuition?.amount} {feePlan.Tuition?.currency})
                </span>
              </AppInfoBox>
            ) : (
              <AppInfoBox icon="fa-info-circle" className="mt-6">
                {t('This scholarship won\'t reduce the Tuition fee until its status is set to "Approved".')}
              </AppInfoBox>
            )}
          </>
        )}
      </AppCard>

      {/* ================== ACTIONS ================== */}
      <div className="flex justify-end gap-3">
        <AppButton backUrl="/admin/studentenrollements" />
        <AppButton
          type="submit"
          label={isEditMode ? t("Update Enrollment") : t("Create Enrollment")}
          loadingLabel={t("Saving...")}
          isLoading={isSubmitting}
          icon="fa-save"
        />
      </div>
    </form>
  );
};

export default StudentEnrollmentForm;
