import React from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import AvatarUpload from "../GUI/AvatarUpload";
import PhoneNumberInput from "../GUI/PhoneNumberInput";

const PersonalInfoForm = ({
  gender,
  dateOfBirth,
  ageDisplay,
  nationality,
  passportNumber,
  nationalID,
  phoneNumber,
  secondaryPhoneNumber,
  avatarPreview,
  address,
  onChange,
  onPhoneChange,
  onSecondaryPhoneChange,
  footerButtons, // optional – passed from parent for submit/back
}) => {
  const { t } = useTranslation();
  const maxDOB = moment().subtract(18, "years").format("YYYY-MM-DD");

  return (
    <AppCard
      title={t("Personal Information")}
      icon="fa-user"
      footer={footerButtons}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <GenderRadio value={gender} onChange={onChange} />
        <AppInput
          label={t("Date of Birth")}
          type="date"
          name="dateOfBirth"
          value={dateOfBirth}
          onChange={onChange}
          required
          max={maxDOB}
        />
        <AppInput
          label={t("Age")}
          type="number"
          value={ageDisplay}
          readOnly
          helperText={t("Auto-calculated")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <NationalitySelect value={nationality} onChange={onChange} />
        <AppInput
          label={t("Passport No")}
          name="passportNumber"
          value={passportNumber}
          onChange={onChange}
          placeholder={t("Min 8 characters")}
        />
        <AppInput
          label={t("National ID")}
          name="nationalID"
          value={nationalID}
          onChange={onChange}
          placeholder={t("Min 11 Max 20 characters")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <PhoneNumberInput
          label={t("Primary Contact")}
          value={phoneNumber}
          onChange={onPhoneChange}
        />
        <PhoneNumberInput
          label={t("Emergency Contact")}
          value={secondaryPhoneNumber}
          onChange={onSecondaryPhoneChange}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <AvatarUpload
          preview={avatarPreview}
          onChange={onChange}
          title={t("Teacher Picture")}
          subtitle={t("Max size 2MB")}
        />
        <AppInput
          label={t("Residential Address")}
          name="address"
          value={address}
          onChange={onChange}
          type="textarea"
          rows={2}
        />
      </div>
    </AppCard>
  );
};

export default PersonalInfoForm;