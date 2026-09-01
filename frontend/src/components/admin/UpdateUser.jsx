import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useCountries } from "react-countries";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";

// Redux
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/authApi";

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

const UpdateUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { id } = useParams();

  const { data, isLoading: userLoading } = useGetUserDetailsQuery(id);
  const [updateUser, { isLoading, error, isSuccess }] = useUpdateUserMutation();

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
    dateOfBirth: "",
    accountStatus: "active", // ✅ Changed from status to accountStatus
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
    dateOfBirth,
    accountStatus,
    email,
    password,
  } = user;

  // Age calculation helper
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    return calculatedAge.toString();
  };

  // Prefill user data when fetched
  useEffect(() => {
    if (data?.user) {
      const fetchedUser = data.user;
      setUser({
        role: fetchedUser.role || "user",
        firstName: fetchedUser.firstName || "",
        middleName: fetchedUser.middleName || "",
        lastName: fetchedUser.lastName || "",
        age:
          fetchedUser.age ||
          (fetchedUser.dateOfBirth
            ? calculateAgeFromDOB(fetchedUser.dateOfBirth)
            : ""),
        gender: fetchedUser.gender || "",
        nationality: fetchedUser.nationality || "",
        passportNumber: fetchedUser.passportNumber || "",
        phoneNumber: fetchedUser.phoneNumber
          ? fetchedUser.phoneNumber.replace(/^\+/, "")
          : "",
        secondaryPhoneNumber: fetchedUser.secondaryPhoneNumber
          ? fetchedUser.secondaryPhoneNumber.replace(/^\+/, "")
          : "",
        address: fetchedUser.address || "",
        dateOfBirth: fetchedUser.dateOfBirth
          ? fetchedUser.dateOfBirth.split("T")[0]
          : "",
        accountStatus: fetchedUser.accountStatus || "pending", // ✅ use accountStatus
        email: fetchedUser.email || "",
        password: "",
        avatar: "",
        siblings: fetchedUser.siblings || [],
      });
      setAvatarPreview(fetchedUser.avatar?.url || "");
    }
  }, [data]);

  // Success / Error handlers
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error updating user"));
    }
    if (isSuccess) {
      toast.success(t("User Updated Successfully"));
      navigate("/admin/users");
    }
  }, [error, isSuccess, navigate, t]);

  // Handle date of birth change
  const handleDateOfBirthChange = (e) => {
    const dob = e.target.value;
    setUser((prev) => ({
      ...prev,
      dateOfBirth: dob,
      age: calculateAgeFromDOB(dob),
    }));
  };

  // Handle age manual override (only if user types age manually – but we keep it readOnly)
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
      setUser({ ...user, accountStatus: value }); // value is "active" or "inactive"
    } else if (name === "age") {
      handleAgeChange(e);
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

  // Submit handler
  const submitHandler = (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error(t("First name is required"));
      return;
    }
    if (!lastName.trim()) {
      toast.error(t("Last name is required"));
      return;
    }
    if (!email.trim()) {
      toast.error(t("Email is required"));
      return;
    }
    if (!role) {
      toast.error(t("Please select a role"));
      return;
    }

    const userData = {
      ...user,
      gender: gender ? gender.toLowerCase() : "",
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
      age: age || calculateAgeFromDOB(dateOfBirth),
      accountStatus, // ✅ send accountStatus
    };

    // Remove avatar if empty (no new file selected)
    if (!userData.avatar || userData.avatar === "") {
      delete userData.avatar;
    }

    updateUser({ id, body: userData });
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

  if (userLoading) return <p className="text-center mt-10">{t("Loading...")}</p>;

  return (
    <AdminLayout>
      <MetaData title={t("Update User")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update User")}
          subtitle={t("Modify user account details")}
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
                placeholder={t("Leave blank to keep unchanged")}
                minLength="6"
              />

              {/* Role Select using SearchableDropdown */}
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
                  label={t("Update User")}
                  loadingLabel={t("Updating...")}
                  isLoading={isLoading}
                  icon="fa-user-pen"
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
                placeholder={t("Min 8 characters")}
                pattern="[a-zA-z0-9]{8,14}"
                minLength="8"
                maxLength="14"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")} <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setUser({ ...user, phoneNumber: val })}
                  inputProps={{ maxLength: 13 }}
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
                  onChange={(val) => setUser({ ...user, secondaryPhoneNumber: val })}
                  inputProps={{ maxLength: 13 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

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

              {/* Status Radio - now uses accountStatus */}
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

export default UpdateUser;