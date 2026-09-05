// src/components/finance/salary/NewSalary.jsx
//
// "Generate Monthly Salaries" — the entry point for the whole module.
// Salaries are never typed in by hand here; picking a month+year
// generates one Unpaid Salary row per active, monthly-paid
// EmployeeContract — so every salary is always contract-based. Running
// this again for a month that's already been generated is safe:
// existing rows are skipped, never duplicated.
//
// Campus/Academic Year are NOT picked here — the backend scopes
// generation from the same cookies every other finance screen uses.
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import AppCard from "../../GUI/AppCard";
import AppInput from "../../GUI/AppInput";
import AppButton from "../../GUI/AppButton";
import SelectField from "./SelectField";
import { useGenerateMonthlySalariesMutation } from "../../../redux/api/salaryApi";
import { MONTH_NAMES, currentMonthName } from "../../../constants/salaryConstants";

const NewSalary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [month, setMonth] = useState(currentMonthName());
  const [year, setYear] = useState(new Date().getFullYear());
  const [lastResult, setLastResult] = useState(null);

  const [generateMonthlySalaries, { isLoading }] = useGenerateMonthlySalariesMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await generateMonthlySalaries({ month, year: Number(year) }).unwrap();
      setLastResult(result);
      toast.success(t("{{created}} salary record(s) generated", { created: result.created }));
    } catch (err) {
      toast.error(err?.data?.message || t("Error generating salaries"));
    }
  };

  return (
    <AdminLayout>
      <MetaData title={t("Generate Monthly Salaries")} />

      {/* Same container class as every other admin/finance page
          (UpdateEmployeeContract, ListStudents, PaySalary, etc.) —
          max-w-6xl mx-auto space-y-6, so navigating between screens
          doesn't jump width. */}
      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Generate Monthly Salaries")}
          subtitle={t("Creates one salary record per active, monthly-paid contract for the selected month")}
          backUrl="/finance/employees/salaries"
        />

        <form onSubmit={handleSubmit}>
          <AppCard
            title={t("Select Period")}
            icon="fa-calendar-alt"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/finance/employees/salaries" />
                <AppButton
                  type="submit"
                  label={t("Generate Salaries")}
                  loadingLabel={t("Generating...")}
                  isLoading={isLoading}
                  icon="fa-magic"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label={t("Month")}
                value={month}
                onChange={setMonth}
                options={MONTH_NAMES}
                optionLabel={(m) => t(m)}
              />
              <AppInput
                label={t("Year")}
                type="number"
                name="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </AppCard>
        </form>

        {lastResult && (
          <AppCard title={t("Generated")} icon="fa-check-circle">
            <p className="text-sm-custom text-dark-light">{lastResult.message}</p>
            <div className="flex justify-end mt-4">
              <AppButton
                label={t("View Monthly Salaries")}
                icon="fa-list"
                onClick={() => navigate(`/finance/employees/salaries?month=${month}&year=${year}`)}
              />
            </div>
          </AppCard>
        )}
      </div>
    </AdminLayout>
  );
};

export default NewSalary;