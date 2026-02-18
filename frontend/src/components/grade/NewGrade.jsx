import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateGradeMutation } from "../../redux/api/gradesApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";

import AdminLayout from "../GUI/AdminLayout";
import MetaData from "../layout/MetaData";

// Import reusable UI components


import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppSelect from "../GUI/AppSelect";
import AppCheckbox from "../GUI/AppCheckbox";
import AppTextarea from "../GUI/AppTextarea";
import AppInfoBox from "../layout/AppInfoBox";

const NewGrade = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch Academic Levels for Dropdown
  const { data: levelsData, isLoading: levelsLoading } = useGetAcademicLevelsQuery();

  const [createGrade, { isLoading: isCreating, error, isSuccess }] = useCreateGradeMutation();

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    academicLevel: "",
    status: true,
  });

  const { gradeName, description, academicLevel, status } = grade;

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Error creating grade");
    }
    if (isSuccess) {
      toast.success(t("Grade Created Successfully"));
      navigate("/admin/grades");
    }
  }, [error, isSuccess, navigate, t]);

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
      return toast.error("Please fill all required fields including Academic Level");
    }

    const payload = {
      gradeName: gradeName.trim(),
      description: description.trim(),
      academicLevel,
      status,
    };

    createGrade(payload);
  };

  // Prepare options for select dropdown
  const levelOptions = levelsData?.levels?.map((level) => ({
    value: level._id,
    label: level.name,
  })) || [];

  return (
    <AdminLayout>
      <MetaData title={t("Create New Grade")} />

      <div className="max-w-6xl mx-auto py-4">
        <AppPageHeader
          title={t("New Grade")}
          subtitle={t("Create a new grade")}
          backUrl="/admin/grades"
        />

        <form onSubmit={submitHandler} className="space-y-4">
          <AppCard
            header={
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-graduation-cap text-blue-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">
                  {t("Grade Information")}
                </h3>
              </div>
            }
            footer={
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/grades")}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:underline"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                    isCreating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-md"
                  }`}
                >
                  {isCreating ? t("Creating...") : t("Create Grade")}
                </button>
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

              {/* Academic Level Dropdown */}
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

              {/* Status Checkbox */}
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

            <AppInfoBox icon="fa-info-circle">
              <strong>Note:</strong> - Grade will be created for current campus and year.<br />
              - This Grade will be linked to the selected Academic Level.
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewGrade;