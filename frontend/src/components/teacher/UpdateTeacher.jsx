import React, { useEffect, useState } from "react";
import { useCountries } from "react-countries";

import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetTeacherDetailsQuery,
  useGetTeachersQuery,
  useUpdateTeacherMutation,
} from "../../redux/api/teacherApi";
import { useGetAdminUsersQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const UpdateTeacher = () => {
  const navigate = useNavigate();
  const { countries } = useCountries();

  const params = useParams();
  const { refetch } = useGetTeachersQuery();
  console.log(params);
  const [teacher, setTeacher] = useState({
    teacherName: "",
    age: "",
    gender: "",
    nationality: "",
    teacherPhoneNumber: "",
    teacherSecondPhoneNumber: "",
    user: "",
    avatar: "", // Add avatar field
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    teacherName,
    age,
    gender,
    nationality,
    teacherPhoneNumber,
    teacherSecondPhoneNumber,
    user,
  } = teacher;

  const [updateTeacher, { isLoading, error, isSuccess }] =
    useUpdateTeacherMutation();
  const { data, loading } = useGetTeacherDetailsQuery(params?.id);

  const { data: usersData, isLoading: userLoading } = useGetAdminUsersQuery();

  const users = usersData?.users || []; // Ensure it's an array

  useEffect(() => {
    if (data?.teacher) {
      setTeacher({
        teacherName: data?.teacher?.teacherName,
        age: data?.teacher?.age,
        gender: data?.teacher?.gender,
        nationality: data?.teacher?.nationality,
        teacherPhoneNumber: data?.teacher?.teacherPhoneNumber,
        teacherSecondPhoneNumber: data?.teacher?.teacherSecondPhoneNumber,
        avatar: data?.teacher?.avatar,
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Teacher updated");
      navigate("/admin/teachers");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if ((!data && isLoading) || loading) {
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
      reader.readAsDataURL(file);
    } else {
      setTeacher({ ...teacher, [e.target.name]: e.target.value });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateTeacher({ id: params?.id, body: teacher });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Teacher"} />
      <div className="flex justify-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Teacher</h2>
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="teacherName_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teacher Name
                </label>
                <input
                  type="text"
                  id="teacherName_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacherName"
                  value={teacherName}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="age_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Age
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

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
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
                      Male
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
                      Female
                    </label>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="nationality_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nationality
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="teacherPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact No
                </label>
                <input
                  type="text"
                  id="teacherPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacherPhoneNumber"
                  value={teacherPhoneNumber}
                  maxLength={10}
                  minLength={10}
                  pattern="\d{10}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity(
                      "Phone number must be exactly 10 digits"
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
                  htmlFor="teacherSecondPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact No(2)
                </label>
                <input
                  type="text"
                  id="teacherSecondPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacherSecondPhoneNumber"
                  value={teacherSecondPhoneNumber}
                  maxLength={10}
                  minLength={10}
                  pattern="\d{10}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity(
                      "Phone number must be exactly 10 digits"
                    )
                  }
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* User Dropdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="user_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  User
                </label>
                <select
                  id="user_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="user"
                  value={user}
                  onChange={onChange}
                >
                  <option value="" disabled>
                    Select User
                  </option>
                  {!userLoading &&
                    users?.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="avatar_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Avatar
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
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default UpdateTeacher;
