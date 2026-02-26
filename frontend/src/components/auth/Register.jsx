import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Redux
import { useRegisterMutation } from "../../redux/api/authApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

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

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetUserByTypeQuery({ type: "user" });

  // Grade search state
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [user, setUser] = useState({
    role: "user",
    name: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    dateOfBirth: "",
    status: true,
    email: "",
    password: "",
    avatar: "",
    siblings: [], // will hold array of student IDs
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    role,
    name,
    age,
    gender,
    nationality,
    passportNumber,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    dateOfBirth,
    status,
    email,
    password,
    siblings,
  } = user;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  // Grade fetch query
  const {
    data: gradesData,
    isFetching: gradeLoading,
    error: gradeError,
  } = useGetGradesQuery(
    {
      page: gradePage,
      limit: 10,
      keyword: gradeSearchTerm,
    }
    // No skip – we want data ready when dropdown opens
  );

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

  // Handle age manual override
  const handleAgeChange = (e) => {
    setUser({ ...user, age: e.target.value });
  };

  // Sync grades list when data arrives
  useEffect(() => {
    if (gradesData?.grades) {
      const newGrades = gradesData.grades;
      setGradesList((prev) => (gradePage === 1 ? newGrades : [...prev, ...newGrades]));
      setHasMore(newGrades.length === 10);
    }
  }, [gradesData, gradePage]);

  // Handle search/scroll from SearchableDropdown
  const handleGradeSearch = useCallback((searchValue, page) => {
    setGradeSearchTerm(searchValue);
    setGradePage(page);
    if (page === 1) {
      setGradesList([]); // clear old results for new search
    }
  }, []);

  // Handle success/error
  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (isSuccess) {
      toast.success(t("User Created Successfully"));
      navigate("/admin/users");
      refetch();
    }
    if (gradeError) {
      toast.error("Failed to load grades");
    }
  }, [error, isSuccess, navigate, refetch, t, gradeError]);

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
    } else if (name === "status") {
      setUser({ ...user, [name]: value === "true" });
    } else if (name === "age") {
      handleAgeChange(e);
    } else if (name === "role") {
      // When role changes to non-student, clear siblings
      if (value !== "student") {
        setUser((prev) => ({ ...prev, role: value, siblings: [] }));
      } else {
        setUser((prev) => ({ ...prev, role: value }));
      }
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

  // ------------------ Siblings management ------------------
  const [siblingSearchTerm, setSiblingSearchTerm] = useState("");
  const [siblingSearchResults, setSiblingSearchResults] = useState([]);

  // Fetch students for sibling search (role=student, dropdown=true)
  const { data: siblingData, isFetching: siblingLoading } = useGetUserByTypeQuery(
    { type: "student", keyword: siblingSearchTerm, dropdown: true },
    { skip: siblingSearchTerm.length < 2 || role !== "student" } // only search when role is student and at least 2 chars
  );

  // Update results when data arrives
  useEffect(() => {
    if (siblingData?.users) {
      const alreadySelectedIds = new Set(siblings);
      const available = siblingData.users.filter((u) => !alreadySelectedIds.has(u._id));
      setSiblingSearchResults(available);
    } else {
      setSiblingSearchResults([]);
    }
  }, [siblingData, siblings]);

  // Add a sibling
  const addSibling = (studentId, studentName) => {
    if (siblings.includes(studentId)) {
      toast.error(t("Student already added as sibling"));
      return;
    }
    setUser((prev) => ({
      ...prev,
      siblings: [...prev.siblings, studentId],
    }));
    setSiblingSearchTerm(""); // clear search after adding
  };

  // Remove a sibling
  const removeSibling = (studentId) => {
    setUser((prev) => ({
      ...prev,
      siblings: prev.siblings.filter((id) => id !== studentId),
    }));
  };

  // Submit handler
  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("User name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }

    const userData = {
      ...user,
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
      age: age || calculateAgeFromDOB(dateOfBirth),
      // siblings is already in user, will be sent only if role === "student"
    };

    register(userData);
  };

  // Prepare options for SearchableDropdown
  const gradeOptions = useMemo(
    () =>
      gradesList.map((g) => ({
        value: g._id || g.id,
        label: g.gradeName || g.name,
      })),
    [gradesList]
  );

  return (
    <AdminLayout>
      <MetaData title={t("New User")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        <AppPageHeader
          title={t("New User")}
          subtitle={t("Create a new user account")}
          backUrl="/admin/users"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Section 1: Account Credentials */}
          <AppCard title={t("Account Credentials")} icon="fa-lock">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                  {t("Role")} *
                </label>
                <select
                  name="role"
                  value={role}
                  onChange={onChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="finance">Finance</option>
                  <option value="principle">Principle</option>
                  <option value="counsellor">Counsellor</option>
                </select>
              </div>
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
                  label="Create User"
                  loadingLabel="Creating..."
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
                helperText="Must be at least 5 years old"
              />

              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={age}
                onChange={onChange}
                min="5"
                max="100"
                helperText="Auto-calculated"
              />

              <NationalitySelect value={nationality} onChange={onChange} />
            </div>

            {/* Row 2: Grade, Passport, Primary Contact, Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <SearchableDropdown
                label={t("Grade")}
                placeholder="Search grade..."
                value={grade}
                onChange={(selectedValue) => setUser({ ...user, grade: selectedValue })}
                onSearch={handleGradeSearch}
                options={gradeOptions}
                isLoading={gradeLoading}
                hasMore={hasMore}
                emptyMessage={t("No results found")}
                loadingMessage={t("Loading...")}
              />

              <AppInput
                label={t("Passport No")}
                name="passportNumber"
                value={passportNumber}
                onChange={onChange}
                placeholder="Min 8 characters"
                pattern="[a-zA-z0-9]{8,14}"
                minLength="8"
                maxLength="14"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setUser({ ...user, phoneNumber: val })}
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
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

            {/* Siblings Section (only for students) */}
            {role === "student" && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fa fa-users text-gray-400"></i>
                  {t("Siblings (Optional)")}
                </h3>

                {/* Search Input */}
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

                {/* Search Results Dropdown */}
                {siblingSearchTerm.length >= 2 && siblingSearchResults.length > 0 && (
                  <ul className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow-sm">
                    {siblingSearchResults.map((s) => (
                      <li
                        key={s._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                        onClick={() => addSibling(s._id, s.name)}
                      >
                        <span>{s.name}</span>
                        <span className="text-gray-400 text-xs">{s.email}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Selected Siblings Chips */}
                {siblings.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {siblings.map((id) => {
                      const sibling = siblingData?.users?.find((u) => u._id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {sibling?.name || id}
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

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                  {t("Status")}
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={status === true || status === "true"}
                      onChange={onChange}
                      className="w-3.5 h-3.5 text-green-600"
                    />
                    <span className="text-xs text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={status === false || status === "false"}
                      onChange={onChange}
                      className="w-3.5 h-3.5 text-red-600"
                    />
                    <span className="text-xs text-gray-700">Inactive</span>
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