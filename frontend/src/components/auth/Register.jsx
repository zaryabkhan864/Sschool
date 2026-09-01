import React, { useEffect, useState, useMemo } from "react";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Redux
import { useRegisterMutation, useGetUserByTypeQuery } from "../../redux/api/authApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import AvatarUpload from "../GUI/AvatarUpload";
import SearchableDropdown from "../layout/SearchableDropdown";

// ✅ User model has no `name` field — build from parts
const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetUserByTypeQuery({ type: "user" });

  // Role search state
  const [roleSearchTerm, setRoleSearchTerm] = useState("");

  const [user, setUser] = useState({
    role: "user",
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    dateOfBirth: "",
    accountStatus: "active",
    email: "",
    password: "",
    avatar: "",
    siblings: [],
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    role,
    firstName,
    middleName,
    lastName,
    age,
    gender,
    nationality,
    passportNumber,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    dateOfBirth,
    accountStatus,
    email,
    password,
    siblings,
  } = user;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  // Age calculation
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

  // Handle date of birth change
  const handleDateOfBirthChange = (e) => {
    const dob = e.target.value;
    setUser((prev) => ({
      ...prev,
      dateOfBirth: dob,
      age: calculateAgeFromDOB(dob),
    }));
  };

  // Handle age manual override (though age is readOnly)
  const handleAgeChange = (e) => {
    setUser({ ...user, age: e.target.value });
  };

  // Handle role change
  const handleRoleChange = (selectedValue) => {
    if (selectedValue !== "student") {
      setUser((prev) => ({ ...prev, role: selectedValue, siblings: [] }));
    } else {
      setUser((prev) => ({ ...prev, role: selectedValue }));
    }
  };

  // Handle success/error
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error creating user"));
    if (isSuccess) {
      toast.success(t("User Created Successfully"));
      navigate("/admin/users");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  // General onChange handler
  const onChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "avatar") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setUser({ ...user, avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } else if (name === "accountStatus") {
      setUser({ ...user, accountStatus: value });
    } else if (name === "age") {
      handleAgeChange(e);
    } else if (name === "passportNumber") {
      // Auto-uppercase to match backend
      setUser({ ...user, passportNumber: value.toUpperCase() });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  // Date constraints
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setFullYear(today.getFullYear() - 5));
    return maxDate.toISOString().split("T")[0];
  };
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.setFullYear(today.getFullYear() - 100));
    return minDate.toISOString().split("T")[0];
  };

  // ------------------ Siblings management (still present, but unreachable) ------------------
  const [siblingSearchTerm, setSiblingSearchTerm] = useState("");
  const [siblingSearchResults, setSiblingSearchResults] = useState([]);

  const { data: siblingData, isFetching: siblingLoading } = useGetUserByTypeQuery(
    { type: "student", keyword: siblingSearchTerm, dropdown: true },
    { skip: siblingSearchTerm.length < 2 || role !== "student" }
  );

  useEffect(() => {
    if (siblingData?.users) {
      const alreadySelectedIds = new Set(siblings);
      const available = siblingData.users.filter((u) => !alreadySelectedIds.has(u._id));
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
    setUser((prev) => ({
      ...prev,
      siblings: [...prev.siblings, studentId],
    }));
    setSiblingSearchTerm("");
  };

  const removeSibling = (studentId) => {
    setUser((prev) => ({
      ...prev,
      siblings: prev.siblings.filter((id) => id !== studentId),
    }));
  };

  // Submit handler with full validation
  const submitHandler = (e) => {
    e.preventDefault();

    // Trim strings for accurate checking
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Required field checks (same style as NewTeacher)
    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedPassword ||
      !dateOfBirth ||
      !gender ||
      !phoneNumber ||
      phoneNumber === "+"  // PhoneInput may leave just a +
    ) {
      return toast.error(t("Please fill all required fields"));
    }

    // Updated passport validation: backend uses min 6, max 20 alphanumeric
    if (passportNumber && !/^[a-zA-Z0-9]{6,20}$/.test(passportNumber)) {
      return toast.error(t("Passport number must be 6-20 alphanumeric characters"));
    }

    // Role is required
    if (!role) {
      return toast.error(t("Please select a role"));
    }

    // Build final user data
    const userData = {
      ...user,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      password: trimmedPassword,
      gender: gender.toLowerCase(),
      phoneNumber: phoneNumber,                // PhoneInput already includes +
      secondaryPhoneNumber: secondaryPhoneNumber || "",
      age: age || calculateAgeFromDOB(dateOfBirth),
      accountStatus,
      passportNumber: passportNumber.trim().toUpperCase(),
    };

    register(userData);
  };

  // Role options – Student and Teacher removed
  const roleOptions = useMemo(
    () => [
      { value: "user", label: t("User") },
      { value: "admin", label: t("Admin") },
      { value: "finance", label: t("Finance") },
      { value: "principle", label: t("Principle") },
      { value: "counselor", label: t("Counselor") },
    ],
    [t]
  );

  // Filter role options based on search term
  const filteredRoleOptions = useMemo(() => {
    if (!roleSearchTerm.trim()) return roleOptions;
    return roleOptions.filter((opt) =>
      opt.label.toLowerCase().includes(roleSearchTerm.toLowerCase())
    );
  }, [roleOptions, roleSearchTerm]);

  return (
    <AdminLayout>
      <MetaData title={t("New User")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New User")}
          subtitle={t("Create a new user account")}
          backUrl="/admin/users"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Section 1: Account Credentials */}
          <AppCard title={t("Account Credentials")} icon="fa-lock">
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

              {/* Role Select - using SearchableDropdown */}
              <SearchableDropdown
                label={t("Role")}
                placeholder={t("Select Role")}
                value={role}
                onChange={handleRoleChange}
                onSearch={(searchValue) => setRoleSearchTerm(searchValue)}
                options={filteredRoleOptions}
                isLoading={false}
                hasMore={false}
                emptyMessage={t("No role found")}
                loadingMessage=""
              />
            </div>
          </AppCard>

          {/* Section 2: Personal Information */}
          <AppCard
            title={t("Personal Information")}
            icon="fa-user"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/users" />
                <AppButton
                  type="submit"
                  label={t("Create User")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-user-plus"
                />
              </div>
            }
          >
            {/* Row 1: Gender, DOB, Age, Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GenderRadio value={gender} onChange={onChange} />

              <AppInput
                label={t("Date of Birth")}
                type="date"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={handleDateOfBirthChange}
                required
                max={getMaxDate()}
                min={getMinDate()}
                helperText={t("Must be at least 5 years old")}
              />

              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={age}
                onChange={onChange}
                min="5"
                max="100"
                helperText={t("Auto-calculated")}
                readOnly
              />

              <NationalitySelect value={nationality} onChange={onChange} />
            </div>

            {/* Row 2: Passport, Primary Contact, Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <AppInput
                label={t("Passport No")}
                name="passportNumber"
                value={passportNumber}
                onChange={onChange}
                placeholder={t("Min 6 characters")}
                pattern="[a-zA-Z0-9]{6,20}"
                minLength="6"
                maxLength="20"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")} <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setUser({ ...user, phoneNumber: val })}
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
                  onChange={(val) => setUser({ ...user, secondaryPhoneNumber: val })}
                  inputProps={{ maxLength: 17 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg focus:!border-brand-500 focus:!ring-2 focus:!ring-brand-500/20 focus:!shadow-none"
                  containerClass="!w-full"
                />
              </div>
            </div>

            {/* Siblings Section (only for students) – unreachable because student role removed */}
            {role === "student" && (
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
            )}

            {/* Row 3: Avatar, Address, Status */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <AvatarUpload
                preview={avatarPreview}
                onChange={onChange}
                title={t("Profile Picture")}
                subtitle="Max size 2MB (JPG/PNG)"
              />

              <AppInput
                label={t("Residential Address")}
                name="address"
                value={address}
                onChange={onChange}
                type="textarea"
                rows={2}
              />

              {/* Status Radio - using accountStatus */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Status")}
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountStatus"
                      value="active"
                      checked={accountStatus === "active"}
                      onChange={onChange}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{t("Active")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountStatus"
                      value="inactive"
                      checked={accountStatus === "inactive"}
                      onChange={onChange}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{t("Inactive")}</span>
                  </label>
                </div>
              </div>
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Register;