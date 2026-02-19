import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Redux
import { useRegisterMutation } from "../../redux/api/authApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppSubmitButton from "../GUI/AppSubmitButton";
import AppCancelButton from "../GUI/AppCancelButton";
import SearchableSelect from "../GUI/SearchableSelect";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import AvatarUpload from "../GUI/AvatarUpload";

const NewStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetUserByTypeQuery({ type: "student" });

  // Grade Selection Logic State
  const [gradeSearch, setGradeSearch] = useState("");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const gradeDropdownRef = useRef(null);
  const gradeInputRef = useRef(null);
  const gradeObserver = useRef();

  const [student, setStudent] = useState({
    role: "student",
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    status: true,
    email: "",
    password: "",
    avatar: "",
    siblings: [],
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    name,
    age,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    email,
    password,
  } = student;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  // Age Calculation
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

  // Grades Fetching Logic
  const { data: gradesData, isFetching: gradeLoading } = useGetGradesQuery(
    {
      page: gradePage,
      limit: 10,
      keyword: gradeSearch,
    },
    { skip: !showGradeDropdown && gradeSearch === "" }
  );

  const lastGradeElementRef = useCallback(
    (node) => {
      if (gradeLoading) return;
      if (gradeObserver.current) gradeObserver.current.disconnect();
      gradeObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setGradePage((prev) => prev + 1);
      });
      if (node) gradeObserver.current.observe(node);
    },
    [gradeLoading, hasMore]
  );

  useEffect(() => {
    if (gradesData?.grades) {
      const grades = gradesData.grades;
      setGradesList((prev) => (gradePage === 1 ? grades : [...prev, ...grades]));
      setHasMore(grades.length === 10);
    }
  }, [gradesData, gradePage]);

  const selectedGradeName = useMemo(() => {
    const found = gradesList.find((g) => (g._id || g.id) === grade);
    return found?.gradeName || found?.name || "";
  }, [grade, gradesList]);

  // Handle Success/Error
  useEffect(() => {
    if (error) toast.error(error?.data?.message);
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

  const submitHandler = (e) => {
    e.preventDefault();
    if (!grade) return toast.error(t("Please select a grade"));

    register({
      ...student,
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("New Student")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        <AppPageHeader
          title={t("New Student")}
          subtitle={t("Enroll a new student to the academy")}
          backUrl="/admin/students"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Section 1: Account Info */}
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
                required
                minLength="6"
              />
            </div>
          </AppCard>

          {/* Section 2: Academic & Personal Info */}
          <AppCard
            title={t("Academic & Personal Details")}
            icon="fa-graduation-cap"
            footer={
              <div className="flex justify-end gap-2">
                <AppCancelButton backUrl="/admin/students" />
                <AppSubmitButton
                  label="Enroll Student"
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
                onChange={onChange}
                required
                // Optional: set a max date for students (e.g., min age 3)
                // max={new Date(new Date().setFullYear(new Date().getFullYear() - 3))
                //   .toISOString()
                //   .split("T")[0]}
              />

              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={age}
                readOnly
                helperText="Auto-calculated"
              />

              <NationalitySelect value={nationality} onChange={onChange} />
            </div>

            {/* Row 2: Grade, Primary Contact, Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <SearchableSelect
                label={t("Grade")}
                placeholder="Search grade..."
                searchValue={gradeSearch}
                onSearchChange={(e) => {
                  setGradeSearch(e.target.value);
                  setGradePage(1);
                }}
                showDropdown={showGradeDropdown}
                setShowDropdown={setShowGradeDropdown}
                loading={gradeLoading}
                items={gradesList}
                onSelect={(id, name) => {
                  setStudent({ ...student, grade: id });
                  setShowGradeDropdown(false);
                  setGradeSearch(name);
                }}
                selectedId={grade}
                selectedName={selectedGradeName}
                onClear={() => {
                  setStudent({ ...student, grade: "" });
                  setGradeSearch("");
                }}
                lastElementRef={lastGradeElementRef}
                inputRef={gradeInputRef}
                dropdownRef={gradeDropdownRef}
                required
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

            {/* Row 3: Avatar and Address */}
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
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewStudent;