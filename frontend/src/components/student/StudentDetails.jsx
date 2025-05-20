import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import { useGetUserDetailsQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const StudentDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, loading, error } = useGetUserDetailsQuery(params?.id);

  const [student, setStudent] = useState({
    name: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    year: "",
    status: "",
    email: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");

  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || [];

  useEffect(() => {
    if (data?.user) {
      setStudent({
        name: data.user.name,
        age: data.user.age,
        gender: data.user.gender,
        nationality: data.user.nationality,
        passportNumber: data.user.passportNumber,
        phoneNumber: data.user.phoneNumber,
        secondaryPhoneNumber: data.user.secondaryPhoneNumber,
        address: data.user.address,
        grade: data.user.grade?._id || data.user.grade,
        year: data.user.year,
        status: data.user.status,
        email: data.user.email,
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
          <h2 className="text-2xl font-semibold mb-6">{t('Student Details')}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">{t('Student Name')}:</p>
                  <p className="text-lg text-gray-900">{student.name}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">{t('Age')}:</p>
                  <p className="text-lg text-gray-900">{student.age}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="StudentAvatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Gender')}:</p>
              <p className="text-lg text-gray-900">{student.gender}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Nationality')}:</p>
              <p className="text-lg text-gray-900">{student.nationality}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Passport No')}:</p>
              <p className="text-lg text-gray-900">{student.passportNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Contact No')}:</p>
              <p className="text-lg text-gray-900">{student.phoneNumber}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Contact No 2')}:</p>
              <p className="text-lg text-gray-900">{student.secondaryPhoneNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Year')}:</p>
              <p className="text-lg text-gray-900">{student.year}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Grade')}:</p>
              <p className="text-lg text-gray-900">
                {!gradeLoading &&
                  grades?.find(g => g._id === student.grade)?.gradeName}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Status')}:</p>
              <p className="text-lg text-gray-900">
                {student.status ? t('Active') : t('Inactive')}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">{t('Email')}:</p>
            <p className="text-lg text-gray-900">{student.email}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">{t('Address')}:</p>
            <p className="text-lg text-gray-900 whitespace-pre-line">{student.address}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentDetails;