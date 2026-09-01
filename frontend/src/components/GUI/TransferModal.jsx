// src/components/GUI/TransferModal.jsx
import React, { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import moment from "moment";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppInput from "./AppInput";
import AppButton from "./AppButton";

// Backend User model ke role enum ke mutabiq complete list
const ALL_ROLES = [
  "student",
  "teacher",
  "coordinator",
  "principle",
  "vice_principal",
  "finance",
  "admin",
  "manager",
  "assistant",
  "librarian",
  "counselor",
  "it_support",
  "security",
  "maintenance",
  "superadmin",
];

const TransferModal = ({
  isOpen,
  onClose,
  employeeId,
  transferEmployee,
  campusOptions,
  campusesLoading,
  onCampusSearch,
  activeContract,
}) => {
  const { t } = useTranslation();

  const [transferData, setTransferData] = useState({
    newCampusId: "",
    transferDate: moment().format("YYYY-MM-DD"),
    newRole: "",
    newBaseSalary: "",
  });
  const [transferLoading, setTransferLoading] = useState(false);

  // Role options array with translated labels
  const roleOptions = useMemo(
    () =>
      ALL_ROLES.map((role) => ({
        value: role,
        label: t(role), // e.g., "teacher" => "Teacher" (agar translation file mein hai)
      })),
    [t]
  );

  if (!isOpen) return null;

  const handleTransfer = async () => {
    if (!transferData.newCampusId || !transferData.transferDate) {
      return toast.error(t("Please fill all required transfer fields"));
    }
    setTransferLoading(true);
    try {
      await transferEmployee({
        employeeId,
        newCampusId: transferData.newCampusId,
        transferDate: new Date(transferData.transferDate).toISOString(),
        newRole: transferData.newRole || undefined,
        newBaseSalary: transferData.newBaseSalary
          ? Number(transferData.newBaseSalary)
          : undefined,
      }).unwrap();
      toast.success(t("Teacher transferred successfully"));
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || t("Transfer failed"));
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-premium w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-600 transition-colors"
        >
          <i className="fa fa-times text-xl"></i>
        </button>

        <h2 className="text-xl-custom font-bold mb-4 text-ink-900">
          {t("Transfer Employee")}
        </h2>

        {/* Info box */}
        <div
          className={`text-sm-custom mb-4 p-3 rounded-xl border ${
            activeContract
              ? "bg-orange-50 border-orange-200 text-orange-800"
              : "bg-brand-50 border-brand-200 text-brand-800"
          }`}
        >
          <i className="fa fa-info-circle mr-1"></i>
          {activeContract
            ? t(
                "Employee has an active contract. Transferring will update their campus and mark them as transferred. The new campus admin should update the contract."
              )
            : t(
                "No active contract found. A new contract will be created at the destination campus."
              )}
        </div>

        <div className="space-y-4">
          {/* New Campus (SearchableDropdown already as per theme) */}
          <SearchableDropdown
            label={t("New Campus")}
            value={transferData.newCampusId}
            onChange={(val) =>
              setTransferData({ ...transferData, newCampusId: val })
            }
            onSearch={onCampusSearch}
            options={campusOptions}
            isLoading={campusesLoading}
            placeholder={t("Select campus")}
            required
          />

          {/* Transfer Date */}
          <AppInput
            label={t("Transfer Date")}
            type="date"
            name="transferDate"
            value={transferData.transferDate}
            onChange={(e) =>
              setTransferData({ ...transferData, transferDate: e.target.value })
            }
            required
            max={moment().format("YYYY-MM-DD")}
          />

          {/* ✨ Role dropdown ab SearchableDropdown jaisa dikhega */}
          {!activeContract && (
            <>
              <SearchableDropdown
                label={t("Role for new contract")}
                value={transferData.newRole}
                onChange={(val) =>
                  setTransferData({ ...transferData, newRole: val })
                }
                options={roleOptions}
                placeholder={t("Select role")}
                emptyMessage={t("No roles found")}
                loadingMessage={t("Loading...")}
                // onSearch nahi diya → client‑side filtering automatically ho jayegi
                // clearable default true hai, to clear button bhi show hoga
              />

              <AppInput
                label={t("Base Salary for new contract")}
                type="number"
                name="newBaseSalary"
                value={transferData.newBaseSalary}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    newBaseSalary: e.target.value,
                  })
                }
                placeholder="0"
                min="0"
              />
            </>
          )}
        </div>

        {/* Action buttons */}
        {/* ✅ FIX: both buttons previously omitted `variant`, so both
            silently fell back to AppButton's default "primary" — Cancel
            looked like a call-to-action, and Confirm Transfer additionally
            had a manual bg-orange-500 className fighting primary's own
            background classes (same collision bug as PrintLayout /
            TerminateContractModal). Now Cancel is "secondary" and Confirm
            uses AppButton's new "warning" variant, no manual overrides. */}
        <div className="flex justify-end gap-3 pt-6">
          <AppButton
            type="button"
            onClick={onClose}
            label={t("Cancel")}
            variant="secondary"
          />
          <AppButton
            type="button"
            onClick={handleTransfer}
            label={t("Confirm Transfer")}
            loadingLabel={t("Transferring...")}
            isLoading={transferLoading}
            icon="fa-exchange-alt"
            variant="warning"
          />
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
