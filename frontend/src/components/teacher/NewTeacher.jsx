import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useCreateTeacherMutation,
  useGetTeachersQuery,
} from "../../redux/api/teacherApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const NewTeacher = () => {
  const navigate = useNavigate();
  const { refetch } = useGetTeachersQuery();

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

  const [createTeacher, { isLoading, error, isSuccess }] =
    useCreateTeacherMutation();

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
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createTeacher(teacher);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Teacher"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">New Teacher</h2>
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
                <label
                  htmlFor="gender_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="gender_field"
                  name="gender"
                  value={gender}
                  onChange={onChange}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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
                  Contact No
                </label>
                <input
                  type="text"
                  id="teacherPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacherPhoneNumber"
                  value={teacherPhoneNumber}
                  maxLength={11}
                  minLength={11}
                  pattern="\d{11}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity(
                      "Phone number must be exactly 11 digits"
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
                  maxLength={11}
                  minLength={11}
                  pattern="\d{11}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity(
                      "Phone number must be exactly 11 digits"
                    )
                  }
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                  onChange={onChange}
                />
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
