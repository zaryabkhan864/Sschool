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
  // const { refetch: refetchStudents, data: studentList } = useGetUserByTypeQuery("student");
    const { data, isLoading:isLoadingStudents, error:errorStudents, refetch:refetchStudents } = useGetUserByTypeQuery("student");
  console.log("datadatadatadatadata", data)
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
    status: "",
    email: "",
    password: "",
    avatar: "",
    siblings: [], // ✅ added field
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
    status,
    email,
    password,
    siblings,
  } = student;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || [];

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }
    if (isSuccess) {
      toast.success("Student created");
      navigate("/admin/students");
      refetchStudents();
    }
  }, [error, isSuccess, navigate, refetchStudents]);

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

  // ✅ Siblings functions
  const addSibling = () => {
    setStudent((prev) => ({ ...prev, siblings: [...prev.siblings, ""] }));
  };

  const removeSibling = (index) => {
    const updated = [...siblings];
    updated.splice(index, 1);
    setStudent((prev) => ({ ...prev, siblings: updated }));
  };

  const updateSibling = (index, value) => {
    const updated = [...siblings];
    updated[index] = value;
    setStudent((prev) => ({ ...prev, siblings: updated }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    register({ ...student });
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Student"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t("New Student")}</h2>
          <form onSubmit={submitHandler}>
            {/* Name & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="name_field" className="block text-sm font-medium text-gray-700">
                  {t("Student Name")}
                </label>
                <input
                  type="text"
                  id="name_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  name="age"
                  value={age}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Nationality, Passport, Gender */}
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label htmlFor="nationality_field" className="block text-sm font-medium text-gray-700">
                  {t("Nationality")}
                </label>
                <select
                  id="nationality_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  name="passportNumber"
                  value={passportNumber}
                  maxLength={14}
                  minLength={8}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Gender")}</label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center">
                    <input type="radio" name="gender" value="Male" checked={gender === "Male"} onChange={onChange} />
                    <span className="ml-2">{t("Male")}</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="gender" value="Female" checked={gender === "Female"} onChange={onChange} />
                    <span className="ml-2">{t("Female")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Phones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Contact No")}</label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={handlePrimaryPhoneChange}
                  inputClass="!w-full !h-[42px]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Contact No 2")}</label>
                <PhoneInput
                  country={"tr"}
                  value={secondaryPhoneNumber}
                  onChange={handleSecondaryPhoneChange}
                  inputClass="!w-full !h-[42px]"
                />
              </div>
            </div>

            {/* Year, Grade, Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Grade")}</label>
                <select
                  name="grade"
                  value={grade}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    {t("Select Grade")}
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
                <label className="block text-sm font-medium text-gray-700">{t("Status")}</label>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={true}
                      checked={status === true || status === "true"}
                      onChange={() => setStudent({ ...student, status: true })}
                    />
                    <span className="ml-2">{t("Active")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={false}
                      checked={status === false || status === "false"}
                      onChange={() => setStudent({ ...student, status: false })}
                    />
                    <span className="ml-2">{t("Inactive")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ✅ Siblings Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("Siblings")}</label>
              {siblings.map((sibling, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sibling}
                    onChange={(e) => updateSibling(index, e.target.value)}
                  >
                    <option value="" disabled>
                      {t("Select a sibling")}
                    </option>
                    {data?.users && data?.users?.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="py-2 px-4 text-white bg-red-600 hover:bg-red-700 rounded-md"
                    onClick={() => removeSibling(index)}
                  >
                    {t("Remove")}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                onClick={addSibling}
              >
                {t("Add Sibling")}
              </button>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("Address")}</label>
              <textarea
                name="address"
                rows="2"
                value={address}
                onChange={onChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Email")}</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Password")}</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("Avatar")}</label>
              <input type="file" name="avatar" accept="image/*" onChange={onChange} />
              {avatarPreview && (
                <img src={avatarPreview} alt="Avatar Preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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
