import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useGetCoursesQuery } from "../../redux/api/courseApi";
import { useGetGradeDetailsQuery, useUpdateGradeMutation } from "../../redux/api/gradesApi";

const UpdateGrade = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data: coursesData } = useGetCoursesQuery();
  const { data, isLoading: gradeLoading, error: gradeError, refetch } = useGetGradeDetailsQuery(params.id);
  const [updateGrade, { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess }] = useUpdateGradeMutation();

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    yearFrom: "",
    yearTo: "",
    courses: []
  });

  const { gradeName, description, yearFrom, yearTo, courses: selectedCourses } = grade;

  useEffect(() => {
    if (data) {
      const selectedCourseIds = data.grade.courses.map(course => course.course);
      setGrade({
        gradeName: data.grade.gradeName,
        description: data.grade.description,
        yearFrom: data.grade.yearFrom,
        yearTo: data.grade.yearTo,
        courses: selectedCourseIds
      });
    }
  }, [data]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError?.data?.message);
    }
    if (updateSuccess) {
      toast.success("Grade updated successfully");
      navigate("/admin/grades");
    }
  }, [updateError, updateSuccess, navigate]);

  const onChange = (e) => {
    setGrade({ ...grade, [e.target.name]: e.target.value });
  };

  const addCourse = () => {
    setGrade({ ...grade, courses: [...selectedCourses, ""] });
  };

  const updateCourse = (index, courseValue) => {
    const updatedCourses = [...selectedCourses];
    updatedCourses[index] = courseValue;
    setGrade({ ...grade, courses: updatedCourses });
  };

  const removeCourse = (index) => {
    const updatedCourses = [...selectedCourses];
    updatedCourses.splice(index, 1);
    setGrade({ ...grade, courses: updatedCourses });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const formattedGrade = {
      gradeName,
      description,
      yearFrom,
      yearTo,
      courses: selectedCourses.map(course => ({ course })),
    };
    updateGrade({ id: params.id, body: formattedGrade });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Grade"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Grade</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="gradeName_field"
                className="block text-sm font-medium text-gray-700"
              >
                Grade Name
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
                  htmlFor="yearFrom_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year From
                </label>
                <input
                  type="number"
                  id="yearFrom_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="yearFrom"
                  value={yearFrom}
                  onChange={onChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="yearTo_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year To
                </label>
                <input
                  type="number"
                  id="yearTo_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="yearTo"
                  value={yearTo}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="courses_field"
                className="block text-sm font-medium text-gray-700"
              >
                Courses
              </label>
              {selectedCourses.map((course, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={course}
                    onChange={(e) => updateCourse(index, e.target.value)}
                  >
                    <option value="" disabled>
                      Select a course
                    </option>
                    {coursesData?.courses?.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.courseName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="py-2 px-4 text-white bg-red-600 hover:bg-red-700 rounded-md"
                    onClick={() => removeCourse(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                onClick={addCourse}
              >
                Add Course
              </button>
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${updateLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={updateLoading}
            >
              {updateLoading ? "Updating..." : "UPDATE"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdateGrade;
