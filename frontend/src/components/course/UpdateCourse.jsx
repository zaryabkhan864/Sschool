import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

// Redux API
import {
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

// Layout & UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppSubmitButton from "../GUI/AppSubmitButton";
import AppCancelButton from "../GUI/AppCancelButton";
import SearchableDropdown from "../../components/layout/SearchableDropdown";

const UpdateCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params?.id;

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
    grade: "",
  });

  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teachersList, setTeachersList] = useState([]);
  const [hasMoreTeachers, setHasMoreTeachers] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [gradeSearch, setGradeSearch] = useState("");
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMoreGrades, setHasMoreGrades] = useState(true);

  const { courseName, description, code, teacher, grade } = course;

  // API Hooks
  const [updateCourse, { isLoading, error, isSuccess }] = useUpdateCourseMutation();
  const { data: courseData, isLoading: detailsLoading } = useGetCourseDetailsQuery(courseId);

  const {
    data: teachersData,
    isFetching: teacherLoading,
    error: teacherError,
  } = useGetUserByTypeQuery({
    type: "teacher",
    status: "active",
    page: teacherPage,
    limit: 10,
    keyword: teacherSearch
  }, { refetchOnMountOrArgChange: true });

  const {
    data: gradesData,
    isFetching: gradeLoading,
    error: gradeError,
  } = useGetGradesQuery({
    page: gradePage,
    limit: 0,
    keyword: gradeSearch
  }, { refetchOnMountOrArgChange: true });

  // Populate form with course details
  useEffect(() => {
    if (courseData?.course) {
      const courseDetails = courseData.course;
      setCourse({
        courseName: courseDetails.courseName || "",
        description: courseDetails.description || "",
        code: courseDetails.code || "",
        teacher: courseDetails.teacher?._id || courseDetails.teacher || "",
        grade: courseDetails.grade?._id || courseDetails.grade || "",
      });

      // Pre-fill search inputs with names for better UX
      if (courseDetails.teacher?.name) setTeacherSearch(courseDetails.teacher.name);
      if (courseDetails.grade?.gradeName) setGradeSearch(courseDetails.grade.gradeName);
      
      setInitialLoadDone(true);
    }
  }, [courseData]);

  // Update teachers list when data changes
  useEffect(() => {
    if (teachersData?.users) {
      if (teacherPage === 1) {
        setTeachersList(teachersData.users);
      } else {
        setTeachersList(prev => {
          const combined = [...prev, ...teachersData.users];
          const uniqueMap = new Map();
          combined.forEach(user => uniqueMap.set(user._id, user));
          return Array.from(uniqueMap.values());
        });
      }
      setHasMoreTeachers(teachersData.users.length === 10);
    }
  }, [teachersData, teacherPage]);

  // Update grades list when data changes
  useEffect(() => {
    if (gradesData?.grades) {
      if (gradePage === 1) {
        setGradesList(gradesData.grades);
      } else {
        setGradesList(prev => {
          const combined = [...prev, ...gradesData.grades];
          const uniqueMap = new Map();
          combined.forEach(g => uniqueMap.set(g._id, g));
          return Array.from(uniqueMap.values());
        });
      }
      setHasMoreGrades(!!(gradesData.pagination && gradePage < gradesData.pagination.totalPages));
    }
  }, [gradesData, gradePage]);

  // Handle API responses
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error updating course"));
    if (teacherError) toast.error(t("Failed to load teachers"));
    if (gradeError) toast.error(t("Failed to load grades"));
    if (isSuccess) {
      toast.success(t("Course Updated Successfully"));
      navigate("/admin/courses");
    }
  }, [error, isSuccess, navigate, t, teacherError, gradeError]);

  const onChange = (e) => setCourse({ ...course, [e.target.name]: e.target.value });

  // Teacher dropdown handlers
  const handleTeacherSearch = useCallback((searchValue, page) => {
    setTeacherSearch(searchValue);
    setTeacherPage(page);
  }, []);

  const handleTeacherChange = (teacherId) => setCourse({ ...course, teacher: teacherId });

  // Grade dropdown handlers
  const handleGradeSearch = useCallback((searchValue, page) => {
    setGradeSearch(searchValue);
    setGradePage(page);
  }, []);

  const handleGradeChange = (gradeId) => setCourse({ ...course, grade: gradeId });

  // Form submission
  const submitHandler = (e) => {
    e.preventDefault();
    if (!courseName.trim()) return toast.error(t("Course name is required"));
    if (!code.trim() || code.length !== 8) return toast.error(t("Course code must be 8 characters"));
    if (!teacher) return toast.error(t("Please select a teacher"));
    if (!grade) return toast.error(t("Please select a grade"));

    updateCourse({ id: courseId, courseName, description, code, teacher, grade });
  };

  // Memoized options for dropdowns
  const teacherOptions = useMemo(() => teachersList.map(t => ({
    value: t._id,
    label: t.name,
    subtitle: t.email
  })), [teachersList]);

  const gradeOptions = useMemo(() => gradesList.map(g => ({
    value: g._id,
    label: g.gradeName,
    subtitle: g.academicLevel?.name
  })), [gradesList]);

  if (detailsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Update Course")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        <AppPageHeader
          title={t("Update Course")}
          subtitle={t("Update course information and assignment")}
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
                  label="Update Course" 
                  isLoading={isLoading} 
                  icon="fa-save" 
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableDropdown
                    label={t('Grade')}
                    value={grade}
                    options={gradeOptions}
                    onChange={handleGradeChange}
                    onSearch={handleGradeSearch}
                    isLoading={gradeLoading}
                    placeholder={t("Select Grade")}
                    required
                    initialSearch={gradeSearch}
                  />

                  <SearchableDropdown
                    label={t('Assigned Teacher')}
                    value={teacher}
                    options={teacherOptions}
                    onChange={handleTeacherChange}
                    onSearch={handleTeacherSearch}
                    isLoading={teacherLoading}
                    placeholder={t("Select Teacher")}
                    required
                    initialSearch={teacherSearch}
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

export default UpdateCourse;