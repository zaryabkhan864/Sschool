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
import ConfirmationModal from "../GUI/ConfirmationModal";

const UpdateStudentCounseling = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetCounselingsQuery();

  const [counseling, setCounseling] = useState({
    student: "",
    complain: "",
    comment: "",
    status: "", // initially empty, backend se set hoga
  });

  const { complain, comment, status } = counseling;

  const [updateCounseling, { isLoading, error, isSuccess }] =
    useUpdateCounselingMutation();
  const { data, isLoading: detailsLoading } =
    useGetCounselingDetailsQuery(params?.id);
  const { data: studentsData, isLoading: studentLoading } = useGetStudentsQuery();
  const students = studentsData?.students || [];

  // Store student info for display
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    grade: ""
  });

  // confirmation modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (data?.counseling) {
      setCounseling({
        student: data?.counseling?.student || "",
        complain: data?.counseling?.complain || "",
        comment: data?.counseling?.comment || "",
        status: data?.counseling?.status || "", // jo actual DB se mila use set karo
      });
      
      // Extract student info for display
      if (data?.counseling?.student) {
        const student = data.counseling.student;
        const gradeName = student.grade && student.grade.length > 0 
          ? student.grade[0].gradeId.gradeName 
          : "No grade assigned";
        
        setStudentInfo({
          name: student.name || "Unknown Student",
          grade: gradeName
        });
      }
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

  if (detailsLoading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setCounseling({ ...counseling, [e.target.name]: e.target.value });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateCounseling({ id: params?.id, body: counseling });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Counseling"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Counseling</h2>
          <form onSubmit={handleSubmitClick}>
            {/* Student display field (read-only) */}
            <div className="mb-4">
              <label
                htmlFor="student_field"
                className="block text-sm font-medium text-gray-700"
              >
                Student
              </label>
              <input
                id="student_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={`${studentInfo.name} - ${studentInfo.grade}`}
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Student information cannot be changed
              </p>
            </div>

            {/* Complain field */}
            <div className="mb-4">
              <label
                htmlFor="query_field"
                className="block text-sm font-medium text-gray-700"
              >
                Complain/Problem
              </label>
              <textarea
                id="query_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="complain"
                rows="4"
                value={complain}
                onChange={onChange}
                required
              ></textarea>
            </div>

            {/* Comment field */}
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
                required
              ></textarea>
            </div>

            {/* Status dropdown */}
            <div className="mb-4">
              <label
                htmlFor="status_field"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status_field"
                name="status"
                value={status}
                onChange={onChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>

      {/* Update Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={isLoading}
        message={"Do you want to update this counseling?"}
      />
    </AdminLayout>
  );
};

export default UpdateStudentCounseling;