// components/homework/UpdateHomework.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetHomeworkAssignmentDetailsQuery,
  useUpdateHomeworkAssignmentMutation,
  useGetClassGroupStudentsQuery,
  useGetTeacherClassGroupsAndCoursesQuery,
} from "../../redux/api/homeworkApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetClassGroupsForDropdownQuery } from "../../redux/api/classGroupApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import Loader from "../layout/Loader";
import SearchableDropdown from "../layout/SearchableDropdown";
import StudentMultiSelect from "../GUI/StudentMultiSelect";
import AppInfoBox from "../layout/AppInfoBox";

const TYPE_OPTIONS = [
  { value: "homework", label: "Homework" },
  { value: "assignment", label: "Assignment" },
];

// dueDate comes back as an ISO string — trim to the value <input type="datetime-local"> expects
const toLocalInputValue = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

const UpdateHomework = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    type: "homework",
    title: "",
    description: "",
    academicLevel: "",
    classGroup: "",
    course: "",
    targetType: "all",
    dueDate: "",
    totalMarks: "",
  });
  const [targetStudents, setTargetStudents] = useState([]);

  const { data: homeworkData, isLoading: detailsLoading, error: fetchError } =
    useGetHomeworkAssignmentDetailsQuery(id);

  const [updateHomeworkAssignment, { isLoading: isUpdating, error: updateError, isSuccess }] =
    useUpdateHomeworkAssignmentMutation();

  const { data: academicLevelsData, isLoading: academicLevelsLoading } = useGetAcademicLevelsQuery({
    paginate: false,
  });
  const academicLevels = academicLevelsData?.levels || [];

  const {
    data: classGroupsData,
    isLoading: classGroupsLoading,
    isFetching: classGroupsFetching,
  } = useGetClassGroupsForDropdownQuery(
    { academicLevel: form.academicLevel, status: "active" },
    { skip: !form.academicLevel }
  );

  const { data: roleData } = useGetTeacherClassGroupsAndCoursesQuery();

  const { data: studentsData, isFetching: studentsLoading } = useGetClassGroupStudentsQuery(
    form.classGroup,
    { skip: !form.classGroup || form.targetType !== "individual" }
  );

  // Prefill — including the class group's academicLevel, so the Class
  // Group dropdown's dependent query has something to fetch against.
  useEffect(() => {
    if (homeworkData?.homework) {
      const h = homeworkData.homework;
      setForm({
        type: h.type || "homework",
        title: h.title || "",
        description: h.description || "",
        academicLevel: h.classGroup?.academicLevel?._id || h.classGroup?.academicLevel || "",
        classGroup: h.classGroup?._id || h.classGroup || "",
        course: h.course?._id || h.course || "",
        targetType: h.targetType || "all",
        dueDate: toLocalInputValue(h.dueDate),
        totalMarks: h.totalMarks ?? "",
      });
      setTargetStudents((h.targetStudents || []).map((s) => s._id || s));
    }
  }, [homeworkData]);

  useEffect(() => {
    if (fetchError) toast.error(fetchError?.data?.message || t("Error loading posting"));
  }, [fetchError, t]);

  useEffect(() => {
    if (updateError) toast.error(updateError?.data?.message || t("Error updating posting"));
    if (isSuccess) {
      toast.success(t("Updated successfully"));
      navigate("/teacher/homework");
    }
  }, [updateError, isSuccess, navigate, t]);

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
    if (!form.classGroup) return [];
    const matchedGroup = (roleData?.classGroups || []).find((cg) => cg._id === form.classGroup);
    if (!matchedGroup) return [];
    const myCourseIds = new Set((roleData?.courses || []).map((c) => c._id));
    return (matchedGroup.courses || [])
      .filter((c) => myCourseIds.has(c._id))
      .map((c) => ({ value: c._id, label: `${c.courseName} (${c.code})` }));
  }, [form.classGroup, roleData]);

  const noCoursesHere = form.classGroup && courseOptions.length === 0;

  const handleAcademicLevelChange = (val) => {
    setForm((prev) => ({ ...prev, academicLevel: val, classGroup: "", course: "" }));
    setTargetStudents([]);
  };

  const handleClassGroupChange = (val) => {
    setForm((prev) => ({ ...prev, classGroup: val, course: "" }));
    setTargetStudents([]);
  };

  const handleTargetTypeChange = (val) => {
    setForm((prev) => ({ ...prev, targetType: val }));
    if (val === "all") setTargetStudents([]);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.dueDate) {
      return toast.error(t("Please fill all required fields"));
    }
    if (form.targetType === "individual" && targetStudents.length === 0) {
      return toast.error(t("Please select at least one student"));
    }

    updateHomeworkAssignment({
      id,
      type: form.type,
      title: form.title,
      description: form.description,
      classGroup: form.classGroup,
      course: form.course,
      targetType: form.targetType,
      targetStudents: form.targetType === "individual" ? targetStudents : [],
      dueDate: form.dueDate,
      totalMarks: form.totalMarks === "" ? null : Number(form.totalMarks),
    });
  };

  if (detailsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Edit Homework/Assignment")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Edit Homework / Assignment")}
          subtitle={t("Update this posting")}
          backUrl="/teacher/homework"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard title={t("Class & Course")} icon="fa-chalkboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm-custom font-medium text-dark mb-1.5">{t("Type")}</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.label)}
                    </option>
                  ))}
                </select>
              </div>

              <SearchableDropdown
                label={t("Academic Level")}
                value={form.academicLevel}
                options={academicLevelOptions}
                onChange={handleAcademicLevelChange}
                placeholder={t("Select Level")}
                isLoading={academicLevelsLoading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label={t("Class Group")}
                value={form.classGroup}
                options={classGroupOptions}
                onChange={handleClassGroupChange}
                placeholder={form.academicLevel ? t("Select Class Group") : t("Select an academic level first")}
                isLoading={classGroupsLoading || classGroupsFetching}
                disabled={!form.academicLevel}
                required
              />

              <SearchableDropdown
                label={t("Course")}
                value={form.course}
                options={courseOptions}
                onChange={(val) => setForm((prev) => ({ ...prev, course: val }))}
                placeholder={form.classGroup ? t("Select Course") : t("Select a class group first")}
                disabled={!form.classGroup}
                required
              />
            </div>

            {noCoursesHere && (
              <AppInfoBox icon="fa-exclamation-triangle" className="mt-4">
                {t("You don't teach any course in this class group yet.")}
              </AppInfoBox>
            )}
          </AppCard>

          <AppCard title={t("Target Students")} icon="fa-users">
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm-custom text-dark cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={form.targetType === "all"}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                  />
                  {t("All students in this class group")}
                </label>
                <label className="flex items-center gap-2 text-sm-custom text-dark cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="individual"
                    checked={form.targetType === "individual"}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                  />
                  {t("Specific students")}
                </label>
              </div>

              {form.targetType === "individual" && (
                <StudentMultiSelect
                  students={studentsData?.students || []}
                  selected={targetStudents}
                  onChange={setTargetStudents}
                  isLoading={studentsLoading}
                  label={t("Select Students")}
                />
              )}
            </div>
          </AppCard>

          <AppCard
            title={t("Details")}
            icon="fa-file-alt"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/teacher/homework" label={t("Cancel")} />
                <AppButton
                  type="submit"
                  label={t("Save Changes")}
                  loadingLabel={t("Saving...")}
                  isLoading={isUpdating}
                  icon="fa-save"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppInput
                name="title"
                value={form.title}
                onChange={onChange}
                label={t("Topic / Title")}
                required
              />
              <AppInput
                type="datetime-local"
                name="dueDate"
                value={form.dueDate}
                onChange={onChange}
                label={t("Due Date")}
                required
              />
              <div className="md:col-span-2">
                <AppInput
                  type="textarea"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  label={t("Description")}
                  rows={4}
                  required
                />
              </div>
              <AppInput
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={onChange}
                label={t("Total Marks (optional)")}
                min={0}
              />
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateHomework;
