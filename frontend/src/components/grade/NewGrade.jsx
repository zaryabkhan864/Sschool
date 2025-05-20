import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { useGetCoursesQuery } from "../../redux/api/courseApi";
import {
  useCreateGradeMutation,
  useGetGradesQuery,
} from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const NewGrade = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetGradesQuery();

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    courses: [],
    year:""
  });

  const { gradeName, description, courses ,year} = grade;

  const [createGrade, { isLoading, error, isSuccess }] =
    useCreateGradeMutation();

  const { data: coursesData, isLoading: courseLoading } = useGetCoursesQuery();
  const courseList = coursesData?.courses || []; // Ensure it's an array

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Grade created");
      navigate("/admin/grades");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setGrade({ ...grade, [e.target.name]: e.target.value });
  };

  const addCourse = () => {
    setGrade({ ...grade, courses: [...courses, ""] });
  };

  // Update selected course
  const updateCourse = (index, courseValue) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = courseValue;
    setGrade({ ...grade, courses: updatedCourses });
  };

  // Remove a course
  const removeCourse = (index) => {
    const updatedCourses = [...courses];
    updatedCourses.splice(index, 1);
    setGrade({ ...grade, courses: updatedCourses });
  };

  // Handle form submission
  const submitHandler = (e) => {
    e.preventDefault();
    const formattedGrade = {
      gradeName,
      description,
      courses, // Send array of course IDs
      year,
    };
    createGrade(formattedGrade);
  };

  return (
    <AdminLayout>
      <MetaData title={t("Create New Grade")} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t('New Grade')}</h2>
          <form onSubmit={submitHandler}>
          <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
              <label
                htmlFor="gradeName_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Grade Name')}

              </label>
              <input
                type="text"
                id="gradeName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="gradeName"
                value={gradeName}
                onChange={onChange}
              />
            </div>
            <div className="mb-4">
                <label
                  htmlFor="year_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Year')}
                </label>
                <input
                  type="text"
                  id="year_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="year"
                  value={year}
                  maxLength={4}
                  minLength={4}
                  // pattern="\d{8}"
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity("Year must be exactly 4 digits")
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
                htmlFor="description_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Description')}

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


            {/* Courses Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="courses_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Courses')}

              </label>
              {courses.map((course, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={course}
                    onChange={(e) => updateCourse(index, e.target.value)}
                  >
                    <option value="" disabled>
                      {t('Select a course')}

                    </option>
                    {courseList?.map((courseOption) => (
                      <option key={courseOption._id} value={courseOption._id}>
                        {courseOption.courseName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="py-2 px-4 text-white bg-red-600 hover:bg-red-700 rounded-md"
                    onClick={() => removeCourse(index)}
                  >
                    "{t('Remove')}"

                  </button>
                </div>
              ))}
              <button
                type="button"
                className="py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                onClick={addCourse}
              >
                "{t('Add Course')}"

              </button>
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

export default NewGrade;
