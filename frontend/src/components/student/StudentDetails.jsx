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

// School logo – replace with your actual logo URL
const SCHOOL_LOGO = "/images/logo.png";

const StudentDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error } = useGetUserDetailsQuery(params?.id);
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
    siblings: [],
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

      setStudent({
        name: userData.name || "",
        age: age ? age.toString() : "",
        dateOfBirth: dob ? formatDate(dob) : "",
        gender: userData.gender || "",
        nationality: getStringValue(userData.nationality, "name"),
        passportNumber: userData.passportNumber || "",
        nationalID: userData.nationalID || "",
        phoneNumber: userData.phoneNumber || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber || "",
        address: userData.address || "",
        grade: getStringValue(userData.grade, "gradeName"),
        status: userData.status ? "Active" : "Inactive",
        email: userData.email || "",
        password: "",
        avatar: userData.avatar?.url || "https://via.placeholder.com/150",
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
        <AppCard className="bg-white p-12 border border-gray-300 shadow-sm print:shadow-none print:border-gray-400 print:border-2">
          {/* Letterhead */}
          <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <img
                src={SCHOOL_LOGO}
                alt="School Logo"
                className="h-20 w-20 object-contain print:grayscale"
              />
              <div>
                <h1 className="text-xl font-serif font-bold text-gray-900 uppercase tracking-tight">
                  {t("Sunrise International School")}
                </h1>
                <p className="text-sm text-gray-600 mt-1 italic">
                  {t("Excellence in Education")}
                </p>
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
              <InfoBlock label={t("Passport Number")} value={student.passportNumber} />
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-900 mb-4 border-b border-gray-200 pb-2">
              {t("Contact Information")}
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <InfoBlock label={t("Primary Phone")} value={student.phoneNumber} />
              <InfoBlock label={t("Secondary Phone")} value={student.secondaryPhoneNumber} />
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
                  {t("Siblings")}
                </span>
                <div className="text-base text-gray-800 pl-2">{renderSiblings()}</div>
              </div>
            </div>
          </section>

          {/* Official Signatures */}
          <div className="mt-16 pt-8 border-t-2 border-gray-300">
            <div className="flex justify-between">
              <div className="text-center w-48">
                <div className="h-px bg-gray-400 w-full mb-2"></div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("Principal's Signature")}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">{t("with seal")}</p>
              </div>
              <div className="text-center w-48">
                <div className="h-px bg-gray-400 w-full mb-2"></div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("Admission Officer")}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">{t("authorised signatory")}</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[9px] text-gray-400 mt-8">
            {t("This is a computer‑generated document and does not require a physical signature.")}
          </p>
        </AppCard>

        {/* ========== BACK PAGE with Watermark and Text ========== */}
        <div
          className="print:block hidden print:page-break-before-always"
          style={{ pageBreakBefore: "always" }}
        >
          <div className="relative bg-white min-h-screen p-12 flex flex-col justify-center">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={SCHOOL_LOGO}
                alt=""
                className="w-3/4 max-w-md opacity-10 grayscale"
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
                    "5. This admission document is the property of Sunrise International School and must be returned upon request."
                  )}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="font-semibold text-lg">{t("Contact Us")}</h3>
                <address className="not-italic text-sm text-gray-600 mt-2">
                  <p>Sunrise International School</p>
                  <p>123 Education Avenue, Knowledge City</p>
                  <p>Phone: +1 234 567 890 | Email: info@sunriseschool.edu</p>
                  <p>Website: www.sunriseschool.edu</p>
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