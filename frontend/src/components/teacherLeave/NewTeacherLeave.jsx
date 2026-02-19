import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

import { useGetUserByTypeQuery } from "../../redux/api/userApi";

import {
  useCreateTeacherLeaveMutation,
  useGetTeacherLeavesQuery,
} from "../../redux/api/teacherLeaveApi";

const NewTeacherLeave = () => {
  const navigate = useNavigate();
  const { refetch } = useGetTeacherLeavesQuery();

  const [teacherLeave, setTeacherLeave] = useState({
    teacher: "", // Store teacher ID
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
  });

  const { teacher, leaveType, startDate, endDate, totalDays, reason } =
    teacherLeave;

  const [createTeacherLeave, { isLoading, error, isSuccess }] =
    useCreateTeacherLeaveMutation();
  const { data: teachersData, isLoading: teacherLoading } =
  useGetUserByTypeQuery('teacher');
  const teachers = teachersData?.users || []; // Ensure it's an array

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("TeacherLeave created");
      //   navigate("/admin/TeacherLeaves");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const calculateTotalDays = (start, end) => {
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const diffTime = endDateObj - startDateObj;
      const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
      return diffDays > 0 ? diffDays : "";
    }
    return "";
  };

  const onChange = (e) => {
    setTeacherLeave((prevState) => {
      const updatedLeave = { ...prevState, [e.target.name]: e.target.value };
      if (updatedLeave.startDate && updatedLeave.endDate) {
        updatedLeave.totalDays = calculateTotalDays(
          updatedLeave.startDate,
          updatedLeave.endDate
        );
      }
      return updatedLeave;
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("what is data before sending", teacherLeave);
    createTeacherLeave(teacherLeave);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Teacher Leave"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">New Teacher Leave</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="teacherId_field"
                className="block text-sm font-medium text-gray-700"
              >
                Teacher
              </label>
              <select
                id="teacherId_field"
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
            <div className="mb-4">
              <label
                htmlFor="leaveType_field"
                className="block text-sm font-medium text-gray-700"
              >
                Leave Type
              </label>
              <select
                id="leaveType_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="leaveType"
                value={leaveType}
                onChange={onChange}
              >
                <option value="" disabled>
                  Select leave Type
                </option>
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="startDate_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="startDate"
                  value={startDate}
                  onChange={onChange}
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
                  type="date"
                  id="endDate_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="endDate"
                  value={endDate}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="totalDays-field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Days
                </label>
                <input
                  type="text"
                  id="totalDays-field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={totalDays}
                  readOnly
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="reason_field"
                className="block text-sm font-medium text-gray-700"
              >
                reason
              </label>
              <textarea
                id="reason_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="reason"
                rows="4"
                value={reason}
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

export default NewTeacherLeave;
