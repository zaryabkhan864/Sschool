import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../GUI/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";

import SearchableDropdown from "../../components/layout/SearchableDropdown";
import FormSection from "../../components/GUI/FormSection";
import FormInput from "../../components/GUI/FormInput";
import FormActions from "../../components/GUI/FormActions";
import BackButton from "../../components/layout/BackButton";

const UpdateCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params?.id;

  // ----- Course state – includes 'grade' -----
  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
    grade: "",
  });

  // ----- Teacher dropdown states -----
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teachersList, setTeachersList] = useState([]);
  const [hasMoreTeachers, setHasMoreTeachers] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ----- Grade dropdown states -----
  const [gradeSearch, setGradeSearch] = useState("");
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMoreGrades, setHasMoreGrades] = useState(true);

  const { courseName, description, code, teacher, grade } = course;

  // ----- API Hooks -----
  const [updateCourse, { isLoading, error, isSuccess }] = useUpdateCourseMutation();
  const { data: courseData, isLoading: detailsLoading } = useGetCourseDetailsQuery(courseId);

  // Teacher query
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
  }, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  // Grade query – limit 0 = all grades
  const {
    data: gradesData,
    isFetching: gradeLoading,
    error: gradeError,
  } = useGetGradesQuery({
    page: gradePage,
    limit: 0,
    keyword: gradeSearch
  }, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  // ----- Initialize form with course data -----
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

      // Set teacher name for display
      if (courseDetails.teacher?.name) {
        setTeacherSearch(courseDetails.teacher.name);
      }

      // ✅ Set grade name for display – field ab 'gradeName' hai
      if (courseDetails.grade?.gradeName) {
        setGradeSearch(courseDetails.grade.gradeName);
      }

      setInitialLoadDone(true);
    }
  }, [courseData]);

  // ----- Sync teachers list -----
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

  // ----- Sync grades list -----
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

  // ----- Handle API responses -----
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error updating course"));
    }
    if (teacherError) {
      toast.error(t("Failed to load teachers"));
    }
    if (gradeError) {
      toast.error(t("Failed to load grades"));
    }
    if (isSuccess) {
      toast.success(t("Course Updated Successfully"));
      navigate("/admin/courses", {
        state: { shouldRefetch: true }
      });
    }
  }, [error, isSuccess, navigate, t, teacherError, gradeError]);

  // ----- Event Handlers -----
  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  // Teacher handlers
  const handleTeacherSearch = useCallback((searchValue, page) => {
    setTeacherSearch(searchValue);
    setTeacherPage(page);
  }, []);

  const handleTeacherChange = (teacherId) => {
    setCourse({ ...course, teacher: teacherId });
  };

  const handleClearTeacher = () => {
    setCourse({ ...course, teacher: "" });
    setTeacherSearch("");
  };

  // Grade handlers
  const handleGradeSearch = useCallback((searchValue, page) => {
    setGradeSearch(searchValue);
    setGradePage(page);
  }, []);

  const handleGradeChange = (gradeId) => {
    setCourse({ ...course, grade: gradeId });
  };

  const handleClearGrade = () => {
    setCourse({ ...course, grade: "" });
    setGradeSearch("");
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!courseName.trim()) {
      toast.error(t("Course name is required"));
      return;
    }
    if (!code.trim() || code.length !== 8) {
      toast.error(t("Course code must be 8 characters"));
      return;
    }
    if (!teacher) {
      toast.error(t("Please select a teacher"));
      return;
    }
    if (!grade) {
      toast.error(t("Please select a grade"));
      return;
    }

    setShowModal(true);
  };

  // ✅ FIXED: ab mutation ko individual fields pass ho rahi hain
  const confirmUpdate = () => {
    updateCourse({
      id: courseId,
      courseName,
      description,
      code,
      teacher,
      grade
    });
  };

  // ----- Dropdown options -----
  const teacherOptions = useMemo(() => {
    return teachersList.map(teacher => ({
      value: teacher._id,
      label: teacher.name,
      subtitle: teacher.email
    }));
  }, [teachersList]);

  const gradeOptions = useMemo(() => {
    return gradesList.map(grade => ({
      value: grade._id,
      label: grade.gradeName,
      subtitle: grade.academicLevel?.name
    }));
  }, [gradesList]);

  // ----- Display names for selected items -----
  const selectedTeacherName = useMemo(() => {
    if (!teacher) return "";
    const foundInList = teachersList.find(t => t._id === teacher);
    if (foundInList) return foundInList.name;
    if (courseData?.course?.teacher?._id === teacher) {
      return courseData.course.teacher.name;
    }
    return "";
  }, [teacher, teachersList, courseData]);

  const selectedGradeName = useMemo(() => {
    if (!grade) return "";
    const foundInList = gradesList.find(g => g._id === grade);
    if (foundInList) return foundInList.gradeName;
    if (courseData?.course?.grade?._id === grade) {
      return courseData.course.grade.gradeName;
    }
    return "";
  }, [grade, gradesList, courseData]);

  if (detailsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Update Course")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('Update Course')}</h1>
            <p className="text-xs text-gray-500">{t('Update course information and details')}</p>
          </div>
          <BackButton
            to="/admin/courses"
            label={t('back')}
            className="px-3 py-1.5 text-xs"
          />
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          {/* Course Information Section */}
          <FormSection
            title={t('Course Information')}
            icon="book"
            iconColor="blue"
            border={true}
            className="shadow-sm"
          >
            <FormInput
              label={t('Course Name')}
              name="courseName"
              value={courseName}
              onChange={onChange}
              placeholder={t("Enter course name")}
              required={true}
            />
            <FormInput
              label={t('Description')}
              name="description"
              value={description}
              onChange={onChange}
              placeholder={t("Enter course description")}
              type="textarea"
              rows="3"
            />
          </FormSection>

          {/* Course Details Section */}
          <FormSection
            title={t('Course Details')}
            icon="cog"
            iconColor="green"
            border={true}
            className="shadow-sm"
          >
            {/* Two‑column layout: Course Code and Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormInput
                label={t('Course Code')}
                name="code"
                value={code}
                onChange={onChange}
                placeholder={t("Enter 8-character code")}
                required={true}
                maxLength={8}
                minLength={8}
                pattern="[A-Za-z0-9]{8}"
                helperText={t("Must be exactly 8 alphanumeric characters")}
              />

              {/* Grade Dropdown */}
              <div className="space-y-2">
                <SearchableDropdown
                  label={t('Grade')}
                  value={grade}
                  onChange={handleGradeChange}
                  onSearch={handleGradeSearch}
                  options={gradeOptions}
                  isLoading={gradeLoading}
                  hasMore={hasMoreGrades}
                  placeholder={t("Search grade by name...")}
                  required={true}
                  initialSearch={gradeSearch}
                  emptyMessage={t("No grades found")}
                  loadingMessage={t("Fetching grades...")}
                  renderOption={(option, isSelected) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        {option.label?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 leading-tight">
                          {option.label}
                        </p>
                        {option.subtitle && (
                          <p className="text-[10px] text-gray-500">
                            {option.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                />
                {/* Selected Grade Display */}
                {grade && selectedGradeName && (
                  <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-md">
                    <span className="text-xs text-green-700 font-semibold">
                      <i className="fa fa-check-circle mr-2"></i>
                      {t("Selected Grade")}: {selectedGradeName}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearGrade}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      {t("Change")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Teacher Dropdown (full width) */}
            <div className="space-y-2">
              <SearchableDropdown
                label={t('Assigned Teacher')}
                value={teacher}
                onChange={handleTeacherChange}
                onSearch={handleTeacherSearch}
                options={teacherOptions}
                isLoading={teacherLoading}
                hasMore={hasMoreTeachers}
                placeholder={t("Search teacher by name or email...")}
                required={true}
                initialSearch={teacherSearch}
                emptyMessage={t("No teachers found")}
                loadingMessage={t("Fetching teachers...")}
                renderOption={(option, isSelected) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                      {option.label?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 leading-tight">
                        {option.label}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {option.subtitle || t('No email')}
                      </p>
                    </div>
                  </div>
                )}
              />
              {/* Selected Teacher Display */}
              {teacher && selectedTeacherName && (
                <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-md">
                  <span className="text-xs text-blue-700 font-semibold">
                    <i className="fa fa-user-check mr-2"></i>
                    {t("Selected Teacher")}: {selectedTeacherName}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearTeacher}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    {t("Change")}
                  </button>
                </div>
              )}
            </div>
          </FormSection>

          {/* Form Actions */}
          <FormSection
            background="gray"
            border={false}
            padding="p-5"
          >
            <FormActions
              onSubmit={submitHandler}
              onCancel={() => navigate("/admin/courses")}
              submitLabel={t('Update Course')}
              cancelLabel={t('Cancel')}
              isLoading={isLoading}
              submitIcon="save"
              cancelIcon="times"
              submitColor="blue"
              cancelColor="gray"
              align="right"
            />
          </FormSection>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={isLoading}
        message={t("Are you sure you want to update this course?")}
        title={t("Update Course")}
        confirmText={t("Update")}
        cancelText={t("Cancel")}
        confirmColor="blue"
      />
    </AdminLayout>
  );
};

export default UpdateCourse;