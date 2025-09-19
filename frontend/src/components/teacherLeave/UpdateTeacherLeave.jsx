import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";

import {
  useGetTeacherLeaveDetailsQuery,
  useUpdateTeacherLeaveMutation,
} from "../../redux/api/teacherLeaveApi";

const UpdateTeacherLeave = () => {
  const params = useParams();
  const navigate = useNavigate();

  // API hooks
  const { data, isLoading: leaveLoading, error: leaveError } =
    useGetTeacherLeaveDetailsQuery(params.id);

  const [
    updateTeacherLeave,
    { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess },
  ] = useUpdateTeacherLeaveMutation();

  // local state
  const [teacherLeave, setTeacherLeave] = useState({
    teacher: "",
    teacherName: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
    status: "Pending",
  });
  const { teacherName, leaveType, startDate, endDate, totalDays, reason, status } =
    teacherLeave;

  const [showModal, setShowModal] = useState(false);

  // fetch leave data
  useEffect(() => {
    if (data) {
      setTeacherLeave({
        teacher: data.teacherLeave.teacher?._id || "",
        teacherName: data.teacherLeave.teacher?.name || "",
        leaveType: data.teacherLeave.leaveType || "",
        startDate: data.teacherLeave.startDate?.split("T")[0] || "",
        endDate: data.teacherLeave.endDate?.split("T")[0] || "",
        totalDays: data.teacherLeave.totalDays || "",
        reason: data.teacherLeave.reason || "",
        status: data.teacherLeave.status || "Pending",
      });
    }

    if (leaveError) {
      toast.error(leaveError?.data?.message || "Error loading leave details");
    }

    if (updateError) {
      toast.error(updateError?.data?.message || "Error updating leave");
    }

    if (updateSuccess) {
      toast.success("Teacher Leave updated successfully");
      navigate("/admin/TeacherLeaves");
    }
  }, [data, leaveError, updateError, updateSuccess, navigate]);

  if (leaveLoading) {
    return <Loader />;
  }

  // sirf status change ho sakta hai
  const onChange = (e) => {
    setTeacherLeave((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // submit confirm modal
  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateTeacherLeave({ id: params.id, body: { status: teacherLeave.status } });
  };

  return (
    <AdminLayout>
      <MetaData title="Update Teacher Leave" />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Update Teacher Leave</h2>
          <form onSubmit={handleSubmitClick}>
            {/* Teacher (Read Only) */}
            <div className="mb-4">
              <label
                htmlFor="teacherName_field"
                className="block text-sm font-medium text-gray-700"
              >
                Teacher
              </label>
              <input
                type="text"
                id="teacherName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={teacherName}
                readOnly
              />
            </div>

            {/* Leave Type (Read Only) */}
            <div className="mb-4">
              <label
                htmlFor="leaveType_field"
                className="block text-sm font-medium text-gray-700"
              >
                Leave Type
              </label>
              <input
                type="text"
                id="leaveType_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={leaveType}
                readOnly
              />
            </div>

            {/* Dates (Read Only) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="startDate_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  type="text"
                  id="startDate_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={startDate}
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="endDate_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>
                <input
                  type="text"
                  id="endDate_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={endDate}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="totalDays_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Days
                </label>
                <input
                  type="text"
                  id="totalDays_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={totalDays}
                  readOnly
                />
              </div>
            </div>

            {/* Reason (Read Only) */}
            <div className="mb-4">
              <label
                htmlFor="reason_field"
                className="block text-sm font-medium text-gray-700"
              >
                Reason
              </label>
              <textarea
                id="reason_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={reason}
                readOnly
              ></textarea>
            </div>

            {/* Status (Editable) */}
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
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${
                updateLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={updateLoading}
            >
              {updateLoading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={updateLoading}
        message="Do you want to update the status of this Teacher Leave?"
      />
    </AdminLayout>
  );
};

export default UpdateTeacherLeave;
