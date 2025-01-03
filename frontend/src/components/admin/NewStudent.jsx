import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useCountries } from "react-countries";
import { useNavigate } from "react-router-dom";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import { useCreateStudentMutation } from "../../redux/api/studentsApi";
import { useGetAdminUsersQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const NewStudent = () => {
  const navigate = useNavigate();
  const { countries } = useCountries();

  const [student, setStudent] = useState({
    studentName: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    studentPhoneNumber: "",
    parentOnePhoneNumber: "",
    parentTwoPhoneNumber: "",
    address: "",
    user: "",
    grade: "",
  });

  const {
    studentName,
    age,
    gender,
    nationality,
    passportNumber,
    studentPhoneNumber,
    parentOnePhoneNumber,
    parentTwoPhoneNumber,
    address,
    user,
    grade,
  } = student;

  const [createStudent, { isLoading, error, isSuccess }] =
    useCreateStudentMutation();

  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || []; // Ensure it's an array
  const { data: usersData, isLoading: userLoading } = useGetAdminUsersQuery();
  const users = usersData?.users || []; // Ensure it's an array

  console.log("What is user here", users);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Student created");
      navigate("/admin/students");
    }
  }, [error, isSuccess, navigate]);

  const onChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createStudent(student);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Student"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">New Student</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="studentName_field"
                className="block text-sm font-medium text-gray-700"
              >
                Student Name
              </label>
              <input
                type="text"
                id="studentName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="studentName"
                value={studentName}
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
                <label
                  htmlFor="passportNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Passport No
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="studentPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact No
                </label>
                <input
                  type="text"
                  id="studentPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="studentPhoneNumber"
                  value={studentPhoneNumber}
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
                  htmlFor="parentOnePhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Parent Contact No
                </label>
                <input
                  type="number"
                  id="parentOnePhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="parentOnePhoneNumber"
                  value={parentOnePhoneNumber}
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
                  htmlFor="parentTwoPhoneNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Parent Contact No(2)
                </label>
                <input
                  type="number"
                  id="parentTwoPhoneNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="parentTwoPhoneNumber"
                  value={parentTwoPhoneNumber}
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
            <div className="mb-4">
              <label
                htmlFor="address_field"
                className="block text-sm font-medium text-gray-700"
              >
                Address
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

            <div className="grid grid-cols-2 gap-4">
              {/* Grade Dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="grade_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Grade
                </label>
                <select
                  id="grade_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="grade"
                  value={grade}
                  onChange={onChange}
                >
                  <option value="" disabled>
                    Select Grade
                  </option>
                  {!gradeLoading &&
                    grades?.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.gradeName}
                      </option>
                    ))}
                </select>
              </div>
              {/* User Dropdown */}
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
