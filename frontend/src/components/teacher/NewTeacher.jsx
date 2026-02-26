import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Redux
import { useRegisterMutation, useGetUserByTypeQuery } from "../../redux/api/authApi";

// Layout & GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppButton from "../GUI/AppButton";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import AvatarUpload from "../GUI/AvatarUpload";

const NewTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetUserByTypeQuery({ type: "teacher" });

  const [teacher, setTeacher] = useState({
    role: "teacher",
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    nationalID: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    status: true,
    email: "",
    password: "",
    address: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    name,
    age,
    dateOfBirth,
    gender,
    passportNumber,
    nationalID,
    nationality,
    phoneNumber,
    secondaryPhoneNumber,
    email,
    password,
    address,
    status,
  } = teacher;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  // Age calculation from DOB
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
          setTeacher({ ...teacher, avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } else if (name === "dateOfBirth") {
      setTeacher((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: calculateAgeFromDOB(value),
      }));
    } else {
      setTeacher({
        ...teacher,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      return toast.error(t("Please fill all required fields"));
    }
    register({
      ...teacher,
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
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
          {/* Account Credentials Card */}
          <AppCard title={t("Account Credentials")} icon="fa-lock">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AppInput
                label={t("Full Name")}
                name="name"
                value={name}
                onChange={onChange}
                required
              />
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

          {/* Personal Information Card */}
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

              <AppInput
                label={t("Date of Birth")}
                type="date"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={onChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]}
              />
              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={age}
                onChange={onChange}
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
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setTeacher({ ...teacher, phoneNumber: val })}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
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
                  onChange={(val) => setTeacher({ ...teacher, secondaryPhoneNumber: val })}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <AvatarUpload preview={avatarPreview} onChange={onChange} />

              <AppInput
                label={t("Residential Address")}
                name="address"
                value={address}
                onChange={onChange}
                type="textarea"
                rows={2}
              />
            </div>
            {/* Status checkbox matching NewGrade style */}
            <div className="mt-4">
              <AppCheckbox
                name="status"
                checked={status}
                onChange={onChange}
                label={t("Active")}
              />
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewTeacher;