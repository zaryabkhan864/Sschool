import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { useCreateStudentMutation } from "../../redux/api/studentsApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const NewStudent = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    studentName: "",
    age: "",
    gender: "",
    nationality: "",
    studentPhoneNumber: "",
    parentOnePhoneNumber: "",
    parentTwoPhoneNumber: "",
  });

  const {
    studentName,
    age,
    gender,
    nationality,
    studentPhoneNumber,
    parentOnePhoneNumber,
    parentTwoPhoneNumber,
  } = student;

  const [createStudent, { isLoading, error, isSuccess }] =
    useCreateStudentMutation();

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

            <div className="grid grid-cols-2 gap-4">
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
