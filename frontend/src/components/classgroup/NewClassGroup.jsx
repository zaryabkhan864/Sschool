import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCreateClassGroupMutation } from "../../redux/api/classGroupApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetGradesByAcademicLevelQuery } from "../../redux/api/gradesApi";
import { useGetCoursesQuery } from "../../redux/api/courseApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppButton from "../GUI/AppButton";
import AppInfoBox from "../layout/AppInfoBox";
import SearchableDropdown from "../layout/SearchableDropdown";

// ✅ User model has no `name` field — only firstName/middleName/lastName
const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const NewClassGroup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [classGroup, setClassGroup] = useState({
    academicLevel: "",
    grade: "",
    section: "",
    displayName: "",
    isActive: true,
    courses: [],
  });

  const [levelSearch, setLevelSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const { academicLevel, grade, section, displayName, isActive, courses } = classGroup;

  // ── API ──────────────────────────────────────────────────────────────────
  const [createClassGroup, { isLoading, error, isSuccess }] =
    useCreateClassGroupMutation();

  const { data: levelsData, isFetching: levelsLoading } = useGetAcademicLevelsQuery({
    paginate: "false",
    keyword: levelSearch,
  });

  // ✅ Use existing endpoint — takes academicLevelId directly
  const { data: gradesData, isFetching: gradesLoading } =
    useGetGradesByAcademicLevelQuery(academicLevel, {
      skip: !academicLevel,
    });

  const { data: coursesData, isFetching: coursesLoading } = useGetCoursesQuery(
    { limit: 0, keyword: courseSearch },
    { skip: !grade }
  );

  // ── Side effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error creating class group"));
    if (isSuccess) {
      toast.success(t("Class Group Created Successfully"));
      navigate("/admin/class-groups");
    }
  }, [error, isSuccess, navigate, t]);

  // Auto-generate displayName from grade name + section
  useEffect(() => {
    if (grade && section) {
      const gradeObj = (gradesData?.grades || []).find((g) => g._id === grade);
      const gradeLabel = gradeObj?.gradeName || gradeObj?.name || "";
      setClassGroup((prev) => ({
        ...prev,
        displayName: `${gradeLabel} ${section}`.trim(),
      }));
    }
  }, [grade, section, gradesData]);

  // Reset grade + courses when academic level changes
  useEffect(() => {
    setClassGroup((prev) => ({ ...prev, grade: "", courses: [] }));
  }, [academicLevel]);

  // Reset courses when grade changes
  useEffect(() => {
    setClassGroup((prev) => ({ ...prev, courses: [] }));
  }, [grade]);

  // ── Options ───────────────────────────────────────────────────────────────
  const levelOptions = useMemo(
    () =>
      (levelsData?.levels || []).map((lvl) => ({
        value: lvl._id,
        label: lvl.name,
        subtitle: lvl.code,
      })),
    [levelsData]
  );

  // ✅ FIX 1: Grade label was "1 (Year: undefined)" — now just gradeName
  const gradeOptions = useMemo(
    () =>
      (gradesData?.grades || []).map((g) => ({
        value: g._id,
        label: g.gradeName || g.name || `Grade ${g.order || ""}`,
        subtitle: g.academicLevel?.name,
      })),
    [gradesData]
  );

  // ✅ FIX 2: course.teacher?.name doesn't exist — use firstName only
  const courseOptions = useMemo(
    () =>
      (coursesData?.courses || []).map((c) => {
        const teacherFirst = c.teacher?.firstName || null;
        return {
          value: c._id,
          label: `${c.courseName} (${c.code})${teacherFirst ? ` – ${teacherFirst}` : ""}`,
        };
      }),
    [coursesData]
  );

  const selectedCourseObjects = useMemo(
    () => courseOptions.filter((opt) => courses.includes(opt.value)),
    [courseOptions, courses]
  );

  const handleCourseSelect = (val) => {
    if (!val || courses.includes(val)) return;
    setClassGroup((prev) => ({ ...prev, courses: [...prev.courses, val] }));
  };

  const handleRemoveCourse = (courseId) => {
    setClassGroup((prev) => ({
      ...prev,
      courses: prev.courses.filter((id) => id !== courseId),
    }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitHandler = (e) => {
    e.preventDefault();
    if (!academicLevel || !grade || !section.trim()) {
      return toast.error(t("Academic Level, Grade and Section are required"));
    }
    createClassGroup(classGroup);
  };

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
                <AppButton backUrl="/admin/class-groups" label={t("Cancel")} />
                <AppButton
                  type="submit"
                  label={t("Create Class Group")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
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
                options={levelOptions}
                onChange={(val) =>
                  setClassGroup((prev) => ({ ...prev, academicLevel: val }))
                }
                onSearch={setLevelSearch}
                placeholder={t("Select Academic Level")}
                isLoading={levelsLoading}
                required
              />

              {/* Grade — filtered by academicLevel */}
              <SearchableDropdown
                label={t("Grade")}
                value={grade}
                options={gradeOptions}
                onChange={(val) =>
                  setClassGroup((prev) => ({ ...prev, grade: val }))
                }
                placeholder={
                  !academicLevel
                    ? t("Select Academic Level first")
                    : t("Select Grade")
                }
                isLoading={gradesLoading}
                disabled={!academicLevel}
                required
              />

              {/* Section */}
              <AppInput
                label={t("Section")}
                name="section"
                value={section}
                onChange={(e) =>
                  setClassGroup((prev) => ({
                    ...prev,
                    section: e.target.value.toUpperCase(),
                  }))
                }
                placeholder={t("e.g. A, B, C")}
                maxLength={5}
                required
              />

              {/* Display Name */}
              <div>
                <AppInput
                  label={t("Display Name")}
                  name="displayName"
                  value={displayName}
                  onChange={(e) =>
                    setClassGroup((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder={t("Auto-generated from grade and section")}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t("Auto-generated from grade and section")}
                </p>
              </div>
            </div>

            {/* Active */}
            <div className="mt-4">
              <AppCheckbox
                name="isActive"
                checked={isActive}
                onChange={(e) =>
                  setClassGroup((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                label={t("Active")}
              />
            </div>

            {/* Courses multi-select */}
            <div className="mt-6">
              <label className="block text-xs-custom font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                {t("Courses")}
              </label>

              <div className="w-full min-h-[44px] flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                {selectedCourseObjects.map((c) => (
                  <span
                    key={c.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-xs-custom font-medium"
                  >
                    {c.label}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c.value)}
                      className="ml-1 text-brand-400 hover:text-brand-700"
                    >
                      <i className="fa fa-times text-[10px]"></i>
                    </button>
                  </span>
                ))}

                <div className="flex-1 min-w-[160px]">
                  <SearchableDropdown
                    value=""
                    options={courseOptions.filter((o) => !courses.includes(o.value))}
                    onChange={handleCourseSelect}
                    onSearch={setCourseSearch}
                    placeholder={
                      !grade
                        ? t("Select a grade first")
                        : t("Search and add course...")
                    }
                    isLoading={coursesLoading}
                    disabled={!grade}
                    clearAfterSelect
                  />
                </div>

                {courses.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setClassGroup((prev) => ({ ...prev, courses: [] }))
                    }
                    className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors"
                    title={t("Clear all")}
                  >
                    <i className="fa fa-times"></i>
                  </button>
                )}
              </div>

              {courses.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {t("Selected")}: {courses.length} {t("Courses")}
                </p>
              )}
            </div>

            <AppInfoBox icon="fa-info-circle" className="mt-6">
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
