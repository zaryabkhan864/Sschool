// src/components/GUI/TerminateContractModal.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import moment from "moment";
import AppInput from "./AppInput";
import AppButton from "./AppButton";

const TerminateContractModal = ({
  isOpen,
  onClose,
  activeContract,
  terminateContract,
}) => {
  const { t } = useTranslation();

  const [terminateData, setTerminateData] = useState({
    endDate: moment().format("YYYY-MM-DD"),
    note: "",
  });
  const [terminateLoading, setTerminateLoading] = useState(false);

  if (!isOpen || !activeContract) return null;

  const handleTerminate = async () => {
    setTerminateLoading(true);
    try {
      await terminateContract({
        id: activeContract._id,
        endDate: new Date(terminateData.endDate).toISOString(),
        note: terminateData.note || undefined,
      }).unwrap();
      toast.success(t("Contract terminated successfully"));
      onClose(); // والدین refetch کریں گے
    } catch (err) {
      toast.error(err?.data?.message || t("Termination failed"));
    } finally {
      setTerminateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-premium w-full max-w-lg p-6 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-600 transition-colors"
        >
          <i className="fa fa-times text-xl"></i>
        </button>

        <h2 className="text-xl-custom font-bold text-ink-900 mb-4">{t("Terminate Contract")}</h2>

        <div className="mb-4 p-3 bg-surface-50 border border-surface-200 rounded-xl text-sm-custom text-ink-700">
          <i className="fa fa-file-contract mr-2 text-ink-400"></i>
          <span className="font-medium">{t("Contract ID")}:</span>{" "}
          {activeContract._id?.slice(-8).toUpperCase()}
          {activeContract.campus?.name && (
            <>
              {" "}&mdash; <span className="font-medium">{t("Campus")}:</span>{" "}
              {activeContract.campus.name}
            </>
          )}
        </div>

        <p className="text-sm-custom text-red-600 mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <i className="fa fa-exclamation-triangle mr-2"></i>
          {t(
            "You are about to terminate the active contract of this employee. This action cannot be undone."
          )}
        </p>

        <div className="space-y-4">
          <AppInput
            label={t("Termination Date")}
            type="date"
            name="endDate"
            value={terminateData.endDate}
            onChange={(e) =>
              setTerminateData({ ...terminateData, endDate: e.target.value })
            }
            required
            max={moment().format("YYYY-MM-DD")}
          />
          <AppInput
            label={t("Note (reason)")}
            name="note"
            value={terminateData.note}
            onChange={(e) =>
              setTerminateData({ ...terminateData, note: e.target.value })
            }
            placeholder={t("Optional reason for termination")}
            type="textarea"
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <AppButton type="button" onClick={onClose} label={t("Cancel")} variant="secondary" />
          <AppButton
            type="button"
            onClick={handleTerminate}
            label={t("Confirm Termination")}
            loadingLabel={t("Terminating...")}
            isLoading={terminateLoading}
            icon="fa-ban"
            variant="danger"
          />
        </div>
      </div>
    </div>
  );
};

export default TerminateContractModal;
