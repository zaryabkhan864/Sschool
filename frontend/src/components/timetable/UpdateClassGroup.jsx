import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useNavigate, useParams } from "react-router-dom";

import { 
  useGetClassGroupDetailsQuery,
  useUpdateClassGroupMutation
} from "../../redux/api/classGroupApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import { useGetCoursesQuery } from "../../redux/api/courseApi";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AdminLayout from "../layout/AdminLayout";
import ConfirmationModal from "../GUI/ConfirmationModal";
import BackButton from "../../components/layout/BackButton";

// Import reusable components
import FormSection from "../../components/GUI/FormSection";

import FormSelect from "../../components/GUI/FormSelect";
import FormCheckbox from "../../components/GUI/FormCheckbox";
import FormActions from "../../components/GUI/FormActions";
import InfoBanner from "../../components/GUI/InfoBanner";
import WarningBanner from "../../components/GUI/WarningBanner";
import FormInput from "../GUI/FormInput";

// Cookie helper function
const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split('; ');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) return decodeURIComponent(cookieValue);
  }
  return null;
};

const animatedComponents = makeAnimated();

const UpdateClassGroup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Form State
  const [classGroup, setClassGroup] = useState({
    grade: "",
    academicLevel: "",
    section: "",
    displayName: "",
    courses: [],
    status: true,
  });

  // Cookies se campus aur year
  const [currentCampus, setCurrentCampus] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [selectedCourseOptions, setSelectedCourseOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Destructure classGroup variables
  const { grade, academicLevel, section, displayName, courses, status } = classGroup;

  // Cookies load karein
  useEffect(() => {
    const campus = getCookie('campus');
    const year = getCookie('selectedYear');
    setCurrentCampus(campus);
    setCurrentYear(year ? parseInt(year) : new Date().getFullYear());
  }, []);

  // RTK Queries
  const { 
    data: groupData, 
    isLoading: detailsLoading,
    error: detailsError
  } = useGetClassGroupDetailsQuery(id, {
    skip: !id
  });
  
  const { 
    data: academicLevelsData, 
    isLoading: levelsLoading
  } = useGetAcademicLevelsQuery({ 
    paginate: "false",
    campus: currentCampus
  }, {
    skip: !currentCampus
  });
  
  // Grade fetch based on current campus and year
  const { 
    data: gradesData, 
    isLoading: gradesLoading,
    error: gradesError
  } = useGetGradesQuery({
    paginate: "false",
    campus: currentCampus || undefined,
    year: currentYear || undefined,
    ...(academicLevel && { academicLevelId: academicLevel })
  }, {
    skip: !currentCampus || !currentYear
  });

  // Courses fetch karne ka query
  const { 
    data: coursesData, 
    isLoading: coursesLoading,
    error: coursesError
  } = useGetCoursesQuery({
    paginate: "false",
    campus: currentCampus,
    year: currentYear,
    status: "active"
  }, {
    skip: !currentCampus || !currentYear,
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [updateClassGroupMutation, { 
    isLoading: updateLoading, 
    error: updateError, 
    isSuccess: updateSuccess 
  }] = useUpdateClassGroupMutation();

  // Initialize form with group data
  useEffect(() => {
    if (groupData?.classGroup) {
      const group = groupData.classGroup;
      const groupCourses = group.courses?.map(c => c._id || c) || [];
      
      setClassGroup({
        grade: group.grade?._id || group.grade || "",
        academicLevel: group.academicLevel?._id || group.academicLevel || "",
        section: group.section || "",
        displayName: group.displayName || "",
        courses: groupCourses,
        status: group.status ?? true,
      });
    }
  }, [groupData]);

  // Grades ko filter aur set karein
  useEffect(() => {
    if (!gradesData || !gradesData.grades || !Array.isArray(gradesData.grades)) {
      setAvailableGrades([]);
      return;
    }

    const gradesArray = gradesData.grades;
    
    // STEP 1: Pehle sirf campus aur year ke hisab se filter karo
    const campusYearFilteredGrades = gradesArray.filter(g => {
      const gradeCampus = g.campus?._id || g.campus;
      const campusMatch = gradeCampus === currentCampus;
      
      const gradeYear = g.year;
      const yearMatch = gradeYear === currentYear;
      
      return campusMatch && yearMatch;
    });
    
    // STEP 2: Agar academicLevel select kiya hai to filter karo
    let finalFilteredGrades = [...campusYearFilteredGrades];
    
    if (academicLevel && academicLevel.trim() !== "") {
      finalFilteredGrades = campusYearFilteredGrades.filter(g => {
        const gradeAcademicLevel = g.academicLevel?._id || g.academicLevel;
        return gradeAcademicLevel === academicLevel;
      });
    }
    
    setAvailableGrades(finalFilteredGrades);
    
    // STEP 3: Agar selected grade available nahi hai to reset karo
    if (grade && finalFilteredGrades.length > 0 && !finalFilteredGrades.some(g => g._id === grade)) {
      setClassGroup(prev => ({ ...prev, grade: "" }));
    }
    
  }, [academicLevel, gradesData, currentCampus, currentYear, grade]);

  // Courses ko grade aur academic level ke hisab se filter karo
  const filteredCourses = useMemo(() => {
    if (!coursesData?.courses || !Array.isArray(coursesData.courses)) {
      return [];
    }

    const allCourses = coursesData.courses;
    
    // Agar grade select nahi ki hai to sab courses dikhao
    if (!grade && !academicLevel) {
      return allCourses;
    }

    // Grade ke hisab se filter karo
    return allCourses.filter(course => {
      const courseGrade = course.grade?._id || course.grade;
      const courseAcademicLevel = course.academicLevel?._id || course.academicLevel;
      
      // Agar grade select ki hai to usi ke courses dikhao
      if (grade) {
        return courseGrade === grade;
      }
      
      // Agar academic level select ki hai to usi ke courses dikhao
      if (academicLevel) {
        return courseAcademicLevel === academicLevel;
      }
      
      return true;
    });
  }, [coursesData, grade, academicLevel]);

  // Auto-generate display name
  useEffect(() => {
    if (grade && section && availableGrades.length > 0) {
      const selectedGrade = availableGrades.find(g => g._id === grade);
      if (selectedGrade) {
        setClassGroup(prev => ({
          ...prev,
          displayName: `${selectedGrade.gradeName} ${section.toUpperCase()}`
        }));
      }
    } else if (!grade || !section) {
      setClassGroup(prev => ({ ...prev, displayName: "" }));
    }
  }, [grade, section, availableGrades]);

  // Selected courses ko react-select ke format mein convert karo
  useEffect(() => {
    if (courses.length > 0 && filteredCourses.length > 0) {
      const selectedOptions = courses.map(courseId => {
        const course = filteredCourses.find(c => c._id === courseId);
        if (course) {
          return {
            value: course._id,
            label: `${course.courseName} (${course.code || "No Code"})`,
            teacher: course.teacher?.name
          };
        }
        return null;
      }).filter(Boolean);
      
      setSelectedCourseOptions(selectedOptions);
    } else {
      setSelectedCourseOptions([]);
    }
  }, [courses, filteredCourses]);

  // Handle API responses
  useEffect(() => {
    if (detailsError) {
      toast.error(detailsError?.data?.message || t("Failed to fetch class group details"));
      navigate("/admin/class-groups");
    }

    if (updateError) {
      const errorMessage = updateError?.data?.message || updateError?.message || t("Something went wrong");
      toast.error(errorMessage);
    }

    if (updateSuccess) {
      toast.success(t("Class group updated successfully"));
      navigate("/admin/class-groups", { 
        state: { shouldRefetch: true }
      });
    }
  }, [detailsError, updateError, updateSuccess, t, navigate]);

  // Event Handlers
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClassGroup(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Check if cookies are set
    if (!currentCampus || !currentYear) {
      toast.error(t("Please select campus and year from header first"));
      return;
    }

    if (!academicLevel || !grade || !section) {
      toast.error(t("Please fill all required fields"));
      return;
    }

    // Show confirmation modal
    setShowModal(true);
  };

  const confirmUpdate = () => {
    const payload = { 
      ...classGroup,
      campus: currentCampus,
      year: currentYear,
      courses: courses
    };
    
    updateClassGroupMutation({ id, body: payload });
  };

  // Courses handle karne ka function
  const handleCourseChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setClassGroup(prev => ({ ...prev, courses: selectedIds }));
    setSelectedCourseOptions(selectedOptions || []);
  };

  // Helper functions
  const getGradeName = (gId) => {
    if (!gId) return "N/A";
    
    const allGrades = [];
    
    // 1. gradesData se
    if (gradesData?.grades) {
      allGrades.push(...gradesData.grades);
    }
    
    // Find the grade
    const found = allGrades.find(g => 
      g?._id === (gId?._id || gId) || 
      g?.id === (gId?._id || gId)
    );
    
    return found ? found.gradeName : "N/A";
  };

  // Campus options for dropdown
  const academicLevelOptions = useMemo(() => {
    if (!academicLevelsData?.levels) return [];
    return academicLevelsData.levels
      .filter(l => (l.campus?._id || l.campus) === currentCampus)
      .map(l => ({
        value: l._id,
        label: `${l.name} (${l.code})`
      }));
  }, [academicLevelsData, currentCampus]);

  // Grade options for dropdown
  const gradeOptions = useMemo(() => {
    if (!availableGrades || availableGrades.length === 0) {
      return [{
        value: "",
        label: t("No grades available"),
        disabled: true
      }];
    }
    
    return availableGrades.map(g => ({
      value: g._id,
      label: `${g.gradeName}${g.description ? ` - ${g.description}` : ''}`
    }));
  }, [availableGrades, t]);

  // Course options for React Select
  const courseOptions = useMemo(() => {
    if (!filteredCourses || filteredCourses.length === 0) {
      return [];
    }
    
    return filteredCourses.map(course => ({
      value: course._id,
      label: `${course.courseName} (${course.code || "No Code"})`,
      teacher: course.teacher?.name
    }));
  }, [filteredCourses]);

  const isLoading = detailsLoading || levelsLoading || gradesLoading || coursesLoading;

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Edit Class Group")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('Edit Class Group')}</h1>
            <p className="text-xs text-gray-500">{t('Update class group information and details')}</p>
          </div>
          <BackButton 
            to="/admin/class-groups"
            label={t('back')}
            className="px-3 py-1.5 text-xs"
          />
        </div>

        {/* Campus and Year Info */}
        <div className="mb-6">
          <InfoBanner
            title={t("Current Session")}
            message={`${currentYear} | ${academicLevelsData?.levels?.find(l => l.campus?._id === currentCampus)?.campus?.name || t("Not Selected")}`}
            type="info"
            icon="calendar-alt"
          />
          
          {(!currentCampus || !currentYear) && (
            <WarningBanner
              title={t("Action Required")}
              message={t("Please select campus and year from header first")}
              type="warning"
            />
          )}
          
          {/* API Errors */}
          {gradesError && (
            <WarningBanner
              title={t("Grades API Error")}
              message={gradesError?.data?.message || "Failed to fetch grades"}
              type="error"
            />
          )}
          
          {coursesError && (
            <WarningBanner
              title={t("Courses API Error")}
              message={coursesError?.data?.message || "Failed to fetch courses"}
              type="error"
            />
          )}
        </div>

        {/* Form Section */}
        <form onSubmit={submitHandler}>
          <FormSection
            title={t("Edit Class Group")}
            icon="edit"
            iconColor="blue"
            border={true}
            background="white"
            padding="p-6"
            className="mb-8 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormSelect
                label={t("Academic Level")}
                name="academicLevel"
                value={academicLevel}
                onChange={onChange}
                options={academicLevelOptions}
                placeholder={t("Select Academic Level")}
                required={true}
                disabled={!currentCampus}
                helperText={!currentCampus ? t("Please select a campus from header first") : ""}
                className="md:col-span-1"
              />
              
              <FormSelect
                label={t("Grade")}
                name="grade"
                value={grade}
                onChange={onChange}
                options={gradeOptions}
                placeholder={gradeOptions.length > 0 ? t("Select Grade") : t("No grades available")}
                required={true}
                disabled={!academicLevel || availableGrades.length === 0}
                helperText={
                  !academicLevel 
                    ? t("First select an academic level") 
                    : availableGrades.length === 0 
                    ? t("No grades found for this academic level and session") 
                    : t(`${availableGrades.length} grade(s) available`)
                }
                className="md:col-span-1"
              />
              
              <FormInput
                label={t("Section")}
                name="section"
                value={section}
                onChange={onChange}
                placeholder={t("e.g. A, B, C, ENG, SCIENCE")}
                required={true}
                helperText={t("Enter section letter or name")}
                className="md:col-span-1"
              />
              
              <FormInput
                label={t("Display Name")}
                name="displayName"
                value={displayName}
                onChange={onChange}
                placeholder={t("Auto-generated")}
                readOnly={true}
                helperText={t("Auto-generated from grade and section")}
                className="md:col-span-1"
              />
              
              <div className="md:col-span-1 flex items-end">
                <FormCheckbox
                  label={t("Active Status")}
                  name="status"
                  checked={status}
                  onChange={onChange}
                  className="text-sm"
                />
              </div>
              
              {/* Courses Multi-Select - Full Width */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Courses")} <span className="text-gray-400">({t("Optional - Select multiple")})</span>
                </label>
                
                {coursesLoading ? (
                  <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <i className="fa fa-spinner fa-spin mr-2 text-blue-500"></i>
                    <span className="text-gray-600">{t("Loading courses...")}</span>
                  </div>
                ) : (
                  <>
                    <Select
                      isMulti
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      options={courseOptions}
                      value={selectedCourseOptions}
                      onChange={handleCourseChange}
                      placeholder={t("Select courses for this class group...")}
                      isLoading={coursesLoading}
                      isDisabled={coursesLoading || !grade}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      noOptionsMessage={() => 
                        !grade 
                          ? t("Please select a grade first") 
                          : t("No courses available for this grade")
                      }
                    />
                    
                    {/* Selected courses info */}
                    {selectedCourseOptions.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-800">
                            {t("Selected Courses")}: {selectedCourseOptions.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCourseChange([])}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {t("Clear All")}
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {selectedCourseOptions.map(option => (
                            <span 
                              key={option.value}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {option.label}
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = selectedCourseOptions.filter(
                                    opt => opt.value !== option.value
                                  );
                                  handleCourseChange(newOptions);
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Helper Text */}
                    <p className="mt-2 text-xs text-gray-500">
                      {!grade 
                        ? t("Select a grade first to see available courses") 
                        : `${filteredCourses.length} course(s) available for ${getGradeName(grade)}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <FormActions
                onSubmit={submitHandler}
                onCancel={() => navigate("/admin/class-groups")}
                submitLabel={t("Update Class Group")}
                cancelLabel={t("Cancel")}
                isLoading={updateLoading}
                disabled={!currentCampus || !currentYear || !academicLevel || !grade || !section}
                submitIcon="save"
                cancelIcon="times"
                submitColor="blue"
                cancelColor="gray"
                align="right"
                showCancel={true}
              />
            </div>
          </FormSection>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={updateLoading}
        message={t("Are you sure you want to update this class group?")}
        title={t("Update Class Group")}
        confirmText={t("Update")}
        cancelText={t("Cancel")}
        confirmColor="blue"
      />

      {/* React Select CSS */}
      <style jsx>{`
        .react-select-container .react-select__control {
          border-color: #d1d5db;
          border-radius: 0.5rem;
          min-height: 42px;
        }
        .react-select-container .react-select__control:hover {
          border-color: #9ca3af;
        }
        .react-select-container .react-select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .react-select-container .react-select__multi-value {
          background-color: #dbeafe;
          border-radius: 0.375rem;
        }
        .react-select-container .react-select__multi-value__label {
          color: #1e40af;
          font-weight: 500;
        }
      `}</style>
    </AdminLayout>
  );
};

export default UpdateClassGroup;