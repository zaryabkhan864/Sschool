import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import {
  useGetGradeDetailsQuery,
  useUpdateGradeMutation,
} from "../../redux/api/gradesApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

const UpdateGrade = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();

  // Fetch academic levels
  const { data: levelsData, isLoading: levelsLoading } = useGetAcademicLevelsQuery();

  // Fetch grade details
  const { data: gradeData, isLoading: gradeLoading, error: gradeError } =
    useGetGradeDetailsQuery(params.id);

  // Update mutation
  const [updateGrade, { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess }] =
    useUpdateGradeMutation();

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    academicLevel: "",
    status: true,
  });

  const { gradeName, description, academicLevel, status } = grade;

  // Populate form when grade data loads
  useEffect(() => {
    if (gradeData) {
      const gradeInfo = gradeData.grade || gradeData;
      setGrade({
        gradeName: gradeInfo.gradeName || "",
        description: gradeInfo.description || "",
        academicLevel: gradeInfo.academicLevel?._id || gradeInfo.academicLevel || "",
        status: gradeInfo.status ?? true,
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

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGrade({
      ...grade,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!gradeName.trim() || !description.trim() || !academicLevel) {
      return toast.error("Please fill all required fields");
    }

    updateGrade({
      id: params.id,
      gradeName: gradeName.trim(),
      description: description.trim(),
      academicLevel,
      status,
    });
  };

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

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update Grade")}
          subtitle={t("Update existing grade information")}
          backUrl="/admin/grades"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard
            title={t("Grade Information")}
            icon="fa-graduation-cap"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/grades" />
                <AppButton
                  type="submit"
                  label={t("Update Grade")}
                  loadingLabel="Updating..."
                  isLoading={updateLoading}
                  icon="fa-save"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grade Name */}
              <AppInput
                name="gradeName"
                value={gradeName}
                onChange={onChange}
                label={t("Grade Name")}
                placeholder="e.g. 7th, 8th, 9th"
                required
              />

              {/* Academic Level Dropdown */}
              <SearchableDropdown
                label={t("Academic Level")}
                value={academicLevel}
                onChange={(val) => setGrade(prev => ({ ...prev, academicLevel: val }))}
                options={levelOptions}
                placeholder="Select Level"
                isLoading={levelsLoading}
                required
                // showSelected removed – now defaults to true, so selected level appears
              />

              {/* Status Checkbox */}
              <AppCheckbox
                name="status"
                checked={status}
                onChange={onChange}
                label={t("Active")}
                className="md:mt-6"
              />

              {/* Description (textarea) */}
              <div className="md:col-span-2">
                <AppInput
                  type="textarea"
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

            <AppInfoBox icon="fa-info-circle">
              <strong>{t("Note")}:</strong> - {t("This grade will be updated for the current campus and year. - Changing the Academic Level will affect how this grade is grouped.")}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateGrade;