// src/components/finance/fees/PaidFeesStudentDetails.jsx
//
// Drill-down opened from PaidFeesList ("View" button) — this is where
// the actual per-installment paid transactions for ONE student live, so
// nothing is lost by aggregating the main list. Backed by the existing
// flat GET /fees/paid?studentId=... endpoint.
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useGetPaidFeesListQuery } from "../../../redux/api/feesApi";

import AdminLayout from "../../layout/AdminLayout";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import AppPageHeader from "../../layout/AppPageHeader";
import AppInfoBox from "../../layout/AppInfoBox";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import EmptyState from "../../GUI/EmptyState";
import AppButton from "../../GUI/AppButton";

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() : "";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const PaidFeesStudentDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { studentId } = useParams();

  const { data, isLoading, error, refetch } = useGetPaidFeesListQuery(
    { studentId, limit: 0 },
    { skip: !studentId, refetchOnMountOrArgChange: true }
  );

  React.useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
  }, [error, t]);

  const rows = data?.paidFees || [];
  const studentInfo = rows[0]?.student || null;

  const columns = [
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
        <span className="font-medium text-green-700">
          {row.currency} {Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    { header: t("Payment Method"), width: "14%", minWidth: "130px", render: (_, row) => t(row.paymentMethod) },
    { header: t("Payment Date"), width: "12%", minWidth: "120px", render: (_, row) => formatDate(row.paymentDate) },
    { header: t("Receipt No."), width: "16%", minWidth: "160px", render: (_, row) => row.receiptNo || "-" },
    {
      header: t("Reference"),
      width: "16%",
      minWidth: "140px",
      render: (_, row) => row.paymentReference || "-",
    },
  ];

  const emptyState = (
    <EmptyState icon="receipt" title={t("No payments found")} message={t("This student has no paid installments yet.")} />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Student Payment History")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Student Payment History")}
          subtitle={t("Every installment paid by this student, newest first")}
          backUrl="/admin/finance/fees/paid"
        />

        {studentInfo && (
          <AppInfoBox icon="fa-user-graduate">
            <strong>{getFullName(studentInfo)}</strong>
            {studentInfo.phoneNumber ? ` — ${studentInfo.phoneNumber}` : ""}
            {studentInfo.email ? ` — ${studentInfo.email}` : ""}
          </AppInfoBox>
        )}

        <DataTableContainer
          title={t("Paid Installments")}
          data={rows}
          columns={columns}
          isLoading={isLoading}
          onRefresh={refetch}
          refreshButton={
            <AppButton onClick={refetch} text={t("Refresh")} icon="sync-alt" className="ml-2" />
          }
          emptyState={emptyState}
          className="paid-fees-detail-table-container bg-surface-50 shadow-soft rounded-xl"
          showSearch={false}
          showStats={false}
          showPagination={false}
        />
      </div>
    </AdminLayout>
  );
};

export default PaidFeesStudentDetails;