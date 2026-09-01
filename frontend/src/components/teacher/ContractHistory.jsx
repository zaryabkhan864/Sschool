import React from "react";
import { useTranslation } from "react-i18next";

const ContractHistory = ({ contracts, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm-custom text-gray-500">
          {t("Loading contract history...")}
        </p>
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg-custom font-semibold text-gray-800 mb-4">
          {t("Contract History")}
        </h3>
        <p className="text-sm-custom text-gray-500">
          {t("No previous contracts found.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg-custom font-semibold text-gray-800 mb-4">
        {t("Contract History")}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm-custom">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-2 px-3 text-xs-custom font-semibold text-gray-600 uppercase tracking-wider">
                {t("Campus")}
              </th>
              <th className="text-left py-2 px-3 text-xs-custom font-semibold text-gray-600 uppercase tracking-wider">
                {t("Start Date")}
              </th>
              <th className="text-left py-2 px-3 text-xs-custom font-semibold text-gray-600 uppercase tracking-wider">
                {t("End Date")}
              </th>
              <th className="text-left py-2 px-3 text-xs-custom font-semibold text-gray-600 uppercase tracking-wider">
                {t("Status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contracts.map((contract) => (
              <tr key={contract._id} className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm-custom font-medium text-gray-900">
                  {contract.campus?.name || contract.campus || t("Unknown campus")}
                </td>
                <td className="py-2 px-3 text-sm-custom text-gray-700">
                  {contract.startDate
                    ? new Date(contract.startDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-2 px-3 text-sm-custom text-gray-700">
                  {contract.endDate
                    ? new Date(contract.endDate).toLocaleDateString()
                    : t("Ongoing")}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs-custom font-semibold ${
                      contract.status === "active"
                        ? "bg-green-100 text-green-800"
                        : contract.status === "expired"
                        ? "bg-yellow-100 text-yellow-800"
                        : contract.status === "terminated"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractHistory;