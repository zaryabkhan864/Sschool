import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import { useGetUserDetailsQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";
import PrintLayout from "../GUI/PrintLayout";


const StudentDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, loading, error } = useGetUserDetailsQuery(params?.id);
  const contentRef = useRef(null);

  const [student, setStudent] = useState({
    name: "",
    age: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: [],
    status: "",
    email: "",
    avatar: "",
    siblings: [],
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const { data: gradesData, isLoading: gradeLoading } = useGetGradesQuery();
  const grades = gradesData?.grades || [];

  useEffect(() => {
    if (data?.user) {
      setStudent({
        name: data.user.name || "",
        age: data.user.age || "",
        gender: data.user.gender || "",
        nationality: data.user.nationality || "",
        passportNumber: data.user.passportNumber || "",
        phoneNumber: data.user.phoneNumber || "",
        secondaryPhoneNumber: data.user.secondaryPhoneNumber || "",
        address: data.user.address || "",
        grade: data.user.grade || [],
        status: data.user.status,
        email: data.user.email || "",
        avatar: data.user.avatar?.url || "",
        siblings: data.user.siblings || [],
      });
      setAvatarPreview(data.user.avatar?.url || "");
    }

    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

  if (loading) {
    return <Loader />;
  }

  // ✅ Helper function: grade name by gradeId
  const getGradeName = (gradeArray) => {
    if (!gradeArray || gradeArray.length === 0) return "N/A";
    const gradeId = gradeArray[0]?.gradeId;
    return grades.find((g) => g._id === gradeId)?.gradeName || "N/A";
  };

  return (
    <AdminLayout>
      <MetaData title={"Student Details"} />

      {/* Action Buttons */}
      <PrintLayout 
        contentRef={contentRef} 
        documentName={student.name}
      />

      <div className="flex justify-center items-start pt-5 pb-10 min-h-screen bg-gray-50">
        <div
          ref={contentRef}
          className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8 border border-gray-300 relative"
          style={{ 
            backgroundSize: "300px", 
            backgroundPosition: "center", 
            backgroundRepeat: "no-repeat", 
            backgroundBlendMode: "soft-light", 
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            opacity: "0.97"
          }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="text-center rotate-45">
              <h1 className="text-6xl font-bold text-gray-400">GLOBAL ACADEMY</h1>
              <p className="text-3xl mt-2 text-gray-400">OFFICIAL DOCUMENT</p>
            </div>
          </div>

          {/* School Header */}
          <div className="text-center mb-8 border-b border-gray-300 pb-4">
            <div className="flex justify-center items-center mb-2">
              <img 
                src="/images/Logo.png"
                alt="School Logo" 
                className="h-16 w-16 mr-3 object-contain"
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-blue-900">GLOBAL ACADEMY</h1>
                <p className="text-xs text-gray-600 italic">Empowering Minds, Building Futures</p>
                <p className="text-xs text-gray-500 mt-1">123 Education Street, Knowledge City • Phone: (123) 456-7890</p>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mt-3">
              Student Information Record
            </h2>
          </div>

          {/* Header section */}
          <div className="flex flex-col md:flex-row gap-6 mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex justify-center md:justify-start">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Student Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-blue-200">
                  <span className="text-gray-500 text-2xl font-bold">
                    {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl font-bold text-gray-800 mb-1 border-b pb-1">
                {student.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                  {t("Grade")}: {getGradeName(student.grade)}
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs ${
                    student.status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {student.status ? t("Active") : t("Inactive")}
                </div>
                <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                  {student.age} {t("years old")}
                </div>
                <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
                  ID: {params?.id || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Two-column layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="bg-white p-4 rounded-md shadow-xs border border-gray-200">
              <h3 className="text-base font-semibold text-blue-900 mb-3 pb-1 border-b border-blue-100">
                {t("Personal Information")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">{t("Gender")}</p>
                  <p className="text-sm text-gray-900">{student.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{t("Age")}</p>
                  <p className="text-sm text-gray-900">{student.age || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {t("Nationality")}
                  </p>
                  <p className="text-sm text-gray-900">
                    {student.nationality || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {t("Passport No")}
                  </p>
                  <p className="text-sm text-gray-900">
                    {student.passportNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{t("Email")}</p>
                  <p className="text-sm text-gray-900 break-all">
                    {student.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-4 rounded-md shadow-xs border border-gray-200">
              <h3 className="text-base font-semibold text-blue-900 mb-3 pb-1 border-b border-blue-100">
                {t("Contact Information")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {t("Contact No")}
                  </p>
                  <p className="text-sm text-gray-900">
                    {student.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {t("Contact No 2")}
                  </p>
                  <p className="text-sm text-gray-900">
                    {student.secondaryPhoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{t("Address")}</p>
                  <p className="text-xs text-gray-900 whitespace-pre-line mt-1 p-2 bg-gray-50 rounded border border-gray-100">
                    {student.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-6 bg-white p-4 rounded-md shadow-xs border border-gray-200">
            <h3 className="text-base font-semibold text-blue-900 mb-3 pb-1 border-b border-blue-100">
              {t("Academic Information")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">{t("Grade")}</p>
                <p className="text-sm text-gray-900">{getGradeName(student.grade)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{t("Status")}</p>
                <p className="text-sm text-gray-900">
                  {student.status ? t("Active") : t("Inactive")}
                </p>
              </div>
            </div>
          </div>

          {/* Siblings */}
          {student.siblings && student.siblings.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-md shadow-xs border border-gray-200">
              <h3 className="text-base font-semibold text-blue-900 mb-3 pb-1 border-b border-blue-100">
                {t("Siblings")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.siblings.map((sibling, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {sibling.name || `Sibling ${index + 1}`}
                    </p>
                    {sibling.grade && (
                      <p className="text-xs text-gray-600 mt-1">
                        {t("Grade")}: {getGradeName(sibling.grade)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>This is an official document from Global Academy • Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentDetails;