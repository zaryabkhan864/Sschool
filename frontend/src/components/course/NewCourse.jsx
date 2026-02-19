import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux API
import { useCreateCourseMutation } from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

// Core UI Components (Reuse from Grade)
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppSubmitButton from "../GUI/AppSubmitButton";
import AppCancelButton from "../GUI/AppCancelButton";

// Special Components for Course
import SearchableDropdown from "../../components/layout/SearchableDropdown";

const NewCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
    grade: "",
  });

  // States for dynamic fetching
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teachersList, setTeachersList] = useState([]);

  const [gradeSearch, setGradeSearch] = useState("");
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);

  const { courseName, description, code, teacher, grade } = course;

  const [createCourse, { isLoading: isCreating, error, isSuccess }] = useCreateCourseMutation();

  // Queries
  const { data: teachersData, isFetching: teacherLoading } = useGetUserByTypeQuery({
    type: "teacher", status: "active", page: teacherPage, limit: 0, keyword: teacherSearch
  });

  const { data: gradesData, isFetching: gradeLoading } = useGetGradesQuery({
    page: gradePage, limit: 0, keyword: gradeSearch
  });

  // Sync Lists
  useEffect(() => {
    if (teachersData?.users) setTeachersList(teachersData.users);
  }, [teachersData]);

  useEffect(() => {
    if (gradesData?.grades) setGradesList(gradesData.grades);
  }, [gradesData]);

  // Handle API Success/Error
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error creating course"));
    if (isSuccess) {
      toast.success(t("Course Created Successfully"));
      navigate("/admin/courses");
    }
  }, [error, isSuccess, navigate, t]);

  const onChange = (e) => setCourse({ ...course, [e.target.name]: e.target.value });

  const submitHandler = (e) => {
    e.preventDefault();
    if (!courseName.trim() || code.length !== 8 || !teacher || !grade) {
      return toast.error(t("Please fill all required fields correctly"));
    }
    createCourse(course);
  };

  // Options Mapping
  const teacherOptions = useMemo(() => teachersList.map(t => ({
    value: t._id, label: t.name, subtitle: t.email
  })), [teachersList]);

  const gradeOptions = useMemo(() => gradesList.map(g => ({
    value: g._id, label: g.gradeName, subtitle: g.academicLevel?.name
  })), [gradesList]);

  return (
    <AdminLayout>
      <MetaData title={t("New Course")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        <AppPageHeader
          title={t("New Course")}
          subtitle={t("Define a new course and assign a teacher")}
          backUrl="/admin/courses"
        />

        <form onSubmit={submitHandler} className="space-y-4">
          <AppCard
            title={t("Course Information")}
            icon="fa-book"
            footer={
              <div className="flex justify-end gap-2">
                <AppCancelButton backUrl="/admin/courses" />
                <AppSubmitButton 
                  label="Create Course" 
                  isLoading={isCreating} 
                  icon="fa-plus-circle" 
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppInput
                label={t('Course Name')}
                name="courseName"
                value={courseName}
                onChange={onChange}
                placeholder={t("Enter course name")}
                required
              />

              <AppInput
                label={t('Course Code')}
                name="code"
                value={code}
                onChange={onChange}
                placeholder="e.g. CS101001"
                maxLength={8}
                required
              />

              <div className="md:col-span-2">
                 {/* Reusing existing logic for Searchable Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableDropdown
                    label={t('Grade')}
                    value={grade}
                    options={gradeOptions}
                    onChange={(id) => setCourse({ ...course, grade: id })}
                    onSearch={(val) => setGradeSearch(val)}
                    isLoading={gradeLoading}
                    placeholder={t("Select Grade")}
                    required
                  />

                  <SearchableDropdown
                    label={t('Assigned Teacher')}
                    value={teacher}
                    options={teacherOptions}
                    onChange={(id) => setCourse({ ...course, teacher: id })}
                    onSearch={(val) => setTeacherSearch(val)}
                    isLoading={teacherLoading}
                    placeholder={t("Select Teacher")}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <AppInput
                  label={t('Description')}
                  name="description"
                  value={description}
                  onChange={onChange}
                  type="textarea"
                  placeholder={t("Enter course description")}
                  rows={3}
                />
              </div>
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewCourse;