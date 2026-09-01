// component
// src/components/finance/fees/NewFees.jsx
//
// For ad-hoc, one-off fee entries (e.g. a fine, a uniform charge, a
// manual correction) — NOT the normal path for Admission/Tuition/Exam/
// Transport/Hostel fees, which are generated automatically from a
// student's enrollment feePlan and collected via PaymentFees.jsx.

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCreateFeeMutation } from "../../../redux/api/feesApi";
import { useGetUserByTypeQuery } from "../../../redux/api/authApi";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import AppButton from "../../GUI/AppButton";

const FEE_TYPES = ["Admission", "Tuition", "Exam", "Transport", "Hostel"];
const CURRENCIES = ["USD", "EUR", "GBP", "TL", "AUD", "CAD", "AED"];
const PAYMENT_FREQUENCIES = ["Monthly", "Quarterly", "Half Yearly", "Annually"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online"];
const STATUSES = ["Unpaid", "Pending", "Paid", "Overdue"];

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName ? u.middleName + " " : ""}${u.lastName || ""}`.trim() : "";

const inputClass = "w-full p-2 border border-gray-300 rounded-md";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

const NewFees = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [createFees, { isLoading, error, isSuccess }] = useCreateFeeMutation();

  const [studentSearch, setStudentSearch] = useState("");
  const { data: studentsData, isFetching: studentsLoading } = useGetUserByTypeQuery({
    type: "student",
    status: "active",
    limit: 0,
    keyword: studentSearch,
  });
  const students = studentsData?.users || studentsData?.students || [];

  const [feesData, setFeesData] = useState({
    student: "",
    amount: "",
    feeType: "",
    currency: "USD",
    paymentFrequency: "",
    dueDate: "",
    status: "Unpaid",
    paymentDate: "",
    paymentMethod: "",
  });

  const {
    student,
    amount,
    feeType,
    currency,
    paymentFrequency,
    dueDate,
    status,
    paymentDate,
    paymentMethod,
  } = feesData;

  const isPaid = status === "Paid";

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Something went wrong!"));
    }
    if (isSuccess) {
      toast.success(t("Fee record created successfully"));
      navigate("/admin/finance/fees/unpaid");
    }
  }, [error, isSuccess, navigate, t]);

  const onChange = (e) => {
    setFeesData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!student) return toast.error(t("Please select a student!"));
    if (!amount || Number(amount) <= 0) return toast.error(t("Please enter a valid amount!"));
    if (!feeType) return toast.error(t("Please select a fee type!"));
    if (!paymentFrequency) return toast.error(t("Please select a payment frequency!"));
    if (!dueDate) return toast.error(t("Please select a due date!"));
    if (isPaid && !paymentMethod) return toast.error(t("Please select a payment method!"));
    if (isPaid && !paymentDate) return toast.error(t("Please select a payment date!"));

    createFees({
      ...feesData,
      amount: Number(amount),
      // don't send stale payment info for a fee that isn't marked Paid
      paymentDate: isPaid ? paymentDate : undefined,
      paymentMethod: isPaid ? paymentMethod : undefined,
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("New Fee Entry")} />

      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <AppPageHeader
          title={t("New Fee Entry")}
          subtitle={t("Create a one-off fee charge for a student (fines, uniform, manual corrections, etc.)")}
          backUrl="/admin/finance/fees/unpaid"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Student */}
          <div className="bg-surface-50 shadow-soft rounded-xl p-6 space-y-4">
            <h3 className="text-base-custom font-semibold">{t("Student")}</h3>

            <div>
              <input
                type="text"
                placeholder={t("Search student by name, email or phone...")}
                className={inputClass}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>{t("Student Name")}</label>
              <select
                name="student"
                className={inputClass}
                value={student}
                onChange={onChange}
                required
              >
                <option value="" disabled>
                  {studentsLoading ? t("Loading...") : t("Select Student")}
                </option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {getFullName(s) || s.email} {s.email ? `— ${s.email}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fee details */}
          <div className="bg-surface-50 shadow-soft rounded-xl p-6 space-y-4">
            <h3 className="text-base-custom font-semibold">{t("Fee Details")}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("Fee Type")}</label>
                <select name="feeType" className={inputClass} value={feeType} onChange={onChange} required>
                  <option value="" disabled>
                    {t("Select Fee Type")}
                  </option>
                  {FEE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>{t("Payment Frequency")}</label>
                <select
                  name="paymentFrequency"
                  className={inputClass}
                  value={paymentFrequency}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    {t("Select Frequency")}
                  </option>
                  {PAYMENT_FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {t(freq)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("Amount")}</label>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  className={inputClass}
                  value={amount}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>{t("Currency")}</label>
                <select name="currency" className={inputClass} value={currency} onChange={onChange}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("Due Date")}</label>
              <input
                type="date"
                name="dueDate"
                className={inputClass}
                value={dueDate}
                onChange={onChange}
                required
              />
            </div>
          </div>

          {/* Status & payment info */}
          <div className="bg-surface-50 shadow-soft rounded-xl p-6 space-y-4">
            <h3 className="text-base-custom font-semibold">{t("Status")}</h3>

            <div>
              <label className={labelClass}>{t("Status")}</label>
              <select name="status" className={inputClass} value={status} onChange={onChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(s)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment method/date only make sense once the fee is being recorded as already Paid */}
            {isPaid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("Payment Method")}</label>
                  <select
                    name="paymentMethod"
                    className={inputClass}
                    value={paymentMethod}
                    onChange={onChange}
                    required
                  >
                    <option value="" disabled>
                      {t("Select Payment Method")}
                    </option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {t(method)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>{t("Payment Date")}</label>
                  <input
                    type="date"
                    name="paymentDate"
                    className={inputClass}
                    value={paymentDate}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AppButton
              type="button"
              text={t("Cancel")}
              onClick={() => navigate("/admin/finance/fees/unpaid")}
            />
            <AppButton
              type="submit"
              label={isLoading ? t("Creating...") : t("Create Fee Record")}
              icon="check"
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewFees;
