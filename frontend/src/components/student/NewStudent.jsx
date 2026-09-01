import React, { useEffect, useState } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
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

// ✅ User model has no `name` field — build from parts
const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const NewStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetUserByTypeQuery({ type: "student" });

  const [student, setStudent] = useState({
    role: "student",
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",       // ✅ added
    motherName: "",       // ✅ added
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    nationalID: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    email: "",
    password: "",
    avatar: "",
    siblings: [],
  });

  // ✅ age is display-only — NOT part of model, NOT sent to backend
  const [ageDisplay, setAgeDisplay] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    firstName, middleName, lastName, fatherName, motherName, // ✅ added
    dateOfBirth, gender,
    nationality, passportNumber, nationalID, phoneNumber,
    secondaryPhoneNumber, address, email, password, siblings,
  } = student;

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

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error creating student"));
    if (isSuccess) {
      toast.success(t("New Student Enrolled Successfully"));
      navigate("/admin/students");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "avatar") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setStudent((prev) => ({ ...prev, avatar: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } else if (name === "dateOfBirth") {
      setAgeDisplay(calculateAgeFromDOB(value));
      setStudent((prev) => ({ ...prev, dateOfBirth: value }));
    } else {
      setStudent((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Sibling search
  const [siblingSearchTerm, setSiblingSearchTerm] = useState("");
  const [siblingSearchResults, setSiblingSearchResults] = useState([]);

  const { data: siblingData, isFetching: siblingLoading } = useGetUserByTypeQuery(
    { type: "student", keyword: siblingSearchTerm, dropdown: true },
    { skip: siblingSearchTerm.length < 2 }
  );

  useEffect(() => {
    if (siblingData?.users) {
      const alreadySelectedIds = new Set(siblings);
      const available = siblingData.users.filter(
        (u) => !alreadySelectedIds.has(u._id)
      );
      setSiblingSearchResults(available);
    } else {
      setSiblingSearchResults([]);
    }
  }, [siblingData, siblings]);

  const addSibling = (studentId) => {
    if (siblings.includes(studentId)) {
      toast.error(t("Student already added as sibling"));
      return;
    }
    setStudent((prev) => ({ ...prev, siblings: [...prev.siblings, studentId] }));
    setSiblingSearchTerm("");
  };

  const removeSibling = (studentId) => {
    setStudent((prev) => ({
      ...prev,
      siblings: prev.siblings.filter((id) => id !== studentId),
    }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // ✅ Validate all required fields per backend model
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !dateOfBirth ||
      !gender ||
      !nationality ||
      !phoneNumber.trim()
    ) {
      return toast.error(t("Please fill all required fields"));
    }

    register({
      ...student,
      // ✅ gender must be lowercase — model enum: "male"/"female"/"other"
      gender: gender.toLowerCase(),
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
      // ✅ age excluded — not a model field
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("New Student")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Student")}
          subtitle={t("Enroll a new student to the academy")}
          backUrl="/admin/students"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* ── Student Credentials ── */}
          <AppCard title={t("Student Credentials")} icon="fa-lock">
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

            {/* ✅ Parent Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AppInput
                label={t("Father Name")}
                name="fatherName"
                value={fatherName}
                onChange={onChange}
                maxLength={50}
                placeholder={t("Optional")}
              />
              <AppInput
                label={t("Mother Name")}
                name="motherName"
                value={motherName}
                onChange={onChange}
                maxLength={50}
                placeholder={t("Optional")}
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

          {/* ── Academic & Personal Details ── */}
          <AppCard
            title={t("Academic & Personal Details")}
            icon="fa-graduation-cap"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/students" />
                <AppButton
                  type="submit"
                  label={t("Enroll Student")}
                  loadingLabel={t("Enrolling...")}
                  isLoading={isLoading}
                  icon="fa-user-plus"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GenderRadio value={gender} onChange={onChange} />
              <AppInput
                label={t("Date of Birth")}
                type="date"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={onChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 4))
                  .toISOString()
                  .split("T")[0]}
              />
              {/* age display only */}
              <AppInput
                label={t("Age")}
                type="number"
                value={ageDisplay}
                readOnly
                helperText={t("Auto-calculated")}
              />
              <NationalitySelect value={nationality} onChange={onChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
                  onChange={(val) => setStudent((prev) => ({ ...prev, phoneNumber: val }))}
                  inputProps={{ maxLength: 17 }}      
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
                  onChange={(val) => setStudent((prev) => ({ ...prev, secondaryPhoneNumber: val }))}
                  inputProps={{ maxLength: 17 }}     
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

            {/* Siblings */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i className="fa fa-users text-gray-400"></i>
                {t("Siblings (Optional)")}
              </h3>

              <div className="relative">
                <AppInput
                  label={t("Search for a student")}
                  placeholder={t("Type at least 2 characters...")}
                  value={siblingSearchTerm}
                  onChange={(e) => setSiblingSearchTerm(e.target.value)}
                />
                {siblingLoading && (
                  <div className="absolute right-3 top-9">
                    <i className="fa fa-spinner fa-spin text-gray-400"></i>
                  </div>
                )}
              </div>

              {siblingSearchTerm.length >= 2 && siblingSearchResults.length > 0 && (
                <ul className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow-sm">
                  {siblingSearchResults.map((s) => (
                    <li
                      key={s._id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                      onClick={() => addSibling(s._id)}
                    >
                      <span>{getFullName(s)}</span>
                      <span className="text-gray-400 text-xs">{s.email}</span>
                    </li>
                  ))}
                </ul>
              )}

              {siblings.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {siblings.map((id) => {
                    const sibling = siblingData?.users?.find((u) => u._id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {sibling ? getFullName(sibling) : id}
                        <button
                          type="button"
                          onClick={() => removeSibling(id)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <i className="fa fa-times-circle"></i>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <AvatarUpload preview={avatarPreview} onChange={onChange} title={t("Student Picture")} subtitle={t("Max size 2MB")} />
              <AppInput label={t("Residential Address")} name="address" value={address} onChange={onChange} type="textarea" rows={2} />
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewStudent;