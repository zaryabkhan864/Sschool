// components/project/NewProject.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCreateProjectMutation } from "../../redux/api/projectApi";
import { useGetClassGroupStudentsQuery, useGetTeacherClassGroupsAndCoursesQuery } from "../../redux/api/homeworkApi";
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
import StudentMultiSelect from "../GUI/StudentMultiSelect";
import FileUpload from "../UploadFile";

const NewProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

  const { title, description, academicLevel, classGroup, course, targetType, dueDate, totalMarks } = form;

  const { data: academicLevelsData, isLoading: academicLevelsLoading } = useGetAcademicLevelsQuery({
    paginate: false,
  });
  const academicLevels = academicLevelsData?.levels || [];

  const {
    data: classGroupsData,
    isLoading: classGroupsLoading,
    isFetching: classGroupsFetching,
  } = useGetClassGroupsForDropdownQuery({ academicLevel, status: "active" }, { skip: !academicLevel });

  // Teacher's own courses (+ class groups they're attached to), used only
  // to build the optional course dropdown for the selected class group.
  const { data: roleData } = useGetTeacherClassGroupsAndCoursesQuery();

  const [createProject, { isLoading: isCreating, error, isSuccess }] = useCreateProjectMutation();

  const { data: studentsData, isFetching: studentsLoading } = useGetClassGroupStudentsQuery(classGroup, {
    skip: !classGroup || targetType !== "individual",
  });

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error creating project"));
    if (isSuccess) {
      toast.success(t("Project posted successfully"));
      navigate("/teacher/projects");
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

  // Course is optional for a project — always offer "No specific course"
  const courseOptions = useMemo(() => {
    const base = [{ value: "", label: t("No specific course (interdisciplinary)") }];
    if (!classGroup) return base;
    const matchedGroup = (roleData?.classGroups || []).find((cg) => cg._id === classGroup);
    if (!matchedGroup) return base;
    const myCourseIds = new Set((roleData?.courses || []).map((c) => c._id));
    const mine = (matchedGroup.courses || [])
      .filter((c) => myCourseIds.has(c._id))
      .map((c) => ({ value: c._id, label: `${c.courseName} (${c.code})` }));
    return [...base, ...mine];
  }, [classGroup, roleData, t]);

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

    if (!title.trim() || !description.trim() || !classGroup || !dueDate) {
      return toast.error(t("Please fill all required fields"));
    }
    if (targetType === "individual" && targetStudents.length === 0) {
      return toast.error(t("Please select at least one student"));
    }

    createProject({
      title,
      description,
      classGroup,
      course: course || null,
      targetType,
      targetStudents: targetType === "individual" ? targetStudents : [],
      dueDate,
      totalMarks: totalMarks === "" ? null : Number(totalMarks),
      attachments: files,
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("New Project")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Project")}
          subtitle={t("Assign a project to a whole class or to specific students")}
          backUrl="/teacher/projects"
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
              label={t("Course (optional)")}
              value={course}
              options={courseOptions}
              onChange={(val) => setForm((prev) => ({ ...prev, course: val }))}
              placeholder={t("No specific course")}
              disabled={!classGroup}
            />
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
                <AppButton backUrl="/teacher/projects" label={t("Cancel")} />
                <AppButton
                  type="submit"
                  label={t("Post Project")}
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
                label={t("Project Title")}
                placeholder={t("e.g. Solar System Model")}
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
                  placeholder={t("Instructions, objectives, requirements for the students")}
                  rows={5}
                  required
                />
              </div>

              <AppInput
                type="number"
                name="totalMarks"
                value={totalMarks}
                onChange={onChange}
                label={t("Total Marks (optional)")}
                placeholder={t("e.g. 50")}
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
                "A project doesn't need to belong to one course — leave course empty for interdisciplinary projects."
              )}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewProject;
