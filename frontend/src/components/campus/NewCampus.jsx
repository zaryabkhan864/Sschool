import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppTextarea from "../GUI/AppTextarea";
import AppInfoBox from "../layout/AppInfoBox";
import AppSubmitButton from "../GUI/AppSubmitButton";
import AppCancelButton from "../GUI/AppCancelButton";

import { useCreateCampusMutation, useGetCampusQuery } from "../../redux/api/campusApi";

const NewCampus = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetCampusQuery();

  const [campus, setCampus] = useState({
    name: "",
    location: "",
    contactNumber: "",
  });

  const { name, location, contactNumber } = campus;

  const [createCampus, { isLoading, error, isSuccess }] = useCreateCampusMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating campus"));
    }
    if (isSuccess) {
      toast.success(t("Campus created successfully"));
      navigate("/admin/campuses");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setCampus((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setCampus((prev) => ({ ...prev, contactNumber: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error(t("Please fill all required fields"));
    }
    createCampus({
      name: name.trim(),
      location: location.trim(),
      contactNumber,
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("Create New Campus")} />

      <div className="max-w-6xl mx-auto py-4">
        <AppPageHeader
          title={t("New Campus")}
          subtitle={t("Create a new campus")}
          backUrl="/admin/campuses"
        />

        <form onSubmit={submitHandler} className="space-y-4">
          <AppCard
            title={t("Campus Information")}
            icon="fa-building"
            footer={
              <div className="flex justify-end gap-2">
                <AppCancelButton backUrl="/admin/campuses" />
                <AppSubmitButton
                  label={t("Create Campus")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-plus-circle"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                name="name"
                value={name}
                onChange={onChange}
                label={t("Campus Name")}
                placeholder="e.g. Main Campus, City Center"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Phone Number")} <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"tr"}
                  value={contactNumber}
                  onChange={handlePhoneChange}
                  inputProps={{
                    name: "contactNumber",
                    required: true,
                  }}
                  containerClass="w-full"
                  inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500 !text-sm"
                  buttonClass="!border-none !bg-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <AppTextarea
                  name="location"
                  value={location}
                  onChange={onChange}
                  label={t("Address")}
                  placeholder="e.g. 123 Main Street, City, Country"
                  rows={3}
                />
              </div>
            </div>

            <AppInfoBox icon="fa-info-circle">
              <strong>{t("Note")}:</strong> {t("Phone number should include country code.")}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewCampus;