import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCourseDetailsQuery,
  useGetCoursesQuery,
  useUpdateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const UpdateCourse = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetCoursesQuery();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    year: "",
    teacher: "", // Store teacher ID
  });

  const { courseName, description, code, year, teacher } = course;

  const [updateCourse, { isLoading, error, isSuccess }] =
    useUpdateCourseMutation();
  const { data, loading } = useGetCourseDetailsQuery(params?.id);
  const { data: teachersData, isLoading: teacherLoading } =
  useGetUserByTypeQuery('teacher');
  const teachers = teachersData?.users || []; // Ensure it's an array

  useEffect(() => {
    if (data?.course) {
      setCourse({
        courseName: data?.course?.courseName,
        description: data?.course?.description,
        code: data?.course?.code,
        year: data?.course?.year,
        teacher: data?.course?.teacher,
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Course updated");
      navigate("/admin/courses");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if ((!data && isLoading) || loading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateCourse({ id: params?.id, body: course });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Course"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Course</h2>
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
                      {t.name}
                    </option>
                  ))}
              </select>
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

export default UpdateCourse;
