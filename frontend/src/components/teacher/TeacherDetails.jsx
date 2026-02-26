import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetUserDetailsQuery } from "../../redux/api/authApi";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";
import AdminLayout from "../layout/AdminLayout";
import AppCard from "../GUI/AppCard";
import PrintLayout from "../GUI/PrintLayout";
import InfoBlock from "../GUI/InfoBlock"; // 👈 imported component

const TeacherDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error } = useGetUserDetailsQuery(params?.id);
  const contentRef = useRef(null);

  const [teacher, setTeacher] = useState({
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    nationalID: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    email: "",
    address: "",
    status: "",
    avatar: "",
    createdAt: "",
  });

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (data?.user) {
      const userData = data.user;
      const dob = userData.dateOfBirth;
      const age = dob ? calculateAge(dob) : "";

      setTeacher({
        name: userData.name || "",
        age: age ? age.toString() : "",
        dateOfBirth: dob ? formatDate(dob) : "",
        gender: userData.gender || "",
        passportNumber: userData.passportNumber || "",
        nationalID: userData.nationalID || "",
        nationality: userData.nationality || "",
        phoneNumber: userData.phoneNumber || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber || "",
        email: userData.email || "",
        address: userData.address || "",
        status: userData.status ? "Active" : "Inactive",
        avatar: userData.avatar?.url || "https://via.placeholder.com/150",
        createdAt: userData.createdAt ? formatDate(userData.createdAt) : "",
      });
    }
    if (error) {
      toast.error(error?.data?.message || t("Error loading teacher details"));
    }
  }, [data, error, t]);

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MetaData title={t("Teacher Details")} />

      <PrintLayout
        title={t("Teacher Profile")}
        subtitle={t("Personnel Record & Faculty Profile")}
        backUrl="/admin/teachers"
        editUrl={`/admin/teachers/${params?.id}`}
        documentName={teacher.name}
        contentRef={contentRef}
      >
        {/* Printable Content */}
        <AppCard className="bg-white p-12 border border-gray-200 shadow-sm print:shadow-none print:border-none">
          <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {/* Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">
                  Academy Management System
                </h1>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                  Personnel Record & Faculty Profile
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter italic">
                  Ref No: TCH-{params?.id?.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-10 mb-12">
              <div className="relative">
                <div className="w-40 h-40 border-2 border-gray-100 p-1 rounded-sm shadow-sm overflow-hidden bg-gray-50">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-full h-full object-cover grayscale-[20%]"
                  />
                </div>
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded border ${
                  teacher.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {teacher.status}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  {teacher.name}
                </h2>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">{t("Designation")}</span>
                    <span className="text-md font-semibold text-gray-700">Senior Faculty Member</span>
                  </div>
                  <div>
                    <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">{t("Official Email")}</span>
                    <span className="text-md font-semibold text-gray-700">{teacher.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-3 gap-8">
                  <InfoBlock label={t("Date of Birth")} value={teacher.dateOfBirth} />
                  <InfoBlock label={t("Age")} value={`${teacher.age} Years`} />
                  <InfoBlock label={t("Gender")} value={teacher.gender} />
                  <InfoBlock label={t("Nationality")} value={teacher.nationality} />
                  <InfoBlock label={t("National ID")} value={teacher.nationalID} />
                  <InfoBlock label={t("Passport Number")} value={teacher.passportNumber} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  Contact & Communication
                </h3>
                <div className="grid grid-cols-3 gap-8">
                  <InfoBlock label={t("Primary Phone")} value={teacher.phoneNumber} />
                  <InfoBlock label={t("Emergency Contact")} value={teacher.secondaryPhoneNumber} />
                  <div className="col-span-2">
                    <InfoBlock label={t("Residential Address")} value={teacher.address} />
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-12 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">System Generated On</p>
                  <p className="text-xs font-medium text-gray-600">{new Date().toLocaleString()}</p>
                </div>
                <div className="text-center w-64">
                  <div className="h-px bg-gray-300 w-full mb-2"></div>
                  <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest leading-none">Authorized Signature</p>
                  <p className="text-[9px] text-gray-400 mt-1 italic">Administrative Office Stamp Required</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        {/* Confidential Footer (visible only when printing) */}
        <p className="text-center text-[10px] text-gray-400 mt-6 hidden print:block">
          Confidential Document. Any unauthorized duplication is strictly prohibited.
        </p>
      </PrintLayout>
    </AdminLayout>
  );
};

export default TeacherDetails;