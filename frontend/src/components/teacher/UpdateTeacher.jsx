import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetTeacherDetailsQuery,
  useGetTeachersQuery,
  useUpdateTeacherMutation,
} from "../../redux/api/teacherApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const UpdateTeacher = () => {
  const navigate = useNavigate();
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
  });

  const {
    teacherName,
    age,
    gender,
    nationality,
    teacherPhoneNumber,
    teacherSecondPhoneNumber,
  } = teacher;

  const [updateTeacher, { isLoading, error, isSuccess }] =
    useUpdateTeacherMutation();
  const { data, loading } = useGetTeacherDetailsQuery(params?.id);

  useEffect(() => {
    if (data?.teacher) {
      setTeacher({
        teacherName: data?.teacher?.teacherName,
        age: data?.teacher?.age,
        gender: data?.teacher?.gender,
        nationality: data?.teacher?.nationality,
        teacherPhoneNumber: data?.teacher?.teacherPhoneNumber,
        teacherSecondPhoneNumber: data?.teacher?.teacherSecondPhoneNumber,
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
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateTeacher({ id: params?.id, body: teacher });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Teacher"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Update Teacher</h2>
          <form onSubmit={submitHandler}>
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="mb-4">
              <label
                htmlFor="nationality_field"
                className="block text-sm font-medium text-gray-700"
              >
                Nationality
              </label>
              <input
                type="text"
                id="nationality_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="nationality"
                value={nationality}
                onChange={onChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="teacherPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teacher Phone Number
                </label>
                <input
                  type="number"
                  id="teacherPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacherPhoneNumber"
                  value={teacherPhoneNumber}
                  onChange={onChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="teacherSecondPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  teacher Second Phone Number
                </label>
                <input
                  type="number"
                  id="teacherSecondPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacherSecondPhoneNumber"
                  value={teacherSecondPhoneNumber}
                  onChange={onChange}
                />
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
