import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import { useGetUserDetailsQuery } from "../../redux/api/userApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const StudentDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetUserDetailsQuery(params?.id);

  const [student, setStudent] = useState({
    studentName: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    studentPhoneNumber: "",
    parentOnePhoneNumber: "",
    parentTwoPhoneNumber: "",
    address: "",
    grade: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || []; // Ensure it's an array

  useEffect(() => {
    if (data?.user) {
      setStudent({
        studentName: data.user.name,
        age: data.user.age,
        gender: data.user.gender,
        nationality: data.user.nationality,
        passportNumber: data.user.passportNumber,
        studentPhoneNumber: data.user.phoneNumber,
        parentOnePhoneNumber: data.user.secondaryPhoneNumber,
        address: data.user.address,
        grade: data.user.grade,
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
      <MetaData title={"Student Details"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Student Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Course Name:</p>
              <p className="text-lg text-gray-900">{student.studentName}</p>
            </div>
            <div className="mb-4">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="StudentAvatar"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Age:</p>
              <p className="text-lg text-gray-900">{student.age}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Gender:</p>
              <p className="text-lg text-gray-900">{student.gender}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Nationality:</p>
              <p className="text-lg text-gray-900">{student.nationality}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Passport No:</p>
              <p className="text-lg text-gray-900">{student.passportNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Contact No:</p>
              <p className="text-lg text-gray-900">
                {student.studentPhoneNumber}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Parent Contact No:
              </p>
              <p className="text-lg text-gray-900">
                {student.parentOnePhoneNumber}
              </p>
            </div>
           {/*  <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Parent Contact No(2):
              </p>
              <p className="text-lg text-gray-900">
                {student.parentTwoPhoneNumber}
              </p>
            </div> */}
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Address:</p>
            <p className="text-lg text-gray-900">{student.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Grade:</p>
                <p className="text-lg text-gray-900">
                  {!gradeLoading &&
                    grades?.map(
                      (g) =>
                        g._id === student.grade && (
                          <p key={g._id} value={g._id}>
                            {g.gradeName}
                          </p>
                        )
                    )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentDetails;
