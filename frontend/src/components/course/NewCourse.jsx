import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

import {
  useCreateCourseMutation,
  useGetCoursesQuery,
} from "../../redux/api/courseApi";
import { useGetTeachersQuery } from "../../redux/api/teacherApi";

const NewCourse = () => {
  const navigate = useNavigate();
  const { refetch } = useGetCoursesQuery();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    year: "",
    teacher: "", // Store teacher ID
  });

  const { courseName, description, code, year, teacher } = course;

  const [createCourse, { isLoading, error, isSuccess }] =
    useCreateCourseMutation();
  const { data: teachersData, isLoading: teacherLoading } =
    useGetTeachersQuery();
  const teachers = teachersData?.teachers || []; // Ensure it's an array

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Course created");
      navigate("/admin/courses");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createCourse(course);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Course"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">New Course</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="courseName_field"
                className="block text-sm font-medium text-gray-700"
              >
                Course Name
              </label>
              <input
                type="text"
                id="courseName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="courseName"
                value={courseName}
                onChange={onChange}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description_field"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="description"
                rows="4"
                value={description}
                onChange={onChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="code_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                </label>
                <input
                  type="text"
                  id="code_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="code"
                  value={code}
                  maxLength={8}
                  minLength={8}
                  // pattern="\d{8}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity("Code must be exactly 8 digits")
                  }
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                  onChange={onChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="year_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year
                </label>
                <input
                  type="number"
                  id="year_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="year"
                  value={year}
                  onChange={onChange}
                />
              </div>
            </div>
            {/* Teacher Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="teacher_field"
                className="block text-sm font-medium text-gray-700"
              >
                Teacher
              </label>
              <select
                id="teacher_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="teacher"
                value={teacher}
                onChange={onChange}
              >
                <option value="" disabled>
                  Select Teacher
                </option>
                {!teacherLoading &&
                  teachers?.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.teacherName}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
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

export default NewCourse;
