import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../GUI/AdminLayout";
import MetaData from "../layout/MetaData";
import {
  useCreateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";   // ✅ correct import
import { useTranslation } from "react-i18next";

// Import reusable components
import SearchableDropdown from "../../components/layout/SearchableDropdown";
import FormSection from "../../components/GUI/FormSection";
import FormInput from "../../components/GUI/FormInput";
import FormActions from "../../components/GUI/FormActions";
import BackButton from "../../components/layout/BackButton";

const NewCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 👇 Added 'grade' to initial state
  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
    grade: "",      // 👈 new field
  });

  // ----- Teacher dropdown states -----
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teachersList, setTeachersList] = useState([]);
  const [hasMoreTeachers, setHasMoreTeachers] = useState(true);

  // ----- Grade dropdown states -----
  const [gradeSearch, setGradeSearch] = useState("");
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMoreGrades, setHasMoreGrades] = useState(true);

  const { courseName, description, code, teacher, grade } = course;

  const [createCourse, { isLoading, error, isSuccess }] = useCreateCourseMutation();

  // ----- Fetch Teachers (limit 0 = all) -----
  const {
    data: teachersData,
    isFetching: teacherLoading,
    error: teacherError,
  } = useGetUserByTypeQuery({
    type: "teacher",
    status: "active",
    page: teacherPage,
    limit: 0,
    keyword: teacherSearch
  }, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  // ✅ Fetch Grades – exactly as used in ListGrades (from gradesApi)
  const {
    data: gradesData,
    isFetching: gradeLoading,
    error: gradeError,
  } = useGetGradesQuery({
    page: gradePage,
    limit: 0,          // 👈 0 = fetch all grades
    keyword: gradeSearch
  }, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

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
      setHasMoreTeachers(!!(teachersData.pagination && teacherPage < teachersData.pagination.totalPages));
    }
  }, [teachersData, teacherPage]);

  // ✅ Sync grades list – uses `gradesData.grades` (as in ListGrades)
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
      // If limit=0, backend probably returns all records and pagination is absent.
      setHasMoreGrades(!!(gradesData.pagination && gradePage < gradesData.pagination.totalPages));
    }
  }, [gradesData, gradePage]);

  // ----- Handle API responses -----
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating course"));
    }
    if (teacherError) {
      toast.error(t("Failed to load teachers"));
    }
    if (gradeError) {
      toast.error(t("Failed to load grades"));
    }
    if (isSuccess) {
      toast.success(t("Course Created"));
      navigate("/admin/courses", {
        state: { shouldRefetch: true, showSuccessToast: true }
      });
    }
  }, [error, isSuccess, navigate, t, teacherError, gradeError]);

  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  // ----- Teacher handlers -----
  const handleTeacherSearch = useCallback((searchValue, page) => {
    setTeacherSearch(searchValue);
    setTeacherPage(page);
  }, []);

  const handleTeacherChange = (teacherId) => {
    setCourse({ ...course, teacher: teacherId });
  };

  // ----- Grade handlers -----
  const handleGradeSearch = useCallback((searchValue, page) => {
    setGradeSearch(searchValue);
    setGradePage(page);
  }, []);

  const handleGradeChange = (gradeId) => {
    setCourse({ ...course, grade: gradeId });
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // ----- Validation -----
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
    if (!grade) {          // 👈 grade is required
      toast.error(t("Please select a grade"));
      return;
    }

    // 👇 Include grade in the mutation payload
    createCourse({ ...course, grade });
  };

  // ----- Options for dropdowns -----
  const teacherOptions = useMemo(() => {
    return teachersList.map(teacher => ({
      value: teacher._id,
      label: teacher.name,
      subtitle: teacher.email
    }));
  }, [teachersList]);

  // ✅ Grade options – match the structure returned by gradesApi
  const gradeOptions = useMemo(() => {
    return gradesList.map(grade => ({
      value: grade._id,
      label: grade.gradeName,                // gradeName field (as per ListGrades)
      subtitle: grade.academicLevel?.name   // academicLevel object with name
    }));
  }, [gradesList]);

  return (
    <AdminLayout>
      <MetaData title={t("New Course")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('New Course')}</h1>
            <p className="text-xs text-gray-500">{t('Fill in details to create a new course')}</p>
          </div>
          <BackButton
            to="/admin/courses"
            label={t('back')}
            className="px-3 py-1.5 text-xs"
          />
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
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
              placeholder={t("Enter course description (optional)")}
              type="textarea"
              rows="3"
            />
          </FormSection>

          <FormSection
            title={t('Course Details')}
            icon="cog"
            iconColor="green"
            border={true}
            className="shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* 👇 Grade Dropdown – styled exactly like teacher dropdown */}
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
            </div>

            {/* Teacher dropdown (full width) */}
            <div className="mt-6">
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
            </div>
          </FormSection>

          <FormSection background="gray" border={false} padding="p-5">
            <FormActions
              onSubmit={submitHandler}
              onCancel={() => navigate("/admin/courses")}
              submitLabel={t('Create Course')}
              cancelLabel={t('Cancel')}
              isLoading={isLoading}
              submitIcon="plus"
              cancelIcon="arrow-left"
              submitColor="blue"
              cancelColor="gray"
              align="right"
            />
          </FormSection>
        </form>
      </div>

      {/* Confirmation Modal (if needed – currently not used) */}
    </AdminLayout>
  );
};

export default NewCourse;