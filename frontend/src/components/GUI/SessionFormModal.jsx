import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../GUI/Modal";
import FormSection from "../GUI/FormSection";
import AppInput from "../GUI/AppInput";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppButton from "../GUI/AppButton";

const SessionFormModal = ({
  isOpen,
  onClose,
  editMode,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  academicLevelOptions,
}) => {
  const { t } = useTranslation();

  const sessionTypeOptions = [
    { value: "CLASS", label: t("Class Session") },
    { value: "BREAK", label: t("Break Time") },
  ];

  const setField = (name, value) => {
    handleInputChange({ target: { name, value } });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMode ? t("Edit Session Template") : t("New Session Template")}
      icon="clock"
      iconColor="blue"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <FormSection
            title={t("Session Details")}
            icon="info-circle"
            iconColor="blue"
            border={false}
            padding="p-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label={t("Session Name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("e.g., 1st Period, Lunch Break")}
                required
              />
              <SearchableDropdown
                label={t("Session Type")}
                value={formData.type}
                onChange={(val) => setField("type", val)}
                options={sessionTypeOptions}
                placeholder={t("Select...")}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AppInput
                label={t("Order Number")}
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                type="number"
                min="1"
                max="100"
                placeholder={t("e.g., 1, 2, 3")}
                required
              />
            </div>
          </FormSection>

          <FormSection
            title={t("Time Settings")}
            icon="clock"
            iconColor="green"
            border={false}
            padding="p-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label={t("Start Time")}
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                type="time"
                required
              />
              <AppInput
                label={t("End Time")}
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                type="time"
                required
              />
            </div>
          </FormSection>

          <FormSection
            title={t("Academic Level")}
            icon="graduation-cap"
            iconColor="purple"
            border={false}
            padding="p-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown
                label={t("Academic Level")}
                value={formData.academicLevel}
                onChange={(val) => setField("academicLevel", val)}
                options={academicLevelOptions}
                placeholder={t("Select Academic Level")}
                required
              />
            </div>
          </FormSection>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-100 flex justify-end gap-3">
          <AppButton
            label="Cancel"
            icon="times"
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={isLoading}
          />
          <AppButton
            label={editMode ? "Update Template" : "Create Template"}
            icon={editMode ? "save" : "plus"}
            variant="primary"
            type="submit"
            isLoading={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default SessionFormModal;
