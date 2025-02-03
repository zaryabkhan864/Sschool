import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCounselingDetailsQuery,
  useGetCounselingsQuery,
  useUpdateCounselingMutation,
} from "../../redux/api/counselingApi";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
const UpdateStudentCounseling = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetCounselingsQuery();

  const [counseling, setCounseling] = useState({
    student: "", // Store student ID
    complain: "",
    Comment: "",
  });

  const { student, complain, comment } = counseling;

  const [updateCounseling, { isLoading, error, isSuccess }] =
    useUpdateCounselingMutation();
  const { data, loading } = useGetCounselingDetailsQuery(params?.id);
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

    if (isSuccess) {
      toast.success("Counseling updated");
      navigate("/admin/counselings");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if ((!data && isLoading) || loading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setCounseling({ ...counseling, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateCounseling({ id: params?.id, body: counseling });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Counseling"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Counseling</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="student_field"
                className="block text-sm font-medium text-gray-700"
              >
                Student
              </label>
              <select
                id="student_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="student"
                value={student}
                onChange={onChange}
              >
                <option value="" disabled>
                  Select Student
                </option>
                {!studentLoading &&
                  students?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentName} - {s?.grade?.gradeName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="query_field"
                className="block text-sm font-medium text-gray-700"
              >
                complain/problem
              </label>
              <textarea
                id="query_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="complain"
                rows="4"
                value={complain}
                onChange={onChange}
              ></textarea>
            </div>
            <div className="mb-4">
              <label
                htmlFor="comment_field"
                className="block text-sm font-medium text-gray-700"
              >
                Suggestion/Comment
              </label>
              <textarea
                id="comment_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="comment"
                rows="2"
                value={comment}
                onChange={onChange}
              ></textarea>
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

export default UpdateStudentCounseling;
