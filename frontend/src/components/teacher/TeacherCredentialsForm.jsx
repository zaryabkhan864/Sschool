import React from "react";
import { useTranslation } from "react-i18next";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import { STAFF_STATUS_OPTIONS } from "../../constants/staffStatusOptions";

const TeacherCredentialsForm = ({
  firstName,
  middleName,
  lastName,
  email,
  password,
  status,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <AppCard title={t("Teacher Credentials")} icon="fa-lock">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppInput
          label={t("First Name")}
          name="firstName"
          value={firstName}
          onChange={onChange}
          required
        />
        <AppInput
          label={t("Middle Name")}
          name="middleName"
          value={middleName}
          onChange={onChange}
        />
        <AppInput
          label={t("Last Name")}
          name="lastName"
          value={lastName}
          onChange={onChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <AppInput
          label={t("Email Address")}
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <AppInput
          label={t("Password")}
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder={t("Leave blank to keep current")}
          minLength="6"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-gray-500 uppercase">
            {t("Status")}
          </label>
          <select
            name="status"
            value={status}
            onChange={onChange}
            required
            className="w-full h-[38px] border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            <option value="" disabled>
              {t("Select status")}
            </option>
            {STAFF_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </AppCard>
  );
};

export default TeacherCredentialsForm;