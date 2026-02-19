import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useNavigate } from "react-router-dom";

import { 
  useCreateClassGroupMutation
} from "../../redux/api/classGroupApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import { useGetCoursesQuery } from "../../redux/api/courseApi";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AdminLayout from "../layout/AdminLayout";
import BackButton from "../../components/layout/BackButton";

// Import reusable components
import FormSection from "../../components/GUI/FormSection";
import FormInput from "../../components/GUI/FormInput";
import FormSelect from "../../components/GUI/FormSelect";
import FormCheckbox from "../../components/GUI/FormCheckbox";
import FormActions from "../../components/GUI/FormActions";
import InfoBanner from "../../components/GUI/InfoBanner";
import WarningBanner from "../../components/GUI/WarningBanner";

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

const NewClassGroup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
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
    data: academicLevelsData, 
    isLoading: levelsLoading,
    error: levelsError
  } = useGetAcademicLevelsQuery({ 
    paginate: false,
    campus: currentCampus
  }, {
    skip: !currentCampus,
    refetchOnMountOrArgChange: true,
  });
  
  const { 
    data: gradesData, 
    isLoading: gradesLoading,
    error: gradesError,
    refetch: refetchGrades,
    isFetching: gradesFetching
  } = useGetGradesQuery({
    paginate: false,
    campus: currentCampus,
    year: currentYear,
    status: "active",
  }, {
    skip: !currentCampus || !currentYear,
    refetchOnMountOrArgChange: true,
  });

  const { 
    data: coursesData, 
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses
  } = useGetCoursesQuery({
    paginate: false,
    limit: 0, 
    campus: currentCampus,
    year: currentYear,
    status: "active"
  }, {
    skip: !currentCampus || !currentYear,
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [createClassGroupMutation, { 
    isLoading: createLoading, 
    error: createError, 
    isSuccess: createSuccess 
  }] = useCreateClassGroupMutation();

  // SIMPLIFIED Grades filter - Frontend me filter karo
  useEffect(() => {
    if (!gradesData || !gradesData.grades || !Array.isArray(gradesData.grades)) {
      setAvailableGrades([]);
      return;
    }

    const allGrades = gradesData.grades;
    
    // Pehle campus aur year ke hisaab se filter
    let filtered = allGrades.filter(g => {
      const gradeCampus = g.campus?._id || g.campus;
      const campusMatch = gradeCampus === currentCampus;
      const gradeYear = g.year;
      const yearMatch = gradeYear === currentYear;
      
      return campusMatch && yearMatch;
    });
    
    // Phir academic level ke hisaab se filter
    if (academicLevel && academicLevel.trim() !== "") {
      filtered = filtered.filter(g => {
        const gradeAcademicLevel = g.academicLevel?._id || g.academicLevel;
        return gradeAcademicLevel === academicLevel;
      });
    }
    
    setAvailableGrades(filtered);
    
    // Agar selected grade filtered list me nahi hai to reset
    if (grade && filtered.length > 0 && !filtered.some(g => g._id === grade)) {
      setClassGroup(prev => ({ ...prev, grade: "" }));
    }
    
  }, [gradesData, academicLevel, currentCampus, currentYear, grade]);

  // DEBUG: Console me courses data check karein
  useEffect(() => {
    if (coursesData && coursesData.courses) {
      console.log("Courses Data:", coursesData.courses);
      console.log("Current Year:", currentYear);
      console.log("Current Campus:", currentCampus);
    }
  }, [coursesData, currentYear, currentCampus]);

  // ✅ FIX: Courses filter logic - AB GRADE FILTER NAHI KAR RAHE
  // Kyunke API courses mein grade field nahi bhej rahi, isliye sirf campus aur year filter laga rahe hain
  const filteredCourses = useMemo(() => {
    if (!coursesData?.courses || !Array.isArray(coursesData.courses)) {
      console.log("No courses data available");
      return [];
    }
    
    const allCourses = coursesData.courses;
    console.log("All courses:", allCourses);
    
    // Sirf campus aur year ke hisaab se filter
    let filteredByCampusAndYear = allCourses.filter(course => {
      const courseCampus = course.campus?._id || course.campus;
      const courseYear = course.year;
      const campusMatch = courseCampus === currentCampus;
      const yearMatch = courseYear === currentYear;
      
      return campusMatch && yearMatch;
    });
    
    console.log("Filtered by campus and year:", filteredByCampusAndYear);
    
    // ✅ GRADE FILTER HATAYA - taake courses dropdown empty na rahe
    // Agar backend mein grade field add karo to yahan condition wapas laga dena
    
    return filteredByCampusAndYear;
    
  }, [coursesData, currentCampus, currentYear]); // grade aur academicLevel dependency hatayi

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

  // Selected courses formatting
  useEffect(() => {
    console.log("Courses in state:", courses);
    console.log("Filtered courses:", filteredCourses);
    
    if (courses.length > 0 && filteredCourses.length > 0) {
      const selectedOptions = courses.map(courseId => {
        const course = filteredCourses.find(c => c._id === courseId);
        if (course) {
          return {
            value: course._id,
            label: `${course.courseName} (${course.code || "No Code"})`,
            teacher: course.teacher?.name || "No Teacher"
          };
        }
        console.warn("Course not found in filtered courses:", courseId);
        return null;
      }).filter(Boolean);
      
      console.log("Selected options:", selectedOptions);
      setSelectedCourseOptions(selectedOptions);
    } else {
      setSelectedCourseOptions([]);
    }
  }, [courses, filteredCourses]);

  // Reset courses when grade changes (optional - agar chaho toh rakho)
  useEffect(() => {
    if (grade) {
      setClassGroup(prev => ({ ...prev, courses: [] }));
      setSelectedCourseOptions([]);
    }
  }, [grade]); // academicLevel bhi dependency me tha, ab sirf grade pe reset

  // API Responses
  useEffect(() => {
    if (createError) {
      const errorMessage = createError?.data?.message || createError?.message || t("Something went wrong");
      toast.error(errorMessage);
      console.error("Create error:", createError);
    }
    if (createSuccess) {
      toast.success(t("Class group created successfully"));
      resetForm();
      navigate("/admin/class-groups", { state: { shouldRefetch: true } });
    }
  }, [createError, createSuccess, t, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClassGroup(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setClassGroup({
      grade: "", academicLevel: "", section: "",
      displayName: "", courses: [], status: true,
    });
    setSelectedCourseOptions([]);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("Submitting form:", classGroup);
    
    if (!currentCampus || !currentYear) {
      toast.error(t("Please select campus and year from header first"));
      return;
    }
    if (!academicLevel || !grade || !section) {
      toast.error(t("Please fill all required fields"));
      return;
    }
    
    const payload = {
      ...classGroup,
      campus: currentCampus,
      year: currentYear,
      courses: classGroup.courses
    };
    
    console.log("Final payload:", payload);
    createClassGroupMutation(payload);
  };

  const handleCourseChange = (selectedOptions) => {
    console.log("Course selection changed:", selectedOptions);
    
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log("Selected IDs:", selectedIds);
    
    setClassGroup(prev => ({ ...prev, courses: selectedIds }));
    setSelectedCourseOptions(selectedOptions || []);
  };

  const getGradeName = (gId) => {
    if (!gId) return "N/A";
    const found = gradesData?.grades?.find(g => g._id === (gId?._id || gId));
    return found ? found.gradeName : "N/A";
  };

  const academicLevelOptions = useMemo(() => {
    if (!academicLevelsData?.levels) return [];
    return academicLevelsData.levels
      .filter(l => (l.campus?._id || l.campus) === currentCampus)
      .map(l => ({ value: l._id, label: `${l.name} (${l.code})` }));
  }, [academicLevelsData, currentCampus]);

  const gradeOptions = useMemo(() => {
    if (!availableGrades || availableGrades.length === 0) {
      if (academicLevel) {
        return [{ 
          value: "", 
          label: t("No grades found. Check database?"), 
          disabled: true 
        }];
      }
      return [{ 
        value: "", 
        label: t("Select academic level first"), 
        disabled: true 
      }];
    }
    
    return availableGrades.map(g => ({
      value: g._id,
      label: `${g.gradeName} (Year: ${g.year})`,
      title: `ID: ${g._id}\nCampus: ${g.campus?._id}\nAcademic Level: ${g.academicLevel?._id}`
    }));
  }, [availableGrades, t, academicLevel]);

  const courseOptions = useMemo(() => {
    const options = filteredCourses.map(course => ({
      value: course._id,
      label: `${course.courseName} (${course.code || "No Code"}) - ${course.teacher?.name || "No Teacher"}`,
    }));
    
    console.log("Course options for dropdown:", options);
    return options;
  }, [filteredCourses]);

  // Errors handle karein
  useEffect(() => {
    if (gradesError) {
      console.error("Grades Error:", gradesError);
      toast.error(t("Failed to load grades. Check console."));
    }
    
    if (levelsError) {
      console.error("Academic Levels Error:", levelsError);
    }
    
    if (coursesError) {
      console.error("Courses Error:", coursesError);
      toast.error(t("Failed to load courses. Check console."));
    }
  }, [gradesError, levelsError, coursesError, t]);

  // Refresh courses when grade changes (optional - ab grade filter nahi, phir bhi refresh kar sakte ho)
  useEffect(() => {
    if (grade && currentCampus && currentYear) {
      refetchCourses();
    }
  }, [grade, currentCampus, currentYear, refetchCourses]);

  const isLoading = levelsLoading || gradesLoading || coursesLoading;
  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Create Class Group")} />
      <div className="max-w-6xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('Create Class Group')}</h1>
            <p className="text-xs text-gray-500">{t('Fill in details to create a new class group')}</p>
          </div>
          <BackButton to="/admin/class-groups" label={t('back')} className="px-3 py-1.5 text-xs" />
        </div>

        <div className="mb-6">
          <InfoBanner
            title={t("Current Session")}
            message={`Year: ${currentYear || "Not set"} | Campus: ${currentCampus || "Not set"}`}
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
          
          {currentCampus && currentYear && gradesData?.counts?.total === 0 && (
            <WarningBanner 
              title={t("No Grades Found")} 
              message={t("No active grades found for selected campus and year. Please create grades first.")} 
              type="warning" 
            />
          )}
          
          {currentCampus && currentYear && coursesData?.courses?.length === 0 && (
            <WarningBanner 
              title={t("No Courses Found")} 
              message={t("No active courses found for selected campus and year. Please create courses first.")} 
              type="warning" 
            />
          )}
          
          {/* ✅ Naya Warning: Agar grade select kiya hai lekin courses mein grade field nahi hai */}
          {grade && filteredCourses.length === 0 && (
            <WarningBanner 
              title={t("No Courses Available")} 
              message={t("No courses found for this campus and year. Please create courses or check backend.")} 
              type="info" 
            />
          )}
        </div>

        <form onSubmit={submitHandler}>
          <FormSection 
            title={t("Create New Class Group")} 
            icon="users" 
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
                className="md:col-span-1"
              />
              
              <FormSelect
                label={t("Grade")}
                name="grade"
                value={grade}
                onChange={onChange}
                options={gradeOptions}
                placeholder={t("Select Grade")}
                required={true}
                disabled={!academicLevel || availableGrades.length === 0}
                helperText={
                  availableGrades.length > 0 
                    ? `${availableGrades.length} grade(s) available` 
                    : academicLevel 
                    ? t("No grades found. Check if grades exist in database.") 
                    : t("Select academic level first")
                }
                className="md:col-span-1"
              />
              
              <FormInput
                label={t("Section")}
                name="section"
                value={section}
                onChange={onChange}
                placeholder={t("e.g. A, B, C")}
                required={true}
                className="md:col-span-1"
                maxLength="5"
              />
              
              <FormInput
                label={t("Display Name")}
                name="displayName"
                value={displayName}
                readOnly={true}
                placeholder={t("Auto-generated")}
                className="md:col-span-1"
                helperText={t("Auto-generated from grade and section")}
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

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Courses")}
                  <span className="text-xs text-gray-500 ml-2">
                    ({filteredCourses.length} courses available)
                  </span>
                  {/* ✅ Warning update: ab grade filter nahi hai */}
                  {filteredCourses.length === 0 && (
                    <span className="text-xs text-amber-600 ml-2">
                      {t("No courses found for this campus/year. Please create courses.")}
                    </span>
                  )}
                </label>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  options={courseOptions}
                  value={selectedCourseOptions}
                  onChange={handleCourseChange}
                  placeholder={filteredCourses.length === 0 ? t("No courses available") : t("Select courses...")}
                  isDisabled={filteredCourses.length === 0}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => 
                    filteredCourses.length === 0 
                    ? t("No courses available") 
                    : t("No options")
                  }
                />
                {selectedCourseOptions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      {t("Selected courses")}: {selectedCourseOptions.length}
                      {selectedCourseOptions.map(option => (
                        <span key={option.value} className="block text-xs text-gray-500 mt-1">
                          • {option.label}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <FormActions
                onSubmit={submitHandler}
                onCancel={() => navigate("/admin/class-groups")}
                submitLabel={t("Create Class Group")}
                isLoading={createLoading}
                disabled={!currentCampus || !currentYear || !academicLevel || !grade || !section}
                align="right"
                showCancel={true}
              />
            </div>
          </FormSection>
        </form>
      </div>

      <style jsx>{`
        .react-select-container .react-select__control { 
          border-color: #d1d5db; 
          border-radius: 0.5rem; 
          min-height: 42px; 
        }
        .react-select-container .react-select__control--is-focused { 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
        }
        .react-select-container .react-select__menu {
          z-index: 10;
        }
      `}</style>
    </AdminLayout>
  );
};

export default NewClassGroup;