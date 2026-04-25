import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Loader from "../layout/Loader";

import {
  useGetCampusDetailsQuery,
  useGetCampusQuery,
  useUpdateCampusMutation,
} from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";

const UpdateCampus = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { refetch } = useGetCampusQuery();

  const [updateCampus, { isLoading, error, isSuccess }] =
    useUpdateCampusMutation();
  const { data, isLoading: detailsLoading } = useGetCampusDetailsQuery(id);

  const [campus, setCampus] = useState({
    name: "",
    code: "",
    location: "",
    contactNumber: "",
    email: "",
  });

  const { name, code, location, contactNumber, email } = campus;

  // Prefill form with campus details
  useEffect(() => {
    if (data?.campus) {
      setCampus({
        name: data.campus.name || "",
        code: data.campus.code || "",
        location: data.campus.location || "",
        contactNumber: data.campus.contactNumber || "",
        email: data.campus.email || "",
      });
    }
  }, [data]);

  // Handle API response
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error updating campus"));
    }
    if (isSuccess) {
      toast.success(t("Campus updated successfully"));
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
    // ✅ FIX: pass fields directly, not wrapped in `body`
    updateCampus({
      id,
      name: name.trim(),
      code: code.trim(),
      location: location.trim(),
      contactNumber,
      email: email.trim(),
    });
  };

  if (detailsLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Update Campus")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update Campus")}
          subtitle={t("Edit campus information")}
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
                  label={t("Update Campus")}
                  loadingLabel={t("Updating...")}
                  isLoading={isLoading}
                  icon="fa-save"
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
              <strong>{t("Note")}:</strong>{" "}
              {t("Phone number should include country code.")}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateCampus;