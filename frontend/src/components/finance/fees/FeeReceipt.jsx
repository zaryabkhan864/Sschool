import React from "react";
import { useTranslation } from "react-i18next";
import AppButton from "../../GUI/AppButton";
import { useGetSchoolQuery } from "../../../redux/api/schoolApi";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "-";

const formatMoney = (amount, currency) => `${currency} ${Number(amount).toFixed(2)}`;

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() : "";

/**
 * props:
 *  - receiptNo: string
 *  - student: { firstName, middleName, lastName, email, phoneNumber }
 *  - lines: [{ feeType, installmentNumber, totalInstallments, amount, currency }]
 *  - paymentMethod: "Cash" | "Bank Transfer" | "Online"
 *  - paymentDate: ISO date string
 *  - paymentReference: string | null   (Bank Transfer / Online txn no.)
 *  - tendered: { [currency]: number }  (Cash only)
 *  - change: { [currency]: number }    (Cash only)
 *  - totals: { [currency]: number }    (sum of `lines` per currency)
 *  - onDone: () => void
 *  - onNewPayment: () => void
 */
const FeeReceipt = ({
  receiptNo,
  student,
  lines = [],
  paymentMethod,
  paymentDate,
  paymentReference,
  tendered = {},
  change = {},
  totals = {},
  onDone,
  onNewPayment,
}) => {
  const { t } = useTranslation();
  const { data: schoolData } = useGetSchoolQuery();

  // School info with fallbacks
  const schoolName = schoolData?.name || "Sunrise International School";
  const schoolLogo = schoolData?.logo?.url || "/images/Logo.png";
  const schoolTagline = schoolData?.tagline || "Excellence in Education";
  const schoolAddress = schoolData?.address || "123 Education Avenue, Knowledge City";
  const schoolPhone = schoolData?.contactNumber || "+1 234 567 890";
  const schoolEmail = schoolData?.email || "info@sunriseschool.edu";
  const schoolWebsite = schoolData?.website || "www.sunriseschool.edu";

  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Print-only styling: hide everything except #fee-receipt-print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #fee-receipt-print, #fee-receipt-print * { visibility: visible; }
          #fee-receipt-print { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <div className="print:hidden flex items-center justify-between">
        <h2 className="text-lg-custom font-semibold text-green-700">
          <i className="fa fa-check-circle mr-2"></i>
          {t("Payment Recorded")}
        </h2>
        <div className="flex gap-2">
          <AppButton text={t("Print Receipt")} icon="print" onClick={handlePrint} />
          <AppButton text={t("New Payment")} icon="plus" onClick={onNewPayment} />
          <AppButton text={t("Done")} icon="check" onClick={onDone} />
        </div>
      </div>

      <div
        id="fee-receipt-print"
        className="relative bg-white border border-gray-200 shadow-soft rounded-xl p-8 space-y-6 overflow-hidden"
      >
        {/* Watermark logo (light, behind everything) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.05 }}
        >
          <img src={schoolLogo} alt="" className="w-96 h-96 object-contain" />
        </div>

        {/* Everything below sits above the watermark */}
        <div className="relative space-y-6">
          {/* Header: small logo top-left, centered school name + title + meta */}
          <div className="relative text-center border-b border-dashed border-gray-300 pb-4">
            <img
              src={schoolLogo}
              alt={schoolName}
              className="absolute left-0 top-0 h-20 w-20 object-contain"
            />
            <p className="text-sm-custom font-semibold text-primary uppercase tracking-wide">
              {schoolName}
            </p>
            <h1 className="text-xl-custom font-bold mt-1">{t("Fee Payment Receipt")}</h1>
            <p className="text-sm-custom text-dark-light mt-1">
              {t("Receipt No")}: {receiptNo}
            </p>
            <p className="text-sm-custom text-dark-light">
              {t("Date")}: {formatDate(paymentDate)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm-custom">
            <div>
              <p className="text-dark-light">{t("Student Name")}</p>
              <p className="font-medium">{getFullName(student)}</p>
            </div>
            <div>
              <p className="text-dark-light">{t("Phone Number")}</p>
              <p className="font-medium">{student?.phoneNumber || "-"}</p>
            </div>
            <div>
              <p className="text-dark-light">{t("Payment Method")}</p>
              <p className="font-medium">{t(paymentMethod)}</p>
            </div>
            {paymentReference && (
              <div>
                <p className="text-dark-light">{t("Reference No.")}</p>
                <p className="font-medium">{paymentReference}</p>
              </div>
            )}
          </div>

          <table className="w-full text-sm-custom">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2">{t("Fee Type")}</th>
                <th className="py-2">{t("Installment")}</th>
                <th className="py-2 text-right">{t("Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line._id || `${line.feeType}-${line.installmentNumber}`} className="border-b border-gray-100">
                  <td className="py-2">{t(line.feeType)}</td>
                  <td className="py-2">
                    {line.installmentNumber}/{line.totalInstallments}
                  </td>
                  <td className="py-2 text-right">{formatMoney(line.amount, line.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-sm-custom">
            {Object.entries(totals).map(([currency, amount]) => (
              <div key={currency} className="flex justify-between font-semibold text-base-custom">
                <span>{t("Total Paid")} ({currency})</span>
                <span>{formatMoney(amount, currency)}</span>
              </div>
            ))}

            {paymentMethod === "Cash" &&
              Object.keys(tendered).length > 0 &&
              Object.entries(tendered).map(([currency, amt]) => (
                <div key={`tendered-${currency}`} className="flex justify-between text-dark-light">
                  <span>{t("Cash Received")} ({currency})</span>
                  <span>{formatMoney(amt, currency)}</span>
                </div>
              ))}

            {paymentMethod === "Cash" &&
              Object.keys(change).length > 0 &&
              Object.entries(change).map(([currency, amt]) => (
                <div key={`change-${currency}`} className="flex justify-between text-dark-light">
                  <span>{t("Change Returned")} ({currency})</span>
                  <span>{formatMoney(amt, currency)}</span>
                </div>
              ))}
          </div>

          {/* Footer: thank-you note + school contact details */}
          <div className="text-center text-xs text-dark-light border-t border-dashed border-gray-300 pt-4">
            <p>{t("Thank you! This receipt confirms payment for the installment(s) listed above.")}</p>
            <div className="mt-2 text-gray-500">
              <p>
                {schoolName} | {schoolAddress}
              </p>
              <p>
                {t("Phone")}: {schoolPhone} | {t("Email")}: {schoolEmail}
              </p>
              <p>{schoolWebsite}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;
