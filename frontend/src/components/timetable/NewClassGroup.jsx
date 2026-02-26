import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import makeAnimated from "react-select/animated";

// Redux API
import { useCreateClassGroupMutation } from "../../redux/api/classGroupApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetGradesByAcademicLevelQuery } from "../../redux/api/gradesApi";
import { useGetCoursesQuery } from "../../redux/api/courseApi";

// Core UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppInfoBox from "../layout/AppInfoBox";

const animatedComponents = makeAnimated();

// Custom styles for react-select (matching brand colors)
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#f43f5e" : "#d1d5db",
    borderRadius: "0.5rem",
    minHeight: "42px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(244,63,94,0.1)" : "none",
    "&:hover": { borderColor: "#9ca3af" },
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#f43f5e" : isFocused ? "#f3f4f6" : "white",
    color: isSelected ? "white" : "#111827",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f3f4f6",
    borderRadius: "0.25rem",
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#1f2937",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#6b7280",
    "&:hover": { backgroundColor: "#f43f5e", color: "white" },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 10,
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
  }),
};

const NewClassGroup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [classGroup, setClassGroup] = useState({
    academicLevel: "",
    grade: "",
    section: "",
    displayName: "",
    courses: [],
    status: true,
  });

  const [selectedCourseOptions, setSelectedCourseOptions] = useState([]);

  const { academicLevel, grade, section, displayName, courses, status } =
    classGroup;

  // Queries
  const { data: academicLevelsData, isLoading: levelsLoading } =
    useGetAcademicLevelsQuery({ paginate: false });

  const { data: gradesData, isLoading: gradesLoading } =
    useGetGradesByAcademicLevelQuery(academicLevel, {
      skip: !academicLevel,
    });

  const { data: coursesData, isLoading: coursesLoading } =
    useGetCoursesQuery({
      paginate: false,
      limit: 0,
      status: "active",
    });

  // Mutation
  const [createClassGroup, { isLoading: isCreating, error, isSuccess }] =
    useCreateClassGroupMutation();

  // Handle side effects
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating class group"));
    }
    if (isSuccess) {
      toast.success(t("Class group created successfully"));
      navigate("/admin/class-groups");
    }
  }, [error, isSuccess, navigate, t]);

  // Auto‑generate display name
  useEffect(() => {
    if (grade && section && gradesData?.grades?.length) {
      const selectedGrade = gradesData.grades.find((g) => g._id === grade);
      if (selectedGrade) {
        setClassGroup((prev) => ({
          ...prev,
          displayName: `${selectedGrade.gradeName} ${section.toUpperCase()}`,
        }));
      }
    } else {
      setClassGroup((prev) => ({ ...prev, displayName: "" }));
    }
  }, [grade, section, gradesData]);

  // Update selected course options when courses change
  useEffect(() => {
    if (courses.length && coursesData?.courses?.length) {
      const options = courses
        .map((id) => {
          const course = coursesData.courses.find((c) => c._id === id);
          return course
            ? {
                value: course._id,
                label: `${course.courseName} (${course.code || t("No code")}) – ${
                  course.teacher?.name || t("No teacher")
                }`,
              }
            : null;
        })
        .filter(Boolean);
      setSelectedCourseOptions(options);
    } else {
      setSelectedCourseOptions([]);
    }
  }, [courses, coursesData, t]);

  // Reset courses when grade changes (optional, can be removed if not needed)
  useEffect(() => {
    setClassGroup((prev) => ({ ...prev, courses: [] }));
    setSelectedCourseOptions([]);
  }, [grade]);

  // Handlers
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClassGroup((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Basic validation
    if (!academicLevel || !grade || !section) {
      return toast.error(t("Please fill all required fields"));
    }

    createClassGroup(classGroup);
  };

  const handleCourseChange = (selected) => {
    const ids = selected ? selected.map((opt) => opt.value) : [];
    setClassGroup((prev) => ({ ...prev, courses: ids }));
    setSelectedCourseOptions(selected || []);
  };

  // Options for dropdowns
  const academicLevelOptions = useMemo(
    () =>
      academicLevelsData?.levels?.map((level) => ({
        value: level._id,
        label: `${level.name} (${level.code})`,
      })) || [],
    [academicLevelsData]
  );

  const gradeOptions = useMemo(
    () =>
      gradesData?.grades?.map((grade) => ({
        value: grade._id,
        label: `${grade.gradeName} (${t("Year")}: ${grade.year})`,
      })) || [],
    [gradesData]
  );

  const courseOptions = useMemo(
    () =>
      coursesData?.courses?.map((course) => ({
        value: course._id,
        label: `${course.courseName} (${course.code || t("No code")}) – ${
          course.teacher?.name || t("No teacher")
        }`,
      })) || [],
    [coursesData, t]
  );

  return (
    <AdminLayout>
      <MetaData title={t("New Class Group")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Class Group")}
          subtitle={t("Create a new class group and assign courses")}
          backUrl="/admin/class-groups"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard
            title={t("Class Group Information")}
            icon="fa-users"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/class-groups" />
                <AppButton
                  type="submit"
                  label={t("Create Class Group")}
                  loadingLabel={t("Creating...")}
                  isLoading={isCreating}
                  icon="fa-plus-circle"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Level */}
              <SearchableDropdown
                label={t("Academic Level")}
                value={academicLevel}
                onChange={(val) =>
                  setClassGroup((prev) => ({ ...prev, academicLevel: val }))
                }
                options={academicLevelOptions}
                placeholder={t("Select Academic Level")}
                required
                isLoading={levelsLoading}
                showSelected={true}
              />

              {/* Grade */}
              <SearchableDropdown
                label={t("Grade")}
                value={grade}
                onChange={(val) =>
                  setClassGroup((prev) => ({ ...prev, grade: val }))
                }
                options={gradeOptions}
                placeholder={
                  !academicLevel
                    ? t("Select academic level first")
                    : gradesData?.grades?.length
                    ? t("Select Grade")
                    : t("No grades found")
                }
                required
                disabled={!academicLevel || !gradesData?.grades?.length}
                isLoading={gradesLoading}
                showSelected={true}
              />

              {/* Section */}
              <AppInput
                name="section"
                value={section}
                onChange={onChange}
                label={t("Section")}
                placeholder={t("e.g. A, B, C")}
                required
              />

              {/* Display Name (auto‑generated, read‑only) */}
              <AppInput
                name="displayName"
                value={displayName}
                label={t("Display Name")}
                readOnly
                helperText={t("Auto‑generated from grade and section")}
              />

              {/* Status */}
              <div className="flex items-center md:mt-6">
                <AppCheckbox
                  name="status"
                  checked={status}
                  onChange={onChange}
                  label={t("Active")}
                />
              </div>

              {/* Courses Multi‑Select */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Courses")}
                </label>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  options={courseOptions}
                  value={selectedCourseOptions}
                  onChange={handleCourseChange}
                  placeholder={
                    courseOptions.length
                      ? t("Select courses...")
                      : t("No courses available")
                  }
                  isDisabled={!courseOptions.length}
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => t("No options")}
                />
                {selectedCourseOptions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t("Selected")}: {selectedCourseOptions.length}{" "}
                    {t("courses")}
                  </p>
                )}
              </div>
            </div>

            {/* Informational note */}
            <AppInfoBox icon="fa-info-circle">
              <strong>{t("Note")}:</strong>{" "}
              {t(
                "The class group will be linked to the selected grade. Only active courses are shown."
              )}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewClassGroup;