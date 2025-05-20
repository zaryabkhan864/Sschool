import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useCountries } from "react-countries";
import { useNavigate } from "react-router-dom";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

import { useRegisterMutation } from "../../redux/api/authApi";

import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const NewStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetUserByTypeQuery("student");

  const [student, setStudent] = useState({
    role: "student",
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

  } = student;



  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || []; // Ensure it's an array

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Student created");
      navigate("/admin/students");
      refetch()
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setStudent({ ...student, avatar: reader.result });
        }
      };

      reader.readAsDataURL(file);
    } else {
      setStudent({ ...student, [e.target.name]: e.target.value });
    }
  };
  const handlePrimaryPhoneChange = (value) => {
    setStudent((prev) => ({ ...prev, phoneNumber: value }));
  };

  const handleSecondaryPhoneChange = (value) => {
    setStudent((prev) => ({ ...prev, secondaryPhoneNumber: value }));
  };
  const submitHandler = (e) => {
    e.preventDefault();
    // Payload with avatar and other student details
    const payload = {
      ...student,
    };
    register(payload);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Student"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t('New Student')}</h2>
          <form onSubmit={submitHandler}>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="name_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Student Name')}
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
                <label
                  htmlFor="age_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Age')}
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
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="nationality_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Nationality')}
                </label>
                <select
                  type="text"
                  id="nationality_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="nationality"
                  value={nationality}
                  onChange={onChange}
                >
                  {countries?.map(({ name, dial_code, code, flag }) => (
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
                  {t('Passport No')}
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
                    e.target.setCustomValidity(
                      "Passport number must be 8 to 14 characters"
                    )
                  }
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('Gender')}
                </label>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="Male"
                      checked={gender === "Male"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="male"
                      className="ml-2 text-sm text-gray-700"
                    >
                      {t('Male')}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="Female"
                      checked={gender === "Female"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="female"
                      className="ml-2 text-sm text-gray-700"
                    >
                      {t('Female')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="phoneNumber_field" className="block text-sm font-medium text-gray-700">
                  {t('Contact No')}
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"tr"}
                    value={phoneNumber}
                    onChange={handlePrimaryPhoneChange}
                    inputProps={{
                      name: "phoneNumber_field",
                      required: true,
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                    buttonClass="!border-none !bg-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="secondaryPhoneNumber_field" className="block text-sm font-medium text-gray-700">
                  {t('Contact No 2')}
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"tr"}
                    value={secondaryPhoneNumber}
                    onChange={handleSecondaryPhoneChange}
                    inputProps={{
                      name: "secondaryPhoneNumber_field",
                      required: true,
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                    buttonClass="!border-none !bg-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="year_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Year')}
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
                  onInvalid={(e) =>
                    e.target.setCustomValidity(
                      "Year"
                    )
                  }
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="grade_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Grade')}
                </label>
                <select
                  id="grade_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="grade"
                  value={grade}
                  onChange={onChange}
                >
                  <option value="" disabled>
                    {t('Select Grade')}
                  </option>
                  {!gradeLoading &&
                    grades?.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.gradeName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('Status')}
                </label>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="active"
                      name="status"
                      value={true}
                      checked={status === true || status === "true"}
                      onChange={(e) =>
                        setStudent({ ...student, status: true })
                      }
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                      {t('Active')}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="inactive"
                      name="status"
                      value={false}
                      checked={status === false || status === "false"}
                      onChange={(e) =>
                        setStudent({ ...student, status: false })
                      }
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label htmlFor="inactive" className="ml-2 text-sm text-gray-700">
                      {t('Inactive')}
                    </label>
                  </div>
                </div>
              </div>
        
            </div>


            <div className="mb-4">
              <label
                htmlFor="address_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Address')}
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
            {/* add email and password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="email_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Email')}
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
                <label
                  htmlFor="password_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Password')}
                </label>
                <input
                  type="password"
                  id="password_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="password"
                  value={password}
                  onChange={onChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="avatar_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Avatar')}
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

            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "CREATE"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewStudent;
