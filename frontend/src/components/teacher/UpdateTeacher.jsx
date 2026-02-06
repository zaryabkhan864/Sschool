// src/components/admin/UpdateTeacher.jsx
import React, { useEffect, useState } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

const UpdateTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { countries } = useCountries();

  const [teacher, setTeacher] = useState({
    role: "teacher",
    name: "",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    status: true,
    email: "",
    password: "",
    address: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    name,
    dateOfBirth,
    gender,
    passportNumber,
    nationality,
    phoneNumber,
    secondaryPhoneNumber,
    status,
    email,
    password,
    address,
  } = teacher;

  const { data, isLoading: detailsLoading, refetch: refetchDetails } =
    useGetUserDetailsQuery(params?.id);
  const [updateUser, { isLoading, error, isSuccess }] =
    useUpdateUserMutation();

  useEffect(() => {
    if (data?.user) {
      const userData = data.user;
      
      // Format dateOfBirth to YYYY-MM-DD
      let formattedDate = "";
      if (userData.dateOfBirth) {
        try {
          // Handle different date formats
          const dateObj = new Date(userData.dateOfBirth);
          if (!isNaN(dateObj.getTime())) {
            // Convert to YYYY-MM-DD format for input
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      setTeacher({
        role: "teacher",
        name: userData.name || "",
        dateOfBirth: formattedDate,
        gender: userData.gender || "",
        passportNumber: userData.passportNumber || "",
        nationality: userData.nationality || "",
        phoneNumber: userData.phoneNumber || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber || "",
        status: userData.status ?? true,
        email: userData.email || "",
        password: "",
        address: userData.address || "",
        avatar: userData.avatar?.url || "",
      });
      setAvatarPreview(userData.avatar?.url || "");
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success(t("Teacher Updated"));
      navigate("/admin/teachers");
      refetchDetails();
    }
  }, [data, error, isSuccess, navigate, refetchDetails, t]);

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setAvatarPreview(reader.result);
            setTeacher({ ...teacher, avatar: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === "status") {
      setTeacher({ ...teacher, status: e.target.value === "true" });
    } else {
      setTeacher({ ...teacher, [e.target.name]: e.target.value });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const updateData = { ...teacher };
    
    // Format dateOfBirth to ISO string without time (YYYY-MM-DDT00:00:00.000Z)
    if (updateData.dateOfBirth) {
      try {
        // Create date object at start of day (00:00:00) in local timezone
        const dateObj = new Date(updateData.dateOfBirth);
        // Convert to ISO string in UTC
        updateData.dateOfBirth = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate()
        ).toISOString();
      } catch (error) {
        console.error("Error formatting date:", error);
        // Keep original value if formatting fails
      }
    }
    
    // Don't send password if it's empty
    if (!updateData.password) {
      delete updateData.password;
    }
    
    // Don't send avatar if it's not changed (already a URL string)
    if (updateData.avatar && updateData.avatar.startsWith('http')) {
      delete updateData.avatar;
    }
    
    updateUser({ id: params?.id, body: updateData });
  };

  if (detailsLoading) {
    return <Loader />;
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass =
    "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("Update Teacher")} />

      <div className="max-w-6xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t("Update Teacher")}
            </h1>
            <p className="text-xs text-gray-500">
              {t("Update faculty member information")}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/teachers")}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <i className="fa fa-arrow-left mr-1"></i> {t("back")}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section 1: Credentials */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-lock text-blue-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">
                  {t("Account Credentials")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t("Full Name")} *</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("Email Address")} *</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Password")} ({t("optional")})
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    className={inputClass}
                    placeholder={t("Leave blank to keep current password")}
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Personal & Contact */}
            <div className="p-5 bg-gray-50/30">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-user text-green-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">
                  {t("Personal Information")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>{t("Gender")}</label>
                  <select
                    name="gender"
                    value={gender}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("Date of Birth")} *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={dateOfBirth}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("Nationality")}</label>
                  <select
                    name="nationality"
                    value={nationality}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="">Select Country</option>
                    {countries?.map(({ name }) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("Passport No")}</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={passportNumber}
                    onChange={onChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="phone-compact">
                  <label className={labelClass}>{t("Primary Contact")}</label>
                  <PhoneInput
                    country={"tr"}
                    value={phoneNumber}
                    onChange={(val) =>
                      setTeacher({ ...teacher, phoneNumber: val })
                    }
                    inputClass="!w-full !h-[38px] !text-sm !border-gray-200 !rounded-lg"
                    containerClass="!w-full"
                  />
                </div>
                <div className="phone-compact">
                  <label className={labelClass}>
                    {t("Secondary/Emergency Contact")}
                  </label>
                  <PhoneInput
                    country={"tr"}
                    value={secondaryPhoneNumber}
                    onChange={(val) =>
                      setTeacher({ ...teacher, secondaryPhoneNumber: val })
                    }
                    inputClass="!w-full !h-[38px] !text-sm !border-gray-200 !rounded-lg"
                    containerClass="!w-full"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("Status")}</label>
                  <select
                    name="status"
                    value={status}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>
                  {t("Residential Address")}
                </label>
                <textarea
                  name="address"
                  value={address}
                  onChange={onChange}
                  rows="2"
                  className={`${inputClass} resize-none`}
                ></textarea>
              </div>
            </div>

            {/* Section 3: Avatar */}
            <div className="p-5 border-t border-gray-100 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa fa-camera text-gray-300 text-xl"></i>
                  )}
                </div>
                <label
                  htmlFor="avatar_field"
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-md"
                >
                  <i className="fa fa-plus text-[10px]"></i>
                </label>
                <input
                  type="file"
                  id="avatar_field"
                  accept="image/*"
                  onChange={onChange}
                  name="avatar"
                  className="hidden"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">
                  {t("Profile Picture")}
                </h4>
                <p className="text-[10px] text-gray-500">
                  Max size 2MB (JPG/PNG)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/teachers")}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:underline"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                  isLoading
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
              >
                {isLoading ? t("updating") : t("Update Teacher")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateTeacher;