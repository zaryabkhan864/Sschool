import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetCoursesQuery } from "../../redux/api/courseApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi"; // <-- new import
import {
  useGetGradeDetailsQuery,
  useUpdateGradeMutation,
} from "../../redux/api/gradesApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";

// GUI components
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppTextarea from "../GUI/AppTextarea";
import AppSelect from "../GUI/AppSelect";           // <-- new import
import AppCheckbox from "../GUI/AppCheckbox";       // <-- new import
import AppInfoBox from "../layout/AppInfoBox";
import AppSubmitButton from "../GUI/AppSubmitButton";
import AppCancelButton from "../GUI/AppCancelButton";

// CourseDropdown component (keep your existing implementation)
const CourseDropdown = ({ 
  index, 
  selectedCourse, 
  onCourseSelect, 
  onClear,
  isRequired = true 
}) => {
  // ... (your existing CourseDropdown code)
};

// Main UpdateGrade Component
const UpdateGrade = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();

  // Fetch academic levels (same as NewGrade)
  const { data: levelsData, isLoading: levelsLoading } = useGetAcademicLevelsQuery();

  const { data: gradeData, isLoading: gradeLoading, error: gradeError } = 
    useGetGradeDetailsQuery(params.id);
  const [updateGrade, { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess }] =
    useUpdateGradeMutation();

  // Extended state to include academicLevel and status
  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    academicLevel: "",        // <-- new field
    status: true,             // <-- new field
    courses: [],
  });

  const { gradeName, description, academicLevel, status, courses } = grade;
  const [showModal, setShowModal] = useState(false);

  // Populate form with fetched grade data
  useEffect(() => {
    if (gradeData) {
      const gradeInfo = gradeData.grade || gradeData;
      setGrade({
        gradeName: gradeInfo.gradeName || "",
        description: gradeInfo.description || "",
        // Extract academicLevel ID if it's populated, otherwise use empty string
        academicLevel: gradeInfo.academicLevel?._id || gradeInfo.academicLevel || "",
        status: gradeInfo.status ?? true,   // default to true if not provided
        courses: gradeInfo.courses || [],
      });
    }

    if (gradeError) {
      toast.error(gradeError?.data?.message || "Error loading grade details");
    }

    if (updateError) {
      toast.error(updateError?.data?.message || "Error updating grade");
    }

    if (updateSuccess) {
      toast.success(t("Grade Updated Successfully"));
      navigate("/admin/grades");
    }
  }, [gradeData, gradeError, updateError, updateSuccess, navigate, t]);

  // Handle text/select/checkbox changes
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGrade({
      ...grade,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Course management (unchanged)
  const addCourse = () => {
    setGrade({ ...grade, courses: [...courses, null] });
  };

  const updateCourse = (index, courseObj) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = courseObj;
    setGrade({ ...grade, courses: updatedCourses });
  };

  const removeCourse = (index) => {
    const updatedCourses = [...courses];
    updatedCourses.splice(index, 1);
    setGrade({ ...grade, courses: updatedCourses });
  };

  // Prepare submit – show confirmation modal
  const handleSubmitClick = (e) => {
    e.preventDefault();

    // Basic validation (similar to NewGrade)
    if (!gradeName.trim() || !description.trim() || !academicLevel) {
      return toast.error("Please fill all required fields");
    }

    // Course validation (keep as is)
    const courseIds = courses.filter(c => c !== null && c._id).map(c => c._id);
    if (courseIds.length === 0) {
      toast.error("Please add at least one course");
      return;
    }

    setShowModal(true);
  };

  // Actual update call
  const confirmUpdate = () => {
    const courseIds = courses.filter(c => c !== null && c._id).map(c => c._id);
    updateGrade({ 
      id: params.id, 
      body: { 
        gradeName: gradeName.trim(), 
        description: description.trim(), 
        academicLevel,               // <-- new field
        status,                      // <-- new field
        courses: courseIds 
      } 
    });
    setShowModal(false);
  };

  // Prepare options for academic level dropdown
  const levelOptions = levelsData?.levels?.map((level) => ({
    value: level._id,
    label: level.name,
  })) || [];

  if (gradeLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Update Grade")} />

      <div className="max-w-6xl mx-auto py-4">
        <AppPageHeader
          title={t("Update Grade")}
          subtitle={t("Update existing grade information")}
          backUrl="/admin/grades"
        />

        <form onSubmit={handleSubmitClick} className="space-y-4">
          <AppCard
            title={t("Grade Information")}
            icon="fa-graduation-cap"
            footer={
              <div className="flex justify-end gap-2">
                <AppCancelButton backUrl="/admin/grades" />
                <AppSubmitButton 
                  label="Update Grade" 
                  loadingLabel="Updating..." 
                  isLoading={updateLoading} 
                  icon="fa-save"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grade Name */}
              <AppInput
                name="gradeName"
                value={gradeName}
                onChange={onChange}
                label={t("Grade Name")}
                placeholder="e.g. 7th, 8th, 9th"
                required
              />

              {/* Academic Level (new) */}
              <AppSelect
                name="academicLevel"
                value={academicLevel}
                onChange={onChange}
                label={t("Academic Level")}
                options={levelOptions}
                placeholder="Select Level"
                loading={levelsLoading}
                required
              />

              {/* Status Checkbox (new) */}
              <AppCheckbox
                name="status"
                checked={status}
                onChange={onChange}
                label={t("Active")}
                className="md:mt-6"
              />

              {/* Description */}
              <div className="md:col-span-2">
                <AppTextarea
                  name="description"
                  value={description}
                  onChange={onChange}
                  label={t("Description")}
                  placeholder="e.g. Seventh Grade, Eighth Grade, etc."
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Course Assignment section (unchanged) */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-book text-green-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Course Assignment')}</h3>
              </div>

              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <CourseDropdown
                        index={index}
                        selectedCourse={course}
                        onCourseSelect={(obj) => updateCourse(index, obj)}
                        onClear={() => updateCourse(index, null)}
                      />
                    </div>
                    {courses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCourse(index)}
                        className="mt-6 px-3 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <i className="fa fa-trash mr-1"></i> {t('Remove')}
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCourse}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <i className="fa fa-plus"></i> {t('Add Course')}
                </button>
              </div>
            </div>

            {/* Updated Info Box */}
            <AppInfoBox icon="fa-info-circle">
              <strong>Note:</strong> - This grade will be updated for the current campus and year.<br />
              - Changing the Academic Level will affect how this grade is grouped.<br />
              - Courses can be assigned or removed as needed.
            </AppInfoBox>
          </AppCard>
        </form>
      </div>

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={updateLoading}
        message={t("Do you want to update this grade?")}
        confirmText={t("Update")}
        cancelText={t("Cancel")}
      />
    </AdminLayout>
  );
};

export default UpdateGrade;