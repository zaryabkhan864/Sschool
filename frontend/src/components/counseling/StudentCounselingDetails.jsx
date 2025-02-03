import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetCounselingDetailsQuery } from "../../redux/api/counselingApi";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const StudentCounselingDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetCounselingDetailsQuery(params?.id);

  const [counseling, setCounseling] = useState({
    student: "", // Store student ID
    complain: "",
    comment: "",
  });

  const { data: studentsData, isLoading: studentLoading } =
    useGetStudentsQuery();
  const students = studentsData?.students || []; // Ensure it's an array

  useEffect(() => {
    if (data?.counseling) {
      setCounseling({
        student: data?.counseling?.student,
        complain: data?.counseling?.complain,
        comment: data?.counseling?.comment,
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
      <MetaData title={"Counseling Details"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Counseling Details</h2>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Student:</p>
            <p className="text-lg text-gray-900">
              {!studentLoading &&
                students?.map(
                  (s) =>
                    s._id === counseling.student && (
                      <p key={s._id} value={s._id}>
                        {s.studentName}
                      </p>
                    )
                )}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Complain:</p>
            <p className="text-lg text-gray-900">{counseling.complain}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Comment:</p>
            <p className="text-lg text-gray-900">{counseling.comment}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentCounselingDetails;
