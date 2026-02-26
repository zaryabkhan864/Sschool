import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../GUI/Modal';
import FormSection from '../GUI/FormSection';
import AppInput from '../GUI/AppInput';      
import FormSelect from '../GUI/FormSelect';
import FormActions from '../GUI/FormActions';

const SessionFormModal = ({
  isOpen,
  onClose,
  editMode,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  academicLevelOptions
}) => {
  const { t } = useTranslation();

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
          <FormSection title={t("Session Details")} icon="info-circle" iconColor="blue" border={false} padding="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label={t("Session Name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("e.g., 1st Period, Lunch Break")}
                required
              />
              <FormSelect
                label={t("Session Type")}
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: "CLASS", label: "Class Session" },
                  { value: "BREAK", label: "Break Time" }
                ]}
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
                // helperText={t("Determines sequence in schedule")} // removed because AppInput doesn't support helperText yet
              />
            </div>
          </FormSection>

          <FormSection title={t("Time Settings")} icon="clock" iconColor="green" border={false} padding="p-0">
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

          <FormSection title={t("Academic Level")} icon="graduation-cap" iconColor="purple" border={false} padding="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label={t("Academic Level")}
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleInputChange}
                options={[
                  { value: "", label: t("Select Academic Level") },
                  ...academicLevelOptions
                ]}
                required
              />
            </div>
          </FormSection>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <FormActions
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel={editMode ? t("Update Template") : t("Create Template")}
            cancelLabel={t("Cancel")}
            isLoading={isLoading}
            submitIcon={editMode ? "save" : "plus"}
            cancelIcon="times"
            submitColor="blue"
            cancelColor="gray"
            align="right"
          />
        </div>
      </form>
    </Modal>
  );
};

export default SessionFormModal;