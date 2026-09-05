// src/components/finance/expenses/NewExpenses.jsx
//
// Create or edit a one-off expense record (utility bills, maintenance,
// books, furniture, events...). Same screen handles both: with
// ?id=<expenseId> in the URL it loads and edits that record, otherwise
// it creates a new one. audit.createdBy/updatedBy are stamped
// server-side from the logged-in user — nothing to pick here.
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import Loader from "../../layout/Loader";
import AppCard from "../../GUI/AppCard";
import AppInput from "../../GUI/AppInput";
import AppButton from "../../GUI/AppButton";
import SelectField from "../../GUI/SelectField";

import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useGetExpenseDetailsQuery,
} from "../../../redux/api/expensesApi";
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "../../../constants/expenseConstants";

const todayISO = () => new Date().toISOString().split("T")[0];

const emptyExpense = {
  category: EXPENSE_CATEGORIES[0],
  amount: "",
  date: todayISO(),
  vendor: "",
  description: "",
  paymentMethod: EXPENSE_PAYMENT_METHODS[0],
  reference: "",
};

const NewExpenses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expenseId = searchParams.get("id");
  const isEditMode = Boolean(expenseId);

  const [expense, setExpense] = useState(emptyExpense);

  const { data: expenseDetails, isLoading: detailsLoading } = useGetExpenseDetailsQuery(expenseId, {
    skip: !isEditMode,
  });

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  useEffect(() => {
    if (isEditMode && expenseDetails?.expense) {
      const e = expenseDetails.expense;
      setExpense({
        category: e.category,
        amount: e.amount,
        date: e.date ? new Date(e.date).toISOString().split("T")[0] : todayISO(),
        vendor: e.vendor || "",
        description: e.description || "",
        paymentMethod: e.paymentMethod || EXPENSE_PAYMENT_METHODS[0],
        reference: e.reference || "",
      });
    }
  }, [expenseDetails, isEditMode]);

  const onChange = (field, value) => {
    setExpense((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expense.category || !expense.amount || Number(expense.amount) <= 0) {
      return toast.error(t("Please select a category and enter a valid amount"));
    }

    const payload = {
      category: expense.category,
      amount: Number(expense.amount),
      date: expense.date,
      vendor: expense.vendor || undefined,
      description: expense.description || undefined,
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || undefined,
    };

    try {
      if (isEditMode) {
        await updateExpense({ id: expenseId, ...payload }).unwrap();
        toast.success(t("Expense updated successfully"));
      } else {
        await createExpense(payload).unwrap();
        toast.success(t("Expense recorded successfully"));
      }
      navigate("/finance/expense/List");
    } catch (err) {
      toast.error(err?.data?.message || t("Error saving expense"));
    }
  };

  if (isEditMode && detailsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={isEditMode ? t("Edit Expense") : t("New Expense")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={isEditMode ? t("Edit Expense") : t("New Expense")}
          subtitle={t("Record a one-off school expense — utilities, maintenance, supplies, events")}
          backUrl="/finance/expense/List"
        />

        <form onSubmit={handleSubmit}>
          <AppCard
            title={t("Expense Details")}
            icon="fa-file-invoice"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/finance/expense/List" />
                <AppButton
                  type="submit"
                  label={isEditMode ? t("Save Changes") : t("Record Expense")}
                  loadingLabel={isEditMode ? t("Saving...") : t("Recording...")}
                  isLoading={isEditMode ? isUpdating : isCreating}
                  icon="fa-check"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label={t("Category")}
                value={expense.category}
                onChange={(val) => onChange("category", val)}
                options={EXPENSE_CATEGORIES}
                optionLabel={(c) => t(c)}
              />
              <AppInput
                label={t("Amount")}
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={expense.amount}
                onChange={(e) => onChange("amount", e.target.value)}
                required
              />
              <AppInput
                label={t("Date")}
                type="date"
                name="date"
                value={expense.date}
                onChange={(e) => onChange("date", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <AppInput
                label={t("Vendor")}
                name="vendor"
                value={expense.vendor}
                onChange={(e) => onChange("vendor", e.target.value)}
                placeholder={t("Optional")}
              />
              <SelectField
                label={t("Payment Method")}
                value={expense.paymentMethod}
                onChange={(val) => onChange("paymentMethod", val)}
                options={EXPENSE_PAYMENT_METHODS}
                optionLabel={(m) => t(m)}
              />
              <AppInput
                label={t("Reference / Invoice No.")}
                name="reference"
                value={expense.reference}
                onChange={(e) => onChange("reference", e.target.value)}
                placeholder={t("Optional")}
              />
            </div>

            <div className="mt-4">
              <AppInput
                label={t("Description")}
                type="textarea"
                rows={3}
                name="description"
                value={expense.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder={t("Optional notes about this expense")}
              />
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewExpenses;