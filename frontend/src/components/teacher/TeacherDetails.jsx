import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { useGetUserDetailsQuery } from "../../redux/api/userApi";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";
import AdminLayout from "../layout/AdminLayout";

const TeacherDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetUserDetailsQuery(params?.id);

  const [teacher, setTeacher] = useState({
    name: "",
    dateOfBirth: "",
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

  // Age calculate karne ka function
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Date format karne ka function (time hata ke)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (data?.user) {
      const dateOfBirth = data?.user?.dateOfBirth;
      const age = dateOfBirth ? calculateAge(dateOfBirth) : "";
      
      setTeacher({
        name: data?.user?.name,
        dateOfBirth: dateOfBirth ? formatDate(dateOfBirth) : "",
        age: age,
        gender: data?.user?.gender,
        nationality: data?.user?.nationality,
        passportNumber: data?.user?.passportNumber,
        phoneNumber: data?.user?.phoneNumber,
        secondaryPhoneNumber: data?.user?.secondaryPhoneNumber,
        year: data?.user?.year,
        status: data?.user?.status ? "Active" : "Inactive",
        email: data?.user?.email,
        avatar: data?.user?.avatar?.url || "https://via.placeholder.com/150",
      });
    }
    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Teacher Details") || "Teacher Details"} />
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            {/* ✅ FIX: Heading font style consistent with ListTeachers */}
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {t("Teacher Details") || "Teacher Details"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-normal">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Viewing Teacher Profile") || "Viewing teacher profile and information"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
            >
              <i className="fa fa-refresh"></i>
              <span>{t("refresh") || "Refresh"}</span>
            </button>
            
            <Link
              to="/admin/teachers"
              className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <i className="fa fa-arrow-left"></i>
              <span>{t("backToList") || "Back to List"}</span>
            </Link>
            
            <Link
              to={`/admin/teachers/${params?.id}`}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
            >
              <i className="fa fa-edit"></i>
              <span>{t("EditTeacher") || "Edit Teacher"}</span>
            </Link>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    teacher.status === "Active" 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      teacher.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}></span>
                    {teacher.status}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                {/* ✅ FIX: Teacher name font styling */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                  {teacher.name}
                </h2>
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    <i className="fa fa-envelope mr-2 text-xs"></i>
                    {teacher.email}
                  </span>
                  {teacher.nationality && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                      <i className="fa fa-globe mr-2 text-xs"></i>
                      {teacher.nationality}
                    </span>
                  )}
                  {teacher.gender && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      teacher.gender.toLowerCase() === "male" 
                        ? "bg-blue-100 text-blue-800 border border-blue-200" 
                        : "bg-pink-100 text-pink-800 border border-pink-200"
                    }`}>
                      <i className={`fa ${teacher.gender.toLowerCase() === "male" ? "fa-male" : "fa-female"} mr-2 text-xs`}></i>
                      {teacher.gender}
                    </span>
                  )}
                </div>
                {/* ✅ FIX: Passport info font style */}
                <p className="text-gray-600 text-sm font-normal">
                  <i className="fa fa-id-card mr-2 text-gray-400"></i>
                  {teacher.passportNumber || t("noPassport") || "No passport information available"}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                {/* ✅ FIX: Card title font style */}
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-user-circle mr-3 text-blue-600 text-lg"></i>
                  {t("Personal Information") || "Personal Information"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-birthday-cake mr-2 text-gray-400"></i>
                      {t("Date Of Birth") || "Date of Birth"}
                    </p>
                    {/* ✅ FIX: Value font style consistent with ListTeachers */}
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.dateOfBirth || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calculator mr-2 text-gray-400"></i>
                      {t("age") || "Age"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.age ? `${teacher.age} years` : <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-venus-mars mr-2 text-gray-400"></i>
                      {t("gender") || "Gender"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.gender || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-flag mr-2 text-gray-400"></i>
                      {t("nationality") || "Nationality"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.nationality || <span className="text-gray-400 font-normal">{t("Global") || "Global"}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-address-book mr-3 text-green-600 text-lg"></i>
                  {t("Contact Information") || "Contact Information"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-phone mr-2 text-gray-400"></i>
                      {t("Primary Contact") || "Primary Contact"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.phoneNumber ? (
                        <a href={`tel:${teacher.phoneNumber}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          {teacher.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-mobile-alt mr-2 text-gray-400"></i>
                      {t("Secondary/Emergency Contact") || "Secondary Contact"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.secondaryPhoneNumber ? (
                        <a href={`tel:${teacher.secondaryPhoneNumber}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          {teacher.secondaryPhoneNumber}
                        </a>
                      ) : (
                        <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-envelope mr-2 text-gray-400"></i>
                      {t("E-mail Address") || "Email Address"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800 truncate">
                      {teacher.email ? (
                        <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          {teacher.email}
                        </a>
                      ) : (
                        <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-briefcase mr-3 text-purple-600 text-lg"></i>
                  {t("Professional Information") || "Professional Information"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar-alt mr-2 text-gray-400"></i>
                      {t("year") || "Year"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.year || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-passport mr-2 text-gray-400"></i>
                      {t("Passport Number") || "Passport Number"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {teacher.passportNumber || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-user-shield mr-2 text-gray-400"></i>
                      {t("Status") || "Status"}
                    </p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                        teacher.status === "Active" 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          teacher.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}></span>
                        {teacher.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 font-normal">
                <div className="mb-4 sm:mb-0">
                  <p>
                    <i className="fa fa-clock mr-2 text-gray-400"></i>
                    {t("lastUpdated") || "Last updated"}: {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to={`/admin/teachers/${params?.id}/classes`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-chalkboard"></i>
                    {t("viewClasses") || "View Assigned Classes"}
                  </Link>
                  <Link
                    to={`/admin/teachers/${params?.id}/schedule`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-calendar"></i>
                    {t("viewSchedule") || "View Schedule"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDetails;