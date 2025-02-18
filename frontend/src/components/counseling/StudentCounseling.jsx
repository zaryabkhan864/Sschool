import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useCreateCounselingMutation,
  useGetCounselingsQuery,
} from "../../redux/api/counselingApi";
import { useGetStudentsWithGradesQuery } from "../../redux/api/studentsApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";
const StudentCounseling = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetCounselingsQuery();

  // 1 get add student data...
  const { data: studentsData, isLoading: studentLoading } =
    useGetStudentsWithGradesQuery();
  // 2 get student details from coming data
  const students = studentsData?.students || []; // Ensure it's an array

  const [counseling, setCounseling] = useState({
    student: "", //store student ID
    complain: "",
    comment: "",
  });
  const { student, complain, comment } = counseling;

  const [createCounseling, { isLoading, error, isSuccess }] =
    useCreateCounselingMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Counseling created");
      navigate("/admin/counselings");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setCounseling({ ...counseling, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createCounseling(counseling);
  };

  if (isLoading) return <Loader />;
  return (
    <AdminLayout>
      <MetaData title={"Students Counseling"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t('Student Counseling')}</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="student_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Student Name')}
              </label>
              <select
                id="student_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="student"
                value={student}
                onChange={onChange}
              >
                <option value="" disabled>
                  {t('Select Student')}
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
                {t('Complain/Problem')}
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
                {t('Suggestion/Comment')}
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

export default StudentCounseling;
