// src/components/admin/UpdateStudent.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Redux
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/authApi";
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
import AppCheckbox from "../GUI/AppCheckbox";

const UpdateStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { countries } = useCountries();

  // Fetch student details
  const { data, isLoading: detailsLoading, refetch: refetchDetails } =
    useGetUserDetailsQuery(params?.id);

  // Update mutation
  const [updateUser, { isLoading, error, isSuccess }] =
    useUpdateUserMutation();

  // ------------------ Grades (single select) ------------------
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: gradesData, isFetching: gradeLoading } = useGetGradesQuery(
    { page: gradePage, limit: 10, keyword: gradeSearchTerm },
    { skip: !params?.id } // only fetch when we have an ID (component ready)
  );

  useEffect(() => {
    if (gradesData?.grades) {
      const newGrades = gradesData.grades;
      setGradesList((prev) => (gradePage === 1 ? newGrades : [...prev, ...newGrades]));
      setHasMore(newGrades.length === 10);
    }
  }, [gradesData, gradePage]);

  const handleGradeSearch = useCallback((searchValue, page) => {
    setGradeSearchTerm(searchValue);
    setGradePage(page);
    if (page === 1) setGradesList([]);
  }, []);

  const gradeOptions = useMemo(
    () => gradesList.map((g) => ({ value: g._id || g.id, label: g.gradeName || g.name })),
    [gradesList]
  );

  // ------------------ Student state ------------------
  const [student, setStudent] = useState({
    role: "student",
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    nationalID: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    status: true,
    email: "",
    password: "",
    avatar: "",
    siblings: [], // array of student IDs
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    name,
    age,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    nationalID,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    email,
    password,
    siblings,
  } = student;

  // Populate form with fetched student data
  useEffect(() => {
    if (data?.user) {
      const userData = data.user;

      // Format dateOfBirth to YYYY-MM-DD for input[type="date"]
      let formattedDate = "";
      if (userData.dateOfBirth) {
        try {
          const dateObj = new Date(userData.dateOfBirth);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      // Extract sibling IDs if populated
      let siblingIds = [];
      if (Array.isArray(userData.siblings)) {
        siblingIds = userData.siblings.map((sib) =>
          typeof sib === "object" ? sib._id : sib
        );
      }

      setStudent({
        role: "student",
        name: userData.name || "",
        age: userData.age ? userData.age.toString() : "",
        dateOfBirth: formattedDate,
        gender: userData.gender || "",
        nationality: userData.nationality || "",
        passportNumber: userData.passportNumber || "",
        nationalID: userData.nationalID || "",
        phoneNumber: userData.phoneNumber?.replace(/\+/g, "") || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber?.replace(/\+/g, "") || "",
        address: userData.address || "",
        grade: userData.grade?._id || userData.grade || "",
        status: userData.status ?? true,
        email: userData.email || "",
        password: "",
        avatar: userData.avatar?.url || "",
        siblings: siblingIds,
      });
      setAvatarPreview(userData.avatar?.url || "");
    }
  }, [data]);

  // ------------------ Age calculation ------------------
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

  // Handle API response
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error updating student"));
    }
    if (isSuccess) {
      toast.success(t("Student Updated Successfully"));
      navigate("/admin/students");
      refetchDetails();
    }
  }, [error, isSuccess, navigate, refetchDetails, t]);

  // ------------------ Form change handler ------------------
  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "avatar") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setStudent({ ...student, avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } else if (name === "dateOfBirth") {
      setStudent((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: calculateAgeFromDOB(value),
      }));
    } else {
      setStudent({
        ...student,
        [name]:
          type === "radio"
            ? value === "true"
              ? true
              : value === "false"
              ? false
              : value
            : value,
      });
    }
  };

  // ------------------ Siblings management ------------------
  const [siblingSearchTerm, setSiblingSearchTerm] = useState("");
  const [siblingSearchResults, setSiblingSearchResults] = useState([]);

  // Fetch students for sibling search (role=student, dropdown=true to bypass pagination & cookie filters)
  const { data: siblingData, isFetching: siblingLoading } = useGetUserByTypeQuery(
    { type: "student", keyword: siblingSearchTerm, dropdown: true },
    { skip: siblingSearchTerm.length < 2 }
  );

  // Update results when data arrives
  useEffect(() => {
    if (siblingData?.users) {
      const alreadySelectedIds = new Set(siblings);
      // Exclude current student (if ID matches)
      const available = siblingData.users.filter(
        (u) => !alreadySelectedIds.has(u._id) && u._id !== params?.id
      );
      setSiblingSearchResults(available);
    } else {
      setSiblingSearchResults([]);
    }
  }, [siblingData, siblings, params?.id]);

  // Add a sibling
  const addSibling = (studentId, studentName) => {
    if (siblings.includes(studentId)) {
      toast.error(t("Student already added as sibling"));
      return;
    }
    setStudent((prev) => ({
      ...prev,
      siblings: [...prev.siblings, studentId],
    }));
    setSiblingSearchTerm(""); // clear search after adding
  };

  // Remove a sibling
  const removeSibling = (studentId) => {
    setStudent((prev) => ({
      ...prev,
      siblings: prev.siblings.filter((id) => id !== studentId),
    }));
  };

  // ------------------ Submit handler ------------------
  const submitHandler = (e) => {
    e.preventDefault();
    if (!grade) return toast.error(t("Please select a grade"));
    if (!name.trim() || !email.trim()) {
      return toast.error(t("Please fill all required fields"));
    }

    const updateData = {
      ...student,
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
    };

    // Format dateOfBirth to ISO string for backend
    if (updateData.dateOfBirth) {
      try {
        const dateObj = new Date(updateData.dateOfBirth);
        updateData.dateOfBirth = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate()
        ).toISOString();
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }

    // Don't send password if empty (keep existing)
    if (!updateData.password) {
      delete updateData.password;
    }

    // Don't send avatar if it's unchanged (URL string)
    if (updateData.avatar && updateData.avatar.startsWith("http")) {
      delete updateData.avatar;
    }

    updateUser({ id: params?.id, body: updateData });
  };

  if (detailsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">{t("Loading...")}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MetaData title={t("Update Student")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update Student")}
          subtitle={t("Edit student information")}
          backUrl="/admin/students"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Account Credentials Card */}
          <AppCard title={t("Student Credentials")} icon="fa-lock">
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
                placeholder={t("Leave blank to keep current")}
                minLength="6"
              />
            </div>
          </AppCard>

          {/* Academic & Personal Details Card */}
          <AppCard
            title={t("Academic & Personal Details")}
            icon="fa-graduation-cap"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/students" />
                <AppButton
                  type="submit"
                  label={t("Update Student")}
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
                onChange={onChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 4))
                  .toISOString()
                  .split("T")[0]}
              />

              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={age}
                readOnly
                helperText={t("Auto-calculated")}
              />

              <NationalitySelect value={nationality} onChange={onChange} />
            </div>

            {/* Row 2: Passport Number and National ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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

            {/* Row 3: Grade, Primary Contact, Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <SearchableDropdown
                label={t("Grade")}
                placeholder={t("Search grade...")}
                value={grade}
                onChange={(selectedValue) => setStudent({ ...student, grade: selectedValue })}
                onSearch={handleGradeSearch}
                options={gradeOptions}
                isLoading={gradeLoading}
                hasMore={hasMore}
                required
                emptyMessage={t("No results found")}
                loadingMessage={t("Loading...")}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setStudent({ ...student, phoneNumber: val })}
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
                  onChange={(val) => setStudent({ ...student, secondaryPhoneNumber: val })}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

            {/* Siblings Section */}
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
                    // Find the student name from search results if available
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

            {/* Row 4: Avatar and Address */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <AvatarUpload
                preview={avatarPreview}
                onChange={onChange}
                title={t("Student Picture")}
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

            {/* Status Checkbox */}
            <div className="mt-4">
              <AppCheckbox
                name="status"
                checked={student.status}
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

export default UpdateStudent;