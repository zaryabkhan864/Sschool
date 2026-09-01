// components/homework/NewHomework.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux API
import {
  useCreateHomeworkAssignmentMutation,
  useGetClassGroupStudentsQuery,
  useGetTeacherClassGroupsAndCoursesQuery,
} from "../../redux/api/homeworkApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetClassGroupsForDropdownQuery } from "../../redux/api/classGroupApi";

// Core UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";
import StudentMultiSelect from "../GUI/StudentMultiSelect";
import FileUpload from "../UploadFile";

const TYPE_OPTIONS = [
  { value: "homework", label: "Homework" },
  { value: "assignment", label: "Assignment" },
];

const NewHomework = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  const [files, setFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const {
    type,
    title,
    description,
    academicLevel,
    classGroup,
    course,
    targetType,
    dueDate,
    totalMarks,
  } = form;

  // ----- Academic Level -----
  const { data: academicLevelsData, isLoading: academicLevelsLoading } = useGetAcademicLevelsQuery({
    paginate: false,
  });
  const academicLevels = academicLevelsData?.levels || [];

  // ----- Class Group (depends on Academic Level) — same dropdown feed the Timetable page uses -----
  const {
    data: classGroupsData,
    isLoading: classGroupsLoading,
    isFetching: classGroupsFetching,
  } = useGetClassGroupsForDropdownQuery(
    { academicLevel, status: "active" },
    { skip: !academicLevel }
  );

  // Teacher's own courses (+ the class groups they're already attached to),
  // used only to figure out which courses in the selected class group are
  // actually taught by this teacher.
  const { data: roleData } = useGetTeacherClassGroupsAndCoursesQuery();

  const [createHomeworkAssignment, { isLoading: isCreating, error, isSuccess }] =
    useCreateHomeworkAssignmentMutation();

  const { data: studentsData, isFetching: studentsLoading } = useGetClassGroupStudentsQuery(
    classGroup,
    { skip: !classGroup || targetType !== "individual" }
  );

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error creating posting"));
    if (isSuccess) {
      toast.success(t("Posted successfully"));
      navigate("/teacher/homework");
    }
  }, [error, isSuccess, navigate, t]);

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

  // Courses actually taught by this teacher, within the selected class group.
  // roleData.classGroups already comes with populated `courses`; we just
  // match the id picked from the dropdown above against it.
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

    if (!title.trim() || !description.trim() || !classGroup || !course || !dueDate) {
      return toast.error(t("Please fill all required fields"));
    }
    if (targetType === "individual" && targetStudents.length === 0) {
      return toast.error(t("Please select at least one student"));
    }

    createHomeworkAssignment({
      type,
      title,
      description,
      classGroup,
      course,
      targetType,
      targetStudents: targetType === "individual" ? targetStudents : [],
      dueDate,
      totalMarks: totalMarks === "" ? null : Number(totalMarks),
      attachments: files,
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("New Homework/Assignment")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Homework / Assignment")}
          subtitle={t("Post a homework or assignment to a class group")}
          backUrl="/teacher/homework"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard title={t("Class & Course")} icon="fa-chalkboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm-custom font-medium text-dark mb-1.5">
                  {t("Type")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={type}
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
                value={academicLevel}
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
                value={classGroup}
                options={classGroupOptions}
                onChange={handleClassGroupChange}
                placeholder={academicLevel ? t("Select Class Group") : t("Select an academic level first")}
                isLoading={classGroupsLoading || classGroupsFetching}
                disabled={!academicLevel}
                required
              />

              <SearchableDropdown
                label={t("Course")}
                value={course}
                options={courseOptions}
                onChange={(val) => setForm((prev) => ({ ...prev, course: val }))}
                placeholder={classGroup ? t("Select Course") : t("Select a class group first")}
                disabled={!classGroup}
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
                    checked={targetType === "all"}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                  />
                  {t("All students in this class group")}
                </label>
                <label className="flex items-center gap-2 text-sm-custom text-dark cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="individual"
                    checked={targetType === "individual"}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                  />
                  {t("Specific students")}
                </label>
              </div>

              {targetType === "individual" && (
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
                  label={t("Post")}
                  loadingLabel={t("Posting...")}
                  isLoading={isCreating}
                  icon="fa-paper-plane"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppInput
                name="title"
                value={title}
                onChange={onChange}
                label={t("Topic / Title")}
                placeholder={t("e.g. Chapter 5 exercises")}
                required
              />

              <AppInput
                type="datetime-local"
                name="dueDate"
                value={dueDate}
                onChange={onChange}
                label={t("Due Date")}
                required
              />

              <div className="md:col-span-2">
                <AppInput
                  type="textarea"
                  name="description"
                  value={description}
                  onChange={onChange}
                  label={t("Description")}
                  placeholder={t("Instructions for the students")}
                  rows={4}
                  required
                />
              </div>

              <AppInput
                type="number"
                name="totalMarks"
                value={totalMarks}
                onChange={onChange}
                label={t("Total Marks (optional)")}
                placeholder={t("e.g. 20")}
                min={0}
              />

              <div>
                <label className="block text-sm-custom font-medium text-dark mb-1.5">
                  {t("Attachments (optional)")}
                </label>
                <FileUpload setIsUploadingFile={setIsUploadingFile} setFiles={setFiles} loading={isCreating} />
              </div>
            </div>

            <AppInfoBox icon="fa-info-circle">
              <strong>{t("Note")}:</strong> —{" "}
              {t(
                "This will be posted for the selected class group and course, scoped to the current campus and academic year."
              )}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewHomework;
