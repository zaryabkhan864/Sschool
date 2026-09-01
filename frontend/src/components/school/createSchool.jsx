// component
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useGetSchoolQuery, useUpsertSchoolMutation } from "../../redux/api/schoolApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import AvatarUpload from "../GUI/AvatarUpload";

const CreateSchool = () => {
  const { t } = useTranslation();

  const { data: school, isFetching } = useGetSchoolQuery();
  const [upsertSchool, { isLoading, error, isSuccess }] = useUpsertSchoolMutation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    tagline: "",
    address: "",
    contactNumber: "",
    email: "",
    website: "",
    establishedYear: "",
    logo: "",
  });

  const [logoPreview, setLogoPreview] = useState("");

  // ✅ Jab school data mil jaye (record already exist karta ho) to form
  // ko usi se pre-fill kar do — taky ye page "edit" ki tarah bhi kaam kare.
  useEffect(() => {
    if (school) {
      setForm({
        name: school.name || "",
        description: school.description || "",
        tagline: school.tagline || "",
        address: school.address || "",
        contactNumber: school.contactNumber || "",
        email: school.email || "",
        website: school.website || "",
        establishedYear: school.establishedYear || "",
        logo: "",
      });
      setLogoPreview(school.logo?.url || "");
    }
  }, [school]);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error saving school info"));
    if (isSuccess) toast.success(t("School info saved successfully"));
  }, [error, isSuccess, t]);

  const {
    name,
    description,
    tagline,
    address,
    contactNumber,
    email,
    website,
    establishedYear,
  } = form;

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "logo") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setLogoPreview(reader.result);
          setForm((prev) => ({ ...prev, logo: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error(t("Please enter school name"));
    }

    upsertSchool({
      ...form,
      establishedYear: establishedYear ? Number(establishedYear) : undefined,
      // ✅ agar logo change nahi hua to khali string backend me
      // undefined jaisa treat ho jaye gi (upload skip ho jaye ga)
      logo: form.logo || undefined,
    });
  };

  return (
    <AdminLayout>
      <MetaData title={t("School Settings")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("School Settings")}
          subtitle={t("Manage your school's name, logo and general information")}
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* ── School Info Form ── */}
          <AppCard
            title={t("School Information")}
            icon="fa-school"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton
                  type="submit"
                  label={t("Save School Info")}
                  loadingLabel={t("Saving...")}
                  isLoading={isLoading}
                  icon="fa-save"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <AvatarUpload
                name="logo"
                preview={logoPreview}
                onChange={onChange}
                title={t("School Logo")}
                subtitle={t("Max size 2MB")}
              />

              <div className="grid grid-cols-1 gap-4">
                <AppInput
                  label={t("School Name")}
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  maxLength={100}
                />
                <AppInput
                  label={t("Tagline")}
                  name="tagline"
                  value={tagline}
                  onChange={onChange}
                  placeholder={t("A short motto or slogan")}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <AppInput
                label={t("Email Address")}
                type="email"
                name="email"
                value={email}
                onChange={onChange}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Contact Number")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={contactNumber}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, contactNumber: val }))
                  }
                  inputProps={{ maxLength: 17 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <AppInput
                label={t("Website")}
                name="website"
                value={website}
                onChange={onChange}
                placeholder="https://"
              />
              <AppInput
                label={t("Established Year")}
                type="number"
                name="establishedYear"
                value={establishedYear}
                onChange={onChange}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <AppInput
                label={t("Address")}
                name="address"
                value={address}
                onChange={onChange}
                type="textarea"
                rows={2}
              />
              <AppInput
                label={t("Description")}
                name="description"
                value={description}
                onChange={onChange}
                type="textarea"
                rows={3}
              />
            </div>
          </AppCard>
        </form>

        {/* ── Preview / Display of saved School data ── */}
        {!isFetching && school && (
          <div className="mt-6">
            <AppCard title={t("Current School Profile")} icon="fa-eye">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-28 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                  {school.logo?.url ? (
                    <img
                      src={school.logo.url}
                      alt={school.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa fa-school text-3xl text-gray-300"></i>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h2 className="text-lg font-bold text-gray-800">{school.name}</h2>
                  {school.tagline && (
                    <p className="text-sm text-gray-500 italic">{school.tagline}</p>
                  )}
                  {school.description && (
                    <p className="text-sm text-gray-600">{school.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm text-gray-600">
                    {school.email && (
                      <p>
                        <i className="fa fa-envelope w-4 text-gray-400"></i> {school.email}
                      </p>
                    )}
                    {school.contactNumber && (
                      <p>
                        <i className="fa fa-phone w-4 text-gray-400"></i> {school.contactNumber}
                      </p>
                    )}
                    {school.website && (
                      <p>
                        <i className="fa fa-globe w-4 text-gray-400"></i> {school.website}
                      </p>
                    )}
                    {school.establishedYear && (
                      <p>
                        <i className="fa fa-calendar w-4 text-gray-400"></i>{" "}
                        {t("Established")} {school.establishedYear}
                      </p>
                    )}
                    {school.address && (
                      <p className="md:col-span-2">
                        <i className="fa fa-map-marker w-4 text-gray-400"></i> {school.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AppCard>
          </div>
        )}

        {/* ── Empty state (no school record yet) ── */}
        {!isFetching && !school && (
          <div className="mt-6 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg py-6">
            {t("No school profile saved yet. Fill the form above to create one.")}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateSchool;
