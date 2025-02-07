import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetUserDetailsQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const TeacherDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetUserDetailsQuery(params?.id);

  const [teacher, setTeacher] = useState({
    teacherName: "",
    age: "",
    gender: "",
    nationality: "",
    teacherPhoneNumber: "",
    teacherSecondPhoneNumber: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (data?.user) {
      setTeacher({
        teacherName: data?.user?.name,
        age: data?.user?.age,
        gender: data?.user?.gender,
        nationality: data?.user?.nationality,
        teacherPhoneNumber: data?.user?.phoneNumber,
        teacherSecondPhoneNumber: data?.user?.secondaryPhoneNumber,
        avatar: data?.user?.avatar?.url,
      });
      setAvatarPreview(data?.user?.avatar?.url);
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDetails;
