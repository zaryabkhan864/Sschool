import React from "react";
import { useTranslation } from "react-i18next";
import AppButton from "../GUI/AppButton";

const EmploymentActions = ({
  campusLabel,
  activeContract,
  isContractExpired,
  onTransferClick,
  onTerminateClick,
}) => {
  const { t } = useTranslation();

  const terminateDisabled = !activeContract;
  const terminateTitle = terminateDisabled
    ? t(
        "No active contract exists. Please create a new contract for this employee first."
      )
    : "";

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg-custom font-semibold text-gray-800">
        {t("Employment Details")}
      </h3>

      {/* Current campus */}
      <div className="flex items-center justify-between">
        <span className="text-sm-custom text-gray-600">
          {t("Current Campus")}:
        </span>
        <span className="text-sm-custom font-medium text-gray-900">
          {campusLabel}
        </span>
      </div>

      {/* Active contract info */}
      {activeContract ? (
        <div className="border-t pt-3 space-y-2">
          <p className="text-sm-custom text-gray-500">
            {t("Active Contract")}:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm-custom">
            <span className="text-gray-600">{t("Start Date")}:</span>
            <span>
              {new Date(activeContract.startDate).toLocaleDateString()}
            </span>
            <span className="text-gray-600">{t("End Date")}:</span>
            <span>
              {activeContract.endDate
                ? new Date(activeContract.endDate).toLocaleDateString()
                : t("Ongoing")}
            </span>
            <span className="text-gray-600">{t("Status")}:</span>
            <span
              className={`font-medium ${
                activeContract.status === "active"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {activeContract.status}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm-custom text-gray-500 italic">
          {t("No active contract found.")}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <AppButton
          label={t("Transfer Employee")}
          icon="fa-arrows-left-right"
          onClick={onTransferClick}
        />
        <AppButton
          label={t("Terminate Contract")}
          icon="fa-xmark"
          disabled={terminateDisabled}
          title={terminateTitle}
          onClick={onTerminateClick}
        />
      </div>
    </div>
  );
};

export default EmploymentActions;