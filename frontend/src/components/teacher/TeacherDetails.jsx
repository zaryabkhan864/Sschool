import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetTeacherDetailsQuery } from "../../redux/api/teacherApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const TeacherDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetTeacherDetailsQuery(params?.id);
  
  const [teacher, setTeacher] = useState({
    teacherName: "",
    age: "",
    gender: "",
    nationality: "",
    teacherPhoneNumber: "",
    teacherSecondPhoneNumber: "",
    avatar: "",
    assignedCourses: [],
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (data?.teacher) {
      setTeacher({
        teacherName: data?.teacher?.teacherName,
        age: data?.teacher?.age,
        gender: data?.teacher?.gender,
        nationality: data?.teacher?.nationality,
        teacherPhoneNumber: data?.teacher?.teacherPhoneNumber,
        teacherSecondPhoneNumber: data?.teacher?.teacherSecondPhoneNumber,
        avatar: data?.teacher?.user?.avatar?.url,
        assignedCourses: data?.teacher?.assignedCourses,
      });
      setAvatarPreview(data?.teacher?.user?.avatar?.url);
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
      <MetaData title={"Teacher Details"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Teacher Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Teacher Name:</p>
              <p className="text-lg text-gray-900">{teacher.teacherName}</p>
            </div>
            <div className="mb-4">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="TeacherAvatar"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Age:</p>
              <p className="text-lg text-gray-900">{teacher.age}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Gender:</p>
              <p className="text-lg text-gray-900">{teacher.gender}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Nationality:</p>
            <p className="text-lg text-gray-900">{teacher.nationality}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Teacher Phone Number:
              </p>
              <p className="text-lg text-gray-900">
                {teacher.teacherPhoneNumber}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Teacher Second Phone Number
              </p>
              <p className="text-lg text-gray-900">
                {teacher.teacherSecondPhoneNumber}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Courses:</p>
            <ul>
              {teacher.assignedCourses?.map((course) => (
                <li key={course._id} className="text-lg text-gray-900">
                  {course.courseName}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDetails;
