import React, { useEffect, useState } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetTeacherDetailsQuery,
  useUpdateTeacherMutation,
  useGetTeachersQuery,
} from "../../redux/api/teacherApi";
import { useGetAdminUsersQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const UpdateTeacher = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { countries } = useCountries();
  const { refetch } = useGetTeachersQuery();

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

  const { data, loading } = useGetTeacherDetailsQuery(id);
  const { data: usersData, isLoading: userLoading } = useGetAdminUsersQuery();
  const [updateTeacher, { isLoading, error, isSuccess }] =
    useUpdateTeacherMutation();

  const users = usersData?.users || [];

  useEffect(() => {
    if (data) {
      setTeacher({
        teacherName: data?.teacherName || "",
        age: data?.age || "",
        gender: data?.gender || "",
        nationality: data?.nationality || "",
        teacherPhoneNumber: data?.teacherPhoneNumber || "",
        teacherSecondPhoneNumber: data?.teacherSecondPhoneNumber || "",
        user: data?.user || "",
        avatar: data?.avatar || "",
      });
      setAvatarPreview(data?.avatar || "");
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Teacher updated successfully");
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
    const payload = { ...teacher };
    updateTeacher({ id, ...payload });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Teacher"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Teacher</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
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
                      <label htmlFor="male" className="ml-2 text-sm text-gray-700">
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
                      <label htmlFor="female" className="ml-2 text-sm text-gray-700">
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
                    onChange={onChange}
                  />
                </div>
              </div>

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
                {isLoading ? "Updating..." : "UPDATE"}
              </button>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdateTeacher;
