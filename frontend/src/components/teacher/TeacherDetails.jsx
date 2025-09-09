import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetUserDetailsQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const TeacherDetails = () => {
  const params = useParams();
  const { data, isLoading, error } = useGetUserDetailsQuery(params?.id);

  const [teacher, setTeacher] = useState({
    name: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    year: "",
    status: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (data?.user) {
      setTeacher({
        name: data?.user?.name,
        age: data?.user?.age,
        gender: data?.user?.gender,
        nationality: data?.user?.nationality,
        passportNumber: data?.user?.passportNumber,
        phoneNumber: data?.user?.phoneNumber,
        secondaryPhoneNumber: data?.user?.secondaryPhoneNumber,
        year: data?.user?.year,
        status: data?.user?.status ? "Active" : "Inactive",
        email: data?.user?.email,
        avatar: data?.user?.avatar?.url,
      });
    }
    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

  if (isLoading) {
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
              <p className="text-lg text-gray-900">{teacher.name}</p>
            </div>
            <div className="mb-4">
              {teacher.avatar && (
                <img
                  src={teacher.avatar}
                  alt="Teacher Avatar"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Nationality:</p>
              <p className="text-lg text-gray-900">{teacher.nationality}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Passport Number:
              </p>
              <p className="text-lg text-gray-900">{teacher.passportNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Primary Contact No:
              </p>
              <p className="text-lg text-gray-900">{teacher.phoneNumber}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                Secondary Contact No:
              </p>
              <p className="text-lg text-gray-900">
                {teacher.secondaryPhoneNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Year:</p>
              <p className="text-lg text-gray-900">{teacher.year}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Status:</p>
              <p
                className={`text-lg font-semibold ${
                  teacher.status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {teacher.status}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Email:</p>
            <p className="text-lg text-gray-900">{teacher.email}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDetails;
