import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCountries } from "react-countries";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import {
  useGetUserByTypeQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import Loader from "../layout/Loader";

const UpdateStudent = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetUserByTypeQuery("student");

  const { data: userData, isLoading: detailsLoading } = useGetUserDetailsQuery(params?.id);
  console.log("user daetails",userData)
  const { data: studentsData } = useGetUserByTypeQuery("student");
  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || [];

  const [
    updateUser,
    { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess },
  ] = useUpdateUserMutation();

  const [student, setStudent] = useState({
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
    avatar: "",
    siblings: [],
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [showModal, setShowModal] = useState(false);

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
    siblings,
  } = student;

  useEffect(() => {
    if (userData?.user) {
      setStudent({
        name: userData?.user?.name || "",
        age: userData?.user?.age || "",
        gender: userData?.user?.gender || "",
        nationality: userData?.user?.nationality || "",
        passportNumber: userData?.user?.passportNumber || "",
        phoneNumber: userData?.user?.phoneNumber || "",
        secondaryPhoneNumber: userData?.user?.secondaryPhoneNumber || "",
        address: userData?.user?.address || "",
        grade: userData?.user?.grade?._id || userData?.user?.grade || "",
        status: userData?.user?.status,
        email: userData?.user?.email || "",
        avatar: userData?.user?.avatar?.url || "",
        siblings: userData?.user?.siblings || [],
      });
      setAvatarPreview(userData?.user?.avatar?.url);
    }
  }, [userData]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError?.data?.message);
    }
    if (updateSuccess) {
      toast.success("Student updated successfully");
      navigate("/admin/students");
      refetch();
    }
  }, [updateError, updateSuccess, navigate, refetch]);

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

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmUpdate = () => {
    const formattedStudent = { ...student };
    updateUser({ id: params.id, body: formattedStudent });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Student"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t("Update Student")}</h2>
          <form onSubmit={handleSubmitClick}>
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name_field" className="block text-sm font-medium text-gray-700">
                  {t("Student Name")}
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
              {/* Age */}
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Nationality */}
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
                  required
                >
                  {countries?.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Passport */}
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
              {/* Gender */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Gender")}</label>
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
                      required
                    />
                    <label htmlFor="male" className="ml-2 text-sm text-gray-700">
                      {t("Male")}
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
                    <label htmlFor="female" className="ml-2 text-sm text-gray-700">
                      {t("Female")}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone 1 */}
              <div className="mb-4">
                <label htmlFor="phoneNumber_field" className="block text-sm font-medium text-gray-700">
                  {t("Contact No")}
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
              {/* Phone 2 */}
              <div className="mb-4">
                <label
                  htmlFor="secondaryPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Contact No 2")}
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

            <div className="grid grid-cols-2 gap-4">
              {/* Grade */}
              <div className="mb-4">
                <label htmlFor="grade_field" className="block text-sm font-medium text-gray-700">
                  {t("Grade")}
                </label>
                <select
                  id="grade_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="grade"
                  value={grade}
                  onChange={onChange}
                  required
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
              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{t("Status")}</label>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="active"
                      name="status"
                      value={true}
                      checked={status === true || status === "true"}
                      onChange={() => setStudent({ ...student, status: true })}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                      {t("Active")}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="inactive"
                      name="status"
                      value={false}
                      checked={status === false || status === "false"}
                      onChange={() => setStudent({ ...student, status: false })}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label htmlFor="inactive" className="ml-2 text-sm text-gray-700">
                      {t("Inactive")}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Siblings Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("Siblings")}</label>
              {siblings.map((sibling, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sibling}
                    onChange={(e) => updateSibling(index, e.target.value)}
                  >
                    <option value="" disabled>
                      {t("Select a sibling")}
                    </option>
                    {studentsData?.users &&
                      studentsData?.users
                        .filter((s) => s._id !== params.id)
                        .map((s) => (
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
                required
              ></textarea>
            </div>

            {/* Email */}
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
                required
              />
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
              className={`w-full py-2 text-white font-semibold rounded-md ${
                updateLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={updateLoading}
            >
              {updateLoading ? t("Updating...") : t("Update")}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={updateLoading}
        message={t("Do you want to update this student?")}
      />
    </AdminLayout>
  );
};

export default UpdateStudent;
