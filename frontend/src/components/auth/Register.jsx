import React, { useEffect, useState } from "react";
import { useRegisterMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useCountries } from "react-countries";
import { useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useGetAdminUsersQuery } from "../../redux/api/userApi";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetAdminUsersQuery();
  const { countries } = useCountries();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
  });

  const {
    name,
    email,
    password,
    role,
    age,
    gender,
    nationality,
    passportNumber,
    phoneNumber,
    secondaryPhoneNumber,
    address,
  } = user;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("User registered successfully");
      navigate("/admin/users");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    register(user);
  };

  return (
    <AdminLayout>
      <MetaData title={"Register New User"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t('Register New User')}</h2>
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="name_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Name')}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="mb-4">
                <label
                  htmlFor="role_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Role')}
                </label>
                <select
                  id="role_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="role"
                  value={role}
                  onChange={onChange}
                >
                  <option value="user">{t('User')}</option>
                  <option value="admin">{t('Admin')}</option>
                  <option value="teacher">{t('Teacher')}</option>
                  <option value="student">{t('Student')}</option>
                  <option value="finance">{t('Finance')}</option>
                  <option value="principle">{t('Principle')}</option>
                  <option value="counsellor">{t('Counsellor')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="gender_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Gender')}
                </label>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="male"
                      checked={gender === "male"}
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
                      value="female"
                      checked={gender === "female"}
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
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="other"
                      name="gender"
                      value="other"
                      checked={gender === "other"}
                      onChange={onChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="other"
                      className="ml-2 text-sm text-gray-700"
                    >
                      {t('Other')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  htmlFor="passport_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Passport Number')}
                </label>
                <input
                  type="text"
                  id="passport_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="passportNumber"
                  value={passportNumber}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="phone_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Phone Number')}
                </label>
                <input
                  type="text"
                  id="phone_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="secondary_phone_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Secondary Phone Number')}
                </label>
                <input
                  type="text"
                  id="secondary_phone_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="secondaryPhoneNumber"
                  value={secondaryPhoneNumber}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="address_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Address')}
              </label>
              <input
                type="text"
                id="address_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="address"
                value={address}
                onChange={onChange}
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "REGISTER"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Register;