// src/components/admin/UpdateTeacher.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCountries } from "react-countries";

import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApi";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";

const UpdateTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { countries } = useCountries();

  const [teacher, setTeacher] = useState({
    role: "teacher",
    name: "",
    age: "",
    gender: "",
    passportNumber: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    year: "",
    status: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  
  const [showModal, setShowModal] = useState(false);

  const {
    name,
    age,
    gender,
    passportNumber,
    nationality,
    phoneNumber,
    secondaryPhoneNumber,
    year,
    status,
    email,
    password,
  } = teacher;

  const { data, isLoading: detailsLoading,refetch } = useGetUserDetailsQuery(
    params?.id
  );
  const [updateUser, { isLoading, error, isSuccess }] =
    useUpdateUserMutation();

    const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (data?.user) {
      setTeacher({
        role: "teacher",
        name: data.user.name || "",
        age: data.user.age || "",
        gender: data.user.gender || "",
        passportNumber: data.user.passportNumber || "",
        nationality: data.user.nationality || "",
        phoneNumber: data.user.phoneNumber || "",
        secondaryPhoneNumber: data.user.secondaryPhoneNumber || "",
        year: data.user.year || "",
        status: data.user.status ?? "",
        email: data.user.email || "",
        password: "",
        avatar: data.user.avatar?.url || "",
      });
      setAvatarPreview(data.user.avatar?.url || "");
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Teacher updated successfully");
      setShouldRefresh(true);
      navigate("/admin/teachers", { state: { shouldRefetch: true } });

    }
  }, [data, error, isSuccess, navigate]);

  if (detailsLoading) {
    return <Loader />;
  }

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setTeacher({ ...teacher, avatar: reader.result });
        }
      };
      if (file) reader.readAsDataURL(file);
    } else {
      setTeacher({ ...teacher, [e.target.name]: e.target.value });
    }
  };

  const handlePrimaryPhoneChange = (value) => {
    setTeacher({ ...teacher, phoneNumber: value });
  };
  
  const handleSecondaryPhoneChange = (value) => {
    setTeacher({ ...teacher, secondaryPhoneNumber: value });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateUser({ id: params?.id, body: teacher });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Teacher"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {t("Update")} {t("Teacher")}
          </h2>
          <form onSubmit={handleSubmitClick}>
            {/* Name and Age */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="name_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Teacher")} {t("Name")}
                </label>
                <input
                  type="text"
                  id="name_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="age_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Age")}
                </label>
                <input
                  type="number"
                  id="age_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="age"
                  value={age}
                  onChange={onChange}
                  required
                  min="18"
                  max="100"
                />
              </div>
            </div>

            {/* Nationality, Passport, and Gender */}
            <div className="grid grid-cols-4 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="nationality_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Nationality")}
                </label>
                <select
                  id="nationality_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="nationality"
                  value={nationality}
                  onChange={onChange}
                  required
                >
                  <option value="">{t("Select Nationality")}</option>
                  {countries?.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="passportNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Passport Number")}
                </label>
                <input
                  type="text"
                  id="passportNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="passportNumber"
                  value={passportNumber}
                  onChange={onChange}
                  required
                  minLength={8}
                  maxLength={14}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Gender")}
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={gender === "Male"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{t("Male")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={gender === "Female"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">{t("Female")}</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Status")}
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={status === true || status === "true"}
                      onChange={() => setTeacher({ ...teacher, status: true })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2">{t("Active")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={status === false || status === "false"}
                      onChange={() => setTeacher({ ...teacher, status: false })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2">{t("Inactive")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Phone Number")}
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"tr"}
                    value={phoneNumber}
                    onChange={handlePrimaryPhoneChange}
                    inputProps={{
                      name: "phoneNumber",
                      required: true,
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                    buttonClass="!border-none !bg-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("Secondary Phone Number")}
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"tr"}
                    value={secondaryPhoneNumber}
                    onChange={handleSecondaryPhoneChange}
                    inputProps={{
                      name: "secondaryPhoneNumber",
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                    buttonClass="!border-none !bg-transparent"
                  />
                </div>
              </div>
            </div>



            {/* Email and Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="email_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Email")}
                </label>
                <input
                  type="email"
                  id="email_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Password")}
                </label>
                <input
                  type="password"
                  id="password_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder={t("Leave blank to keep current password")}
                  minLength={6}
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="mb-4">
              <label
                htmlFor="avatar_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t("Avatar")}
              </label>
              <div className="flex items-center mt-1">
                <input
                  type="file"
                  id="avatar_field"
                  name="avatar"
                  accept="image/*"
                  onChange={onChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="ml-4 h-12 w-12 rounded-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? t("Updating...") : t("Update")}
            </button>
          </form>
        </div>
      </div>

      {/* Update Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={isLoading}
        message={t("Do you want to update this teacher?")}
      />
    </AdminLayout>
  );
};

export default UpdateTeacher;