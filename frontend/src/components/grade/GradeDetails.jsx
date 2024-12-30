import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetGradeDetailsQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const GradeDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetGradeDetailsQuery(params?.id);
  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    yearFrom: "",
    yearTo: "",
    courses: [],
  });

  useEffect(() => {
    if (data?.grade) {
      setGrade({
        gradeName: data?.grade?.gradeName,
        description: data?.grade?.description,
        yearFrom: data?.grade?.yearFrom,
        yearTo: data?.grade?.yearTo,
        courses: data?.grade?.courses,
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
      <MetaData title={"Grade Details"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Grade Details</h2>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Grade Name:</p>
            <p className="text-lg text-gray-900">{grade.gradeName}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Description:</p>
            <p className="text-lg text-gray-900">{grade.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Year From:</p>
              <p className="text-lg text-gray-900">{grade.yearFrom}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Year To:</p>
              <p className="text-lg text-gray-900">{grade.yearTo}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Courses:</p>
              <ul>
                {grade.courses?.map((course) => (
                  <li key={course._id} className="text-lg text-gray-900">
                    {course.courseName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradeDetails;
