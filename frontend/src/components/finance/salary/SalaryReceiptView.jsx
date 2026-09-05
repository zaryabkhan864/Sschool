// src/components/finance/salary/SalaryReceiptView.jsx
//
// Thin wrapper used by "View Receipt" links (ListSalaries,
// PaidSalariesList, TeacherSalaryLookup) — fetches one already-paid
// salary record by id and renders it through SalaryReceipt.
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import Loader from "../../layout/Loader";
import SalaryReceipt from "./SalaryReceipt";
import { useGetSalaryDetailsQuery } from "../../../redux/api/salaryApi";

const SalaryReceiptView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { salaryId } = useParams();

  const { data, isLoading, error } = useGetSalaryDetailsQuery(salaryId, { skip: !salaryId });

  React.useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Could not load this receipt"));
  }, [error, t]);

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  const salary = data?.salary;
  if (!salary) return null;

  return (
    <AdminLayout>
      <MetaData title={t("Salary Receipt")} />
      <SalaryReceipt
        receiptNo={salary.receiptNo}
        employee={salary.employeeId}
        lines={[salary]}
        paymentMethod={salary.paymentMethod}
        paymentDate={salary.paymentDate}
        paymentReference={salary.paymentReference}
        tendered={salary.amountTendered != null ? { [salary.currency]: salary.amountTendered } : {}}
        change={salary.changeReturned != null ? { [salary.currency]: salary.changeReturned } : {}}
        totals={{ [salary.currency]: salary.netSalary }}
        onDone={() => navigate("/finance/employees/salaries")}
      />
    </AdminLayout>
  );
};

export default SalaryReceiptView;
