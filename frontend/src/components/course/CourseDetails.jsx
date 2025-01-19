import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetCourseDetailsQuery } from "../../redux/api/courseApi";
import { useGetTeachersQuery } from "../../redux/api/teacherApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const CourseDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetCourseDetailsQuery(params?.id);

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    year: "",
    teacher: "", // Store teacher ID
  });

  const { data: teachersData, isLoading: teacherLoading } =
    useGetTeachersQuery();
  const teachers = teachersData?.teachers || []; // Ensure it's an array

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
  }, [data, error]);

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={"Course Details"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Course Details</h2>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Course Name:</p>
            <p className="text-lg text-gray-900">{course.courseName}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Description:</p>
            <p className="text-lg text-gray-900">{course.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Code:</p>
              <p className="text-lg text-gray-900">{course.code}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Year:</p>
              <p className="text-lg text-gray-900">{course.year}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Teacher:</p>
            <p className="text-lg text-gray-900">
              {!teacherLoading &&
                teachers?.map(
                  (t) =>
                    t._id === course.teacher && (
                      <p key={t._id} value={t._id}>
                        {t.teacherName}
                      </p>
                    )
                )}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetails;
