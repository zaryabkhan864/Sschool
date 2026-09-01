import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import PrintLayout from "../GUI/PrintLayout";
import AppCard from "../GUI/AppCard";
import InfoBlock from "../GUI/InfoBlock";

// Replace with your actual student API hook
import { useGetUserDetailsQuery } from "../../redux/api/authApi";
import { useGetSchoolQuery } from "../../redux/api/schoolApi";

// 🔹 Helper: get full name from user object (same as ListStudents)
const getFullName = (user) => {
  const { firstName = "", middleName = "", lastName = "" } = user || {};
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

// 🔹 Helper: derive grade label from an enrollment object
const getGradeFromEnrollment = (enrollment) => {
  if (!enrollment?.classGroup) return null;
  const classGroup = enrollment.classGroup;
  const gradeName = classGroup?.grade?.gradeName;
  if (!gradeName) return null;
  return classGroup?.section
    ? `${gradeName} (${classGroup.displayName || classGroup.section})`
    : gradeName;
};

// 🔹 Helper: derive grade label from user object (fallback if user.currentEnrollment exists)
const getGradeLabel = (user) => {
  const classGroup = user?.currentEnrollment?.classGroup;
  if (!classGroup) return null;
  const gradeName = classGroup?.grade?.gradeName;
  if (!gradeName) return null;
  return classGroup?.section
    ? `${gradeName} (${classGroup.displayName || classGroup.section})`
    : gradeName;
};

const StudentDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error } = useGetUserDetailsQuery(params?.id);
  const { data: schoolData } = useGetSchoolQuery();
  const contentRef = React.useRef(null);

  const [student, setStudent] = useState({
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    nationalID: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    status: "",
    email: "",
    password: "",
    avatar: "",
    fatherName: "",
    motherName: "",
    siblings: [],
  });

  // Dynamic school information with fallback
  const schoolName = schoolData?.name || "Sunrise International School";
  const schoolLogo = schoolData?.logo?.url || "/images/Logo.png";
  const schoolTagline = schoolData?.tagline || "Excellence in Education";
  const schoolAddress =
    schoolData?.address || "123 Education Avenue, Knowledge City";
  const schoolPhone = schoolData?.phone || "+1 234 567 890";
  const schoolEmail = schoolData?.email || "info@sunriseschool.edu";
  const schoolWebsite = schoolData?.website || "www.sunriseschool.edu";

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
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

  // Helper to safely extract a string from a field that might be an object
  const getStringValue = (field, property = "name") => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[property] || JSON.stringify(field);
  };

  useEffect(() => {
    if (data?.user) {
      const userData = data.user;
      const dob = userData.dateOfBirth;
      const age = dob ? calculateAge(dob) : "";

      // ✅ Determine grade from activeEnrollment (populated by backend) or fallback to currentEnrollment
      let grade = "";
      if (data?.activeEnrollment) {
        grade = getGradeFromEnrollment(data.activeEnrollment);
      } else if (userData.currentEnrollment) {
        grade = getGradeLabel(userData);
      }

      // ✅ Status from accountStatus field
      const isActive = userData.accountStatus === "active";
      const status = isActive ? "Active" : "Inactive";

      setStudent({
        name: getFullName(userData) || userData.name || "",
        age: age ? age.toString() : "",
        dateOfBirth: dob ? formatDate(dob) : "",
        gender: userData.gender || "",
        nationality: getStringValue(userData.nationality, "name"),
        passportNumber: userData.passportNumber || "",
        nationalID: userData.nationalID || "",
        phoneNumber: userData.phoneNumber || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber || "",
        address: userData.address || "",
        grade,
        status,
        email: userData.email || "",
        password: "",
        avatar: userData.avatar?.url || "https://via.placeholder.com/150",
        fatherName: userData.fatherName || "",
        motherName: userData.motherName || "",
        siblings: Array.isArray(userData.siblings)
          ? userData.siblings.map((s) => getStringValue(s, "name"))
          : [],
      });
    }
    if (error) {
      toast.error(error?.data?.message || t("Error loading student details"));
    }
  }, [data, error, t]);

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  const renderSiblings = () => {
    if (!student.siblings || student.siblings.length === 0) {
      return <span className="text-gray-400 italic">{t("None")}</span>;
    }
    return (
      <ul className="list-disc list-inside text-sm text-gray-700">
        {student.siblings.map((sibling, index) => (
          <li key={index}>{sibling}</li>
        ))}
      </ul>
    );
  };

  return (
    <AdminLayout>
      <MetaData title={t("Student Details")} />

      <PrintLayout
        title={t("Admission Document")}
        subtitle={t("Official Student Record")}
        backUrl="/admin/students"
        editUrl={`/admin/students/${params?.id}`}
        documentName={student.name}
        contentRef={contentRef}
      >
        {/* ========== FRONT PAGE ========== */}
        <AppCard
          className="relative bg-white p-12 border border-gray-300 shadow-sm print:shadow-none print:border-gray-400 print:border-2 overflow-hidden min-h-[1000px] flex flex-col justify-between"
        >
          {/* ===== WATERMARK: Centered Logo & Text ===== */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-10 z-0">
            <img
              src={schoolLogo}
              alt=""
              className="w-2/3 max-w-md grayscale object-contain mb-4"
              style={{ filter: "grayscale(100%)" }}
            />
            <div className="text-center rotate-[-30deg] transform">
              <h1 className="text-5xl font-bold text-gray-500 tracking-wider">
                {schoolName.toUpperCase()}
              </h1>
              <p className="text-2xl font-semibold mt-2 text-gray-500 tracking-widest">
                OFFICIAL DOCUMENT
              </p>
            </div>
          </div>

          {/* Actual content (above watermark) */}
          <div className="relative z-10">
            {/* Letterhead */}
            <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <img
                  src={schoolLogo}
                  alt={schoolName}
                  className="h-20 w-20 object-contain print:grayscale"
                />
                <div>
                  <h1 className="text-xl font-serif font-bold text-gray-900 uppercase tracking-tight">
                    {schoolName}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 italic">
                    {schoolTagline}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{schoolAddress}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("Admission No.")}:{" "}
                  <span className="text-gray-800">
                    STD-{params?.id?.slice(-6).toUpperCase()}
                  </span>
                </p>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  {t("Issue Date")}: {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* Student Profile Header */}
            <div className="flex items-start gap-8 mb-12">
              <div className="relative">
                <div className="w-32 h-32 border-2 border-gray-300 p-1 bg-white shadow-sm overflow-hidden rounded-sm">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full border ${
                    student.status === "Active"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }`}
                >
                  {student.status}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 leading-tight">
                  {student.name}
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider block">
                      {t("Grade")}
                    </span>
                    <span className="text-base font-medium text-gray-800">
                      {student.grade || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider block">
                      {t("Email")}
                    </span>
                    <span className="text-base font-medium text-gray-800">
                      {student.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <section className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-900 mb-4 border-b border-gray-200 pb-2">
                {t("Personal Information")}
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <InfoBlock label={t("Date of Birth")} value={student.dateOfBirth} />
                <InfoBlock label={t("Age")} value={`${student.age} Years`} />
                <InfoBlock label={t("Gender")} value={student.gender} />
                <InfoBlock label={t("Nationality")} value={student.nationality} />
                <InfoBlock label={t("National ID")} value={student.nationalID} />
                <InfoBlock
                  label={t("Passport Number")}
                  value={student.passportNumber}
                />
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-900 mb-4 border-b border-gray-200 pb-2">
                {t("Contact Information")}
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <InfoBlock label={t("Primary Phone")} value={student.phoneNumber} />
                <InfoBlock
                  label={t("Secondary Phone")}
                  value={student.secondaryPhoneNumber}
                />
                <div className="col-span-2">
                  <InfoBlock label={t("Address")} value={student.address} />
                </div>
              </div>
            </section>

            {/* Academic Information */}
            <section className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-900 mb-4 border-b border-gray-200 pb-2">
                {t("Academic Information")}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoBlock label={t("Grade")} value={student.grade} />
                <InfoBlock label={t("Student Email")} value={student.email} />
              </div>
            </section>

            {/* Family / Siblings */}
            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-900 mb-4 border-b border-gray-200 pb-2">
                {t("Family Information")}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider block mb-1">
                    {t("Father Name")}
                  </span>
                  <div className="text-base text-gray-800 pl-2">
                    {student.fatherName || "—"}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider block mb-1">
                    {t("Mother Name")}
                  </span>
                  <div className="text-base text-gray-800 pl-2">
                    {student.motherName || "—"}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider block mb-1">
                    {t("Siblings")}
                  </span>
                  <div className="text-base text-gray-800 pl-2">
                    {renderSiblings()}
                  </div>
                </div>
              </div>
            </section>

            {/* Official Signatures */}
            <div className="mt-16 pt-8 border-t-2 border-gray-300">
              <div className="flex justify-between">
                <div className="text-center w-48">
                  <div className="h-px bg-gray-400 w-full mb-2"></div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t("Principle's Signature")}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">{t("with seal")}</p>
                </div>
                <div className="text-center w-48">
                  <div className="h-px bg-gray-400 w-full mb-2"></div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t("Admission Officer")}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {t("authorised signatory")}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-[9px] text-gray-400 mt-8">
              {t(
                "This is a computer‑generated document and does not require a physical signature."
              )}
            </p>
          </div>
        </AppCard>

        {/* ========== BACK PAGE with Watermark and Text ========== */}
        <div
          className="print:block hidden print:page-break-before-always"
          style={{ pageBreakBefore: "always" }}
        >
          <div className="relative bg-white min-h-screen p-12 flex flex-col justify-center overflow-hidden">
            {/* Watermark Logo (Centered) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img
                src={schoolLogo}
                alt=""
                className="w-2/3 max-w-md opacity-10 grayscale object-contain"
                style={{ filter: "grayscale(100%)" }}
              />
            </div>

            {/* Text Content over watermark */}
            <div className="relative z-10 max-w-3xl mx-auto text-gray-800 space-y-6">
              <h2 className="text-2xl font-serif font-bold text-center border-b border-gray-300 pb-4">
                {t("School Policies & Terms of Admission")}
              </h2>

              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  {t(
                    "1. The student is expected to abide by the school's code of conduct and discipline policies."
                  )}
                </p>
                <p>
                  {t(
                    "2. Fees must be paid by the due date; late payment may result in penalties or suspension."
                  )}
                </p>
                <p>
                  {t(
                    "3. The school reserves the right to amend policies as necessary; parents will be notified of any changes."
                  )}
                </p>
                <p>
                  {t(
                    "4. In case of emergency, the school will contact the provided phone numbers. Please keep them updated."
                  )}
                </p>
                <p>
                  {t(
                    `5. This admission document is the property of ${schoolName} and must be returned upon request.`
                  )}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="font-semibold text-lg">{t("Contact Us")}</h3>
                <address className="not-italic text-sm text-gray-600 mt-2">
                  <p>{schoolName}</p>
                  <p>{schoolAddress}</p>
                  <p>
                    Phone: {schoolPhone} | Email: {schoolEmail}
                  </p>
                  <p>Website: {schoolWebsite}</p>
                </address>
              </div>

              <p className="text-xs text-center text-gray-400 mt-8">
                {t("This page is printed on the reverse side of the admission document.")}
              </p>
            </div>
          </div>
        </div>
      </PrintLayout>

      {/* Print‑specific styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default StudentDetails;