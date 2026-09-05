// src/components/finance/salary/SalaryReceipt.jsx
//
// Printable salary receipt — same shape as the Fees module's
// FeeReceipt, plus school letterhead (logo/name/tagline/address/phone/
// email/website) like the StudentDetails admission document, since a
// salary slip should look like an official school document too.
import React from "react";
import { useTranslation } from "react-i18next";
import AppButton from "../../GUI/AppButton";
import { useGetSchoolQuery } from "../../../redux/api/schoolApi";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-";

/**
 * props:
 *  - receiptNo, employee (needs .fullName from the backend), lines: [{ month, year, amount, deductions, netSalary, currency }]
 *  - paymentMethod, paymentDate, paymentReference
 *  - tendered / change: { [currency]: number }  (Cash only)
 *  - totals: { [currency]: number } (sum of netSalary per currency)
 *  - onDone, onNewPayment
 */
const SalaryReceipt = ({
  receiptNo,
  employee,
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

  const schoolName = schoolData?.name || "Sunrise International School";
  const schoolLogo = schoolData?.logo?.url || "/images/Logo.png";
  const schoolTagline = schoolData?.tagline || "Excellence in Education";
  const schoolAddress = schoolData?.address || "123 Education Avenue, Knowledge City";
  const schoolPhone = schoolData?.phone || "+1 234 567 890";
  const schoolEmail = schoolData?.email || "info@sunriseschool.edu";

  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #salary-receipt-print, #salary-receipt-print * { visibility: visible; }
          #salary-receipt-print { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <div className="print:hidden flex items-center justify-between">
        <h2 className="text-lg-custom font-semibold text-green-700">
          <i className="fa fa-check-circle mr-2"></i>
          {t("Salary Payment Recorded")}
        </h2>
        <div className="flex gap-2">
          <AppButton text={t("Print Receipt")} icon="print" onClick={handlePrint} />
          {onNewPayment && <AppButton text={t("New Payment")} icon="plus" onClick={onNewPayment} />}
          {onDone && <AppButton text={t("Done")} icon="check" onClick={onDone} />}
        </div>
      </div>

      <div id="salary-receipt-print" className="bg-white border border-gray-200 shadow-soft rounded-xl p-8 space-y-6">
        {/* School letterhead — same info shown on the admission document */}
        <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt={schoolName} className="h-14 w-14 object-contain" />
            <div>
              <h2 className="text-base font-serif font-bold text-gray-900 uppercase">{schoolName}</h2>
              <p className="text-xs text-gray-500 italic">{schoolTagline}</p>
              <p className="text-[11px] text-gray-500">{schoolAddress}</p>
              <p className="text-[11px] text-gray-500">
                {schoolPhone} • {schoolEmail}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p className="font-semibold text-gray-700">{t("Salary Receipt")}</p>
            <p>{t("Receipt No")}: {receiptNo}</p>
            <p>{t("Date")}: {formatDate(paymentDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm-custom">
          <div>
            <p className="text-dark-light">{t("Employee Name")}</p>
            <p className="font-medium">{employee?.fullName}</p>
          </div>
          <div>
            <p className="text-dark-light">{t("Phone Number")}</p>
            <p className="font-medium">{employee?.phoneNumber || "-"}</p>
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
              <th className="py-2">{t("Month")}</th>
              <th className="py-2 text-right">{t("Gross")}</th>
              <th className="py-2 text-right">{t("Deduction")}</th>
              <th className="py-2 text-right">{t("Net")}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line._id || `${line.month}-${line.year}`} className="border-b border-gray-100">
                <td className="py-2">
                  {t(line.month)} {line.year}
                </td>
                <td className="py-2 text-right">
                  {line.currency} {Number(line.amount).toFixed(2)}
                </td>
                <td className="py-2 text-right text-red-600">
                  {line.deductions > 0 ? `-${line.currency} ${Number(line.deductions).toFixed(2)}` : "-"}
                </td>
                <td className="py-2 text-right font-medium">
                  {line.currency} {Number(line.netSalary).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-sm-custom">
          {Object.entries(totals).map(([currency, amount]) => (
            <div key={currency} className="flex justify-between font-semibold text-base-custom">
              <span>{t("Total Paid")} ({currency})</span>
              <span>{currency} {amount.toFixed(2)}</span>
            </div>
          ))}

          {paymentMethod === "Cash" &&
            Object.entries(tendered).map(([currency, amt]) => (
              <div key={`tendered-${currency}`} className="flex justify-between text-dark-light">
                <span>{t("Cash Received")} ({currency})</span>
                <span>{currency} {Number(amt).toFixed(2)}</span>
              </div>
            ))}

          {paymentMethod === "Cash" &&
            Object.entries(change).map(([currency, amt]) => (
              <div key={`change-${currency}`} className="flex justify-between text-dark-light">
                <span>{t("Change Returned")} ({currency})</span>
                <span>{currency} {Number(amt).toFixed(2)}</span>
              </div>
            ))}
        </div>

        <div className="text-center text-xs text-dark-light border-t border-dashed border-gray-300 pt-4">
          {t("This receipt confirms salary payment for the month(s) listed above.")}
        </div>
      </div>
    </div>
  );
};

export default SalaryReceipt;
