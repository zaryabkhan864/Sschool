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
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";

import { useCreateCampusMutation, useGetCampusQuery } from "../../redux/api/campusApi";

const NewCampus = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { refetch } = useGetCampusQuery();
  const [createCampus, { isLoading, error, isSuccess }] = useCreateCampusMutation();

  const [campus, setCampus] = useState({
    name: "",
    code: "",
    location: "",
    contactNumber: "",
    email: "",
  });

  const { name, code, location, contactNumber, email } = campus;

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
    if (!name.trim() || !code.trim() || !contactNumber) {
      return toast.error(t("Please fill all required fields"));
    }
    createCampus({
      name: name.trim(),
      code: code.trim(),
      location: location.trim(),
      contactNumber,
      email: email.trim(),
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("Create New Campus")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Campus")}
          subtitle={t("Create a new campus")}
          backUrl="/admin/campuses"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard
            title={t("Campus Information")}
            icon="fa-building"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/campuses" />
                <AppButton
                  type="submit"
                  label={t("Create Campus")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-plus-circle"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppInput
                name="name"
                value={name}
                onChange={onChange}
                label={t("Campus Name")}
                placeholder="e.g. Main Campus"
                required
              />
              <AppInput
                name="code"
                value={code}
                onChange={onChange}
                label={t("Campus Code")}
                placeholder="e.g. MAIN, CITY"
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
              <AppInput
                name="email"
                type="email"
                value={email}
                onChange={onChange}
                label={t("Email (Optional)")}
                placeholder="campus@example.com"
              />
              <div className="md:col-span-2">
                <AppInput
                  type="textarea"
                  name="location"
                  value={location}
                  onChange={onChange}
                  label={t("Address")}
                  placeholder="e.g. 123 Main Street, City"
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
