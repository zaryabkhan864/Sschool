import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useRegisterMutation, useGetUserByTypeQuery } from "../../redux/api/authApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import AvatarUpload from "../GUI/AvatarUpload";
import DatePickerField from "../GUI/DatePickerField";

const NewTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetUserByTypeQuery({ type: "teacher" });
  const [teacher, setTeacher] = useState({
    role: "teacher",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    nationalID: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    email: "",
    password: "",
    address: "",
    avatar: "",
  });

  const [ageDisplay, setAgeDisplay] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    firstName, middleName, lastName, dateOfBirth, gender,
    passportNumber, nationalID, nationality, phoneNumber,
    secondaryPhoneNumber, email, password, address,
  } = teacher;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge.toString();
  };

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating teacher"));
    }
    if (isSuccess) {
      toast.success(t("New Teacher Created Successfully"));
      navigate("/admin/teachers");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "avatar") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setTeacher((prev) => ({ ...prev, avatar: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } else if (name === "dateOfBirth") {
      setAgeDisplay(calculateAgeFromDOB(value));
      setTeacher((prev) => ({ ...prev, dateOfBirth: value }));
    } else {
      setTeacher((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // ✅ Full required‑field validation matching backend
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !dateOfBirth ||
      !gender ||
      !phoneNumber ||
      phoneNumber === "+"  // PhoneInput may leave just a +
    ) {
      return toast.error(t("Please fill all required fields"));
    }

    
    register({
      ...teacher,
      gender: gender.toLowerCase(),
      phoneNumber,                    
      secondaryPhoneNumber,           
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("Create New Teacher")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Teacher")}
          subtitle={t("Onboard a new faculty member")}
          backUrl="/admin/teachers"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* ----- CREDENTIALS ----- */}
          <AppCard title={t("Teacher Credentials")} icon="fa-lock">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AppInput
                label={t("First Name")}
                name="firstName"
                value={firstName}
                onChange={onChange}
                required
                maxLength={25}
              />
              <AppInput
                label={t("Middle Name")}
                name="middleName"
                value={middleName}
                onChange={onChange}
                maxLength={25}
              />
              <AppInput
                label={t("Last Name")}
                name="lastName"
                value={lastName}
                onChange={onChange}
                required
                maxLength={50}
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
                required
                minLength="6"
              />
            </div>
          </AppCard>

          {/* ----- PERSONAL INFO ----- */}
          <AppCard
            title={t("Personal Information")}
            icon="fa-user"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/teachers" />
                <AppButton
                  type="submit"
                  label={t("Create Teacher")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-user-plus"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <GenderRadio value={gender} onChange={onChange} />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Date of Birth")} <span className="text-red-500">*</span>
                </label>
                <DatePickerField
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={onChange}
                  placeholder={t("Select birth date")}
                  max={
                    new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>

              <AppInput
                label={t("Age")}
                type="number"
                name="age"
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
                placeholder={t("Min 6 characters")}
                maxLength={20}
              />
              <AppInput
                label={t("National ID")}
                name="nationalID"
                value={nationalID}
                onChange={onChange}
                placeholder={t("Min 11 Max 20 digits")}
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")} <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setTeacher((prev) => ({ ...prev, phoneNumber: val }))}
                  inputProps={{ maxLength: 17 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg focus:!border-brand-500 focus:!ring-2 focus:!ring-brand-500/20 focus:!shadow-none"
                  containerClass="!w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Emergency Contact")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={secondaryPhoneNumber}
                  onChange={(val) => setTeacher((prev) => ({ ...prev, secondaryPhoneNumber: val }))}
                  inputProps={{ maxLength: 17 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg focus:!border-brand-500 focus:!ring-2 focus:!ring-brand-500/20 focus:!shadow-none"
                  containerClass="!w-full"
                />
              </div>
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
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewTeacher;