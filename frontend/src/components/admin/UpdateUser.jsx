import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useCountries } from "react-countries";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

const UpdateUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { id } = useParams();

  const { data, isLoading: userLoading } = useGetUserDetailsQuery(id);
  const [updateUser, { isLoading, error, isSuccess }] =
    useUpdateUserMutation();

  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || [];

  const [user, setUser] = useState({
    role: "",
    name: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    year: "",
    status: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    role,
    name,
    age,
    gender,
    nationality,
    passportNumber,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    year,
    status,
    email,
    password,
  } = user;

  // Prefill data when fetched
  useEffect(() => {
    if (data?.user) {
      setUser({
        role: data.user.role || "",
        name: data.user.name || "",
        age: data.user.age || "",
        gender: data.user.gender || "",
        nationality: data.user.nationality || "",
        passportNumber: data.user.passportNumber || "",
        phoneNumber: data.user.phoneNumber || "",
        secondaryPhoneNumber: data.user.secondaryPhoneNumber || "",
        address: data.user.address || "",
        grade: data.user.grade || "",
        year: data.user.year || "",
        status: data.user.status,
        email: data.user.email || "",
        password: "",
        avatar: "",
      });
      setAvatarPreview(data.user.avatar?.url || "");
    }
  }, [data]);

  // Success / Error handlers
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }
    if (isSuccess) {
      toast.success("User updated");
      navigate("/admin/users");
    }
  }, [error, isSuccess, navigate]);

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setUser({ ...user, avatar: reader.result });
        }
      };

      reader.readAsDataURL(file);
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handlePrimaryPhoneChange = (value) => {
    setUser((prev) => ({ ...prev, phoneNumber: value }));
  };

  const handleSecondaryPhoneChange = (value) => {
    setUser((prev) => ({ ...prev, secondaryPhoneNumber: value }));
  };

  // const submitHandler = (e) => {
  //   e.preventDefault();
  //   updateUser({ id, body: user });
  // };

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Create a copy of user data without empty avatar
    const userData = {...user};
    if (!userData.avatar || userData.avatar === "") {
      delete userData.avatar;
    }
    
    updateUser({ id, body: userData });
  };

  if (userLoading) return <p className="text-center mt-10">{t("Loading...")}</p>;

  return (
    <AdminLayout>
      <MetaData title={"Update User"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t("Update User")}</h2>
          <form onSubmit={submitHandler}>
            {/* Name + Age */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="name_field" className="block text-sm font-medium text-gray-700">
                  {t("User Name")}
                </label>
                <input
                  type="text"
                  id="name_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  value={name}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="age_field" className="block text-sm font-medium text-gray-700">
                  {t("Age")}
                </label>
                <input
                  type="number"
                  id="age_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="age"
                  value={age}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Nationality + Passport + Gender */}
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label htmlFor="nationality_field" className="block text-sm font-medium text-gray-700">
                  {t("Nationality")}
                </label>
                <select
                  id="nationality_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="nationality"
                  value={nationality}
                  onChange={onChange}
                >
                  {countries?.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="passportNumber_field" className="block text-sm font-medium text-gray-700">
                  {t("Passport No")}
                </label>
                <input
                  type="text"
                  id="passportNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="passportNumber"
                  value={passportNumber}
                  maxLength={14}
                  minLength={8}
                  pattern="[a-zA-z0-9]{8,14}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity("Passport number must be 8 to 14 characters")
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Gender")}</label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="Male"
                      checked={gender === "Male"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm">{t("Male")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="Female"
                      checked={gender === "Female"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm">{t("Female")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Phones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="phoneNumber_field" className="block text-sm font-medium text-gray-700">
                  {t("Contact No")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={handlePrimaryPhoneChange}
                  inputProps={{ required: true }}
                  containerClass="w-full"
                  inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                  buttonClass="!border-none !bg-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="secondaryPhoneNumber_field" className="block text-sm font-medium text-gray-700">
                  {t("Contact No 2")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={secondaryPhoneNumber}
                  onChange={handleSecondaryPhoneChange}
                  inputProps={{ required: true }}
                  containerClass="w-full"
                  inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                  buttonClass="!border-none !bg-transparent"
                />
              </div>
            </div>

            {/* Year, Role, Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label htmlFor="year_field" className="block text-sm font-medium text-gray-700">
                  {t("Year")}
                </label>
                <input
                  type="text"
                  id="year_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="year"
                  value={year}
                  maxLength={4}
                  minLength={4}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("Year must be 4 digits")}
                  onInput={(e) => e.target.setCustomValidity("")}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("Role")}</label>
                <select
                  name="role"
                  value={role}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">{t("User")}</option>
                  <option value="admin">{t("Admin")}</option>
                  <option value="teacher">{t("Teacher")}</option>
                  <option value="student">{t("Student")}</option>
                  <option value="finance">{t("Finance")}</option>
                  <option value="principle">{t("Principle")}</option>
                  <option value="counsellor">{t("Counsellor")}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Status")}</label>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="active"
                      name="status"
                      value={true}
                      checked={status === true || status === "true"}
                      onChange={() => setUser({ ...user, status: true })}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm">{t("Active")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="inactive"
                      name="status"
                      value={false}
                      checked={status === false || status === "false"}
                      onChange={() => setUser({ ...user, status: false })}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm">{t("Inactive")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label htmlFor="address_field" className="block text-sm font-medium text-gray-700">
                {t("Address")}
              </label>
              <textarea
                id="address_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="address"
                rows="2"
                value={address}
                onChange={onChange}
              ></textarea>
            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="email_field" className="block text-sm font-medium text-gray-700">
                  {t("Email")}
                </label>
                <input
                  type="email"
                  id="email_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  value={email}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password_field" className="block text-sm font-medium text-gray-700">
                  {t("Password")}
                </label>
                <input
                  type="password"
                  id="password_field"
                  placeholder="Leave blank to keep unchanged"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="password"
                  value={password}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="mb-4">
              <label htmlFor="avatar_field" className="block text-sm font-medium text-gray-700">
                {t("Avatar")}
              </label>
              <input
                type="file"
                id="avatar_field"
                accept="image/*"
                onChange={onChange}
                name="avatar"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2 text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "UPDATE"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdateUser;
