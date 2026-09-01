// components/quiz/NewOrFetchQuiz.jsx
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useFetchOrCreateQuizMutation } from "../../redux/api/quizApi";
import { useGetTeacherClassGroupsAndCoursesQuery } from "../../redux/api/homeworkApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetClassGroupsForDropdownQuery } from "../../redux/api/classGroupApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

const NewOrFetchQuiz = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    academicLevel: "",
    classGroup: "",
    course: "",
    quizNumber: "",
    title: "",
    date: "",
    totalQuestions: "",
    marksPerQuestion: "",
  });

  const { academicLevel, classGroup, course, quizNumber, title, date, totalQuestions, marksPerQuestion } =
    form;

  const { data: academicLevelsData, isLoading: academicLevelsLoading } = useGetAcademicLevelsQuery({
    paginate: false,
  });
  const academicLevels = academicLevelsData?.levels || [];

  const {
    data: classGroupsData,
    isLoading: classGroupsLoading,
    isFetching: classGroupsFetching,
  } = useGetClassGroupsForDropdownQuery(
    { academicLevel, status: "active" },
    { skip: !academicLevel }
  );

  // Teacher's own class groups + courses, used to figure out which
  // courses in the selected class group this teacher actually teaches.
  const { data: roleData } = useGetTeacherClassGroupsAndCoursesQuery();

  const [fetchOrCreateQuiz, { isLoading: isFetching }] = useFetchOrCreateQuizMutation();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const academicLevelOptions = useMemo(
    () => academicLevels.map((lvl) => ({ value: lvl._id, label: lvl.name })),
    [academicLevels]
  );

  const classGroupOptions = useMemo(
    () =>
      (classGroupsData || []).map((grp) => ({
        value: grp._id,
        label: grp.displayName || `${grp.grade?.gradeName} - ${grp.section}`,
      })),
    [classGroupsData]
  );

  const courseOptions = useMemo(() => {
    if (!classGroup) return [];
    const matchedGroup = (roleData?.classGroups || []).find((cg) => cg._id === classGroup);
    if (!matchedGroup) return [];
    const myCourseIds = new Set((roleData?.courses || []).map((c) => c._id));
    return (matchedGroup.courses || [])
      .filter((c) => myCourseIds.has(c._id))
      .map((c) => ({ value: c._id, label: `${c.courseName} (${c.code})` }));
  }, [classGroup, roleData]);

  const noCoursesHere = classGroup && courseOptions.length === 0;

  const handleAcademicLevelChange = (val) => {
    setForm((prev) => ({ ...prev, academicLevel: val, classGroup: "", course: "" }));
  };

  const handleClassGroupChange = (val) => {
    setForm((prev) => ({ ...prev, classGroup: val, course: "" }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!classGroup || !course || !quizNumber) {
      return toast.error(t("Please select class group, course and quiz number"));
    }

    try {
      const result = await fetchOrCreateQuiz({
        classGroup,
        course,
        quizNumber: Number(quizNumber),
        title: title || undefined,
        date: date || undefined,
        totalQuestions: totalQuestions ? Number(totalQuestions) : undefined,
        marksPerQuestion: marksPerQuestion ? Number(marksPerQuestion) : undefined,
      }).unwrap();

      toast.success(result.isNew ? t("New quiz created") : t("Existing quiz loaded"));
      navigate(`/teacher/quiz/${result.quiz._id}`);
    } catch (err) {
      toast.error(err?.data?.message || t("Failed to fetch or create quiz"));
    }
  };

  return (
    <AdminLayout>
      <MetaData title={t("New / Fetch Quiz")} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title={t("New / Fetch Quiz")}
          subtitle={t("Pick a class, course and quiz number to get started")}
          backUrl="/teacher/quizzes"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard title={t("Class & Course")} icon="fa-chalkboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SearchableDropdown
                label={t("Academic Level")}
                value={academicLevel}
                options={academicLevelOptions}
                onChange={handleAcademicLevelChange}
                placeholder={t("Select Level")}
                isLoading={academicLevelsLoading}
                required
              />

              <SearchableDropdown
                label={t("Class Group")}
                value={classGroup}
                options={classGroupOptions}
                onChange={handleClassGroupChange}
                placeholder={academicLevel ? t("Select Class Group") : t("Select an academic level first")}
                isLoading={classGroupsLoading || classGroupsFetching}
                disabled={!academicLevel}
                required
              />
            </div>

            <SearchableDropdown
              label={t("Course")}
              value={course}
              options={courseOptions}
              onChange={(val) => setForm((prev) => ({ ...prev, course: val }))}
              placeholder={classGroup ? t("Select Course") : t("Select a class group first")}
              disabled={!classGroup}
              required
            />

            {noCoursesHere && (
              <AppInfoBox icon="fa-exclamation-triangle" className="mt-4">
                {t("You don't teach any course in this class group yet.")}
              </AppInfoBox>
            )}
          </AppCard>

          <AppCard
            title={t("Quiz Details")}
            icon="fa-question-circle"
            footer={
              <div className="flex justify-end">
                <AppButton
                  type="submit"
                  label={t("Fetch / Create Quiz")}
                  loadingLabel={t("Loading...")}
                  isLoading={isFetching}
                  icon="fa-arrow-right"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppInput
                type="number"
                name="quizNumber"
                value={quizNumber}
                onChange={onChange}
                label={t("Quiz Number")}
                placeholder={t("e.g. 1")}
                min={1}
                required
              />
              <AppInput
                type="date"
                name="date"
                value={date}
                onChange={onChange}
                label={t("Date Conducted")}
              />
              <div className="md:col-span-2">
                <AppInput
                  name="title"
                  value={title}
                  onChange={onChange}
                  label={t("Title (optional)")}
                  placeholder={t("e.g. Quiz 1 - Algebra Basics")}
                />
              </div>
              <AppInput
                type="number"
                name="totalQuestions"
                value={totalQuestions}
                onChange={onChange}
                label={t("Number of Questions")}
                placeholder={t("e.g. 5 or 10")}
                min={1}
                max={100}
              />
              <AppInput
                type="number"
                name="marksPerQuestion"
                value={marksPerQuestion}
                onChange={onChange}
                label={t("Marks per Question")}
                placeholder={t("e.g. 2")}
                min={1}
              />
            </div>

            <AppInfoBox icon="fa-info-circle" className="mt-4">
              <strong>{t("Note")}:</strong> —{" "}
              {t(
                "If a quiz with this number already exists for this class/course, it will be loaded as-is. Otherwise a new one is created with the date, question count and marks-per-question you entered — every active student in the class group is added automatically."
              )}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewOrFetchQuiz;
