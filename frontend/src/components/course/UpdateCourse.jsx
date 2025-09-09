import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCourseDetailsQuery,
  useGetCoursesQuery,
  useUpdateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";

const UpdateCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetCoursesQuery();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
  });

  const { courseName, description, code, teacher } = course;

  const [updateCourse, { isLoading, error, isSuccess }] =
    useUpdateCourseMutation();
  const { data, isLoading: detailsLoading } = useGetCourseDetailsQuery(params?.id);
  const { data: teachersData, isLoading: teacherLoading } =
    useGetUserByTypeQuery('teacher');
  const teachers = teachersData?.users || [];

  // For update confirmation modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (data?.course) {
      setCourse({
        courseName: data?.course?.courseName || "",
        description: data?.course?.description || "",
        code: data?.course?.code || "",
        teacher: data?.course?.teacher || "",
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Course updated");
      navigate("/admin/courses");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if (detailsLoading || teacherLoading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    
    // Validation
    if (!courseName.trim()) {
      toast.error("Course name is required");
      return;
    }
    
    if (!code.trim() || code.length !== 8) {
      toast.error("Code must be exactly 8 characters");
      return;
    }
    
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateCourse({ id: params?.id, body: course });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Course"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {t("Update")} {t("Course")}
          </h2>
          <form onSubmit={handleSubmitClick}>
            {/* Course Name Field */}
            <div className="mb-4">
              <label
                htmlFor="courseName_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t("Course")} {t("Name")}
              </label>
              <input
                type="text"
                id="courseName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="courseName"
                value={courseName}
                onChange={onChange}
                required
              />
            </div>

            {/* Description Field */}
            <div className="mb-4">
              <label
                htmlFor="description_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t("Description")}
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
              {/* Code Field */}
              <div className="mb-4">
                <label
                  htmlFor="code_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Code")}
                </label>
                <input
                  type="text"
                  id="code_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="code"
                  value={code}
                  maxLength={8}
                  minLength={8}
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity("Code must be exactly 8 characters")
                  }
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                  onChange={onChange}
                />
              </div>

              {/* Teacher Dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="teacher_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Teacher")}
                </label>
                <select
                  id="teacher_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="teacher"
                  value={teacher}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    {t("Select Teacher")}
                  </option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? t("Updating...") : t("Update")}
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
        message={t("Do you want to update this course?")}
      />
    </AdminLayout>
  );
};

export default UpdateCourse;