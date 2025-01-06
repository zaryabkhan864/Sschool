import React, { useEffect, useState } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useCreateTeacherMutation,
  useGetTeachersQuery,
} from "../../redux/api/teacherApi";
import { useGetAdminUsersQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const NewTeacher = () => {
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetTeachersQuery();

  const [teacher, setTeacher] = useState({
    teacherName: "",
    age: "",
    gender: "",
    nationality: "",
    teacherPhoneNumber: "",
    teacherSecondPhoneNumber: "",
    email: "",
    password: "",
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
    email,
    password
  } = teacher;

  const [createTeacher, { isLoading, error, isSuccess }] =
    useCreateTeacherMutation();

  const { data: usersData, isLoading: userLoading } = useGetAdminUsersQuery();
  const users = usersData?.users || []; // Ensure it's an array

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Teacher created");
      navigate("/admin/teachers");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

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

    // Payload with avatar and other teacher details
    const payload = {
      ...teacher,
    };


    createTeacher(payload);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Teacher"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">New Teacher</h2>
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
            {/* add email and password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="email_field" className="block text-sm font-medium text-gray-700">
                  Email
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
                  Password
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
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
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

export default NewTeacher;
