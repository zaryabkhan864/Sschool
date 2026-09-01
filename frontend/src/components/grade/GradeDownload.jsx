import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux hooks (adjust import path if needed)
import {
  useGetGradeDetailsQuery,
  useGetGradeCoursesQuery,
} from "../../redux/api/gradesApi";

// Shared GUI components
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import PrintLayout from "../GUI/PrintLayout";
import AppCard from "../GUI/AppCard";
import InfoBlock from "../GUI/InfoBlock";

const GradeDownload = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentRef = useRef(null);

  const {
    data: gradeData,
    isLoading: gradeLoading,
    error: gradeError,
  } = useGetGradeDetailsQuery(id);

  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetGradeCoursesQuery(id);

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    year: "",
    campusName: "",
    status: "active", // default string
    createdAt: "",
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [courses, setCourses] = useState([]);

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
    if (gradeData?.grade) {
      const g = gradeData.grade;

      // ✅ Normalise status: if boolean convert to string, otherwise use as is.
      const normalisedStatus =
        typeof g.status === "boolean"
          ? g.status
            ? "active"
            : "inactive"
          : g.status
          ? g.status
          : "active";

      setGrade({
        gradeName: g.gradeName || "",
        description: g.description || "",
        year: g.academicYear?.name || "",
        campusName: g.campus?.name || "Main Campus",
        status: normalisedStatus,
        createdAt: g.createdAt ? formatDate(g.createdAt) : "",
        totalStudents: g.stats?.totalStudents || 0,
        totalTeachers: g.stats?.totalTeachers || 0,
      });
    }
    if (gradeError) {
      toast.error(gradeError?.data?.message || t("Error loading grade details"));
    }
  }, [gradeData, gradeError, t]);

  useEffect(() => {
    if (coursesData?.success) {
      setCourses(coursesData.courses || []);
    }
    if (coursesError) {
      toast.error(coursesError?.data?.message || t("Error loading courses"));
    }
  }, [coursesData, coursesError, t]);

  if (gradeLoading || coursesLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  // Now status is always a string → safe to use .charAt()
  const statusLabel =
    grade.status === "active"
      ? "Active"
      : grade.status
      ? grade.status.charAt(0).toUpperCase() + grade.status.slice(1)
      : "Inactive";

  return (
    <AdminLayout>
      <MetaData title={t("Grade Report")} />

      <PrintLayout
        title={t("Grade Report")}
        subtitle={t("Official Academic Record")}
        backUrl="/admin/grades"
        documentName={grade.gradeName}
        contentRef={contentRef}
      >
        <AppCard className="bg-white p-12 border border-gray-200 shadow-sm print:shadow-none print:border-none">
          <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {/* Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">
                  Academy Management System
                </h1>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                  Official Academic Record – Grade Report
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter italic">
                  Ref No: GRD-{id?.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* Grade Header */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {grade.gradeName}
              </h2>
              <div className="grid grid-cols-2 gap-y-2">
                <div>
                  <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">
                    {t("Academic Year")}
                  </span>
                  <span className="text-md font-semibold text-gray-700">
                    {grade.year}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">
                    {t("Campus")}
                  </span>
                  <span className="text-md font-semibold text-gray-700">
                    {grade.campusName}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">
                  {t("Status")}
                </span>
                <span
                  className={`inline-block mt-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded border ${
                    statusLabel === "Active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Information Sections */}
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  {t("General Information")}
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <InfoBlock label={t("Grade Name")} value={grade.gradeName} />
                  <InfoBlock label={t("Academic Year")} value={grade.year} />
                  <InfoBlock label={t("Campus")} value={grade.campusName} />
                  <InfoBlock label={t("Created On")} value={grade.createdAt} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  {t("Description")}
                </h3>
                <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">
                  {grade.description || t("No description available")}
                </p>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  {t("Statistics")}
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <InfoBlock
                    label={t("Total Students")}
                    value={`${grade.totalStudents} ${t("students")}`}
                  />
                  <InfoBlock
                    label={t("Total Teachers")}
                    value={`${grade.totalTeachers} ${t("teachers")}`}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  {t("Course List")} ({courses.length})
                </h3>
                {courses.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {courses.map((course) => (
                      <li key={course._id} className="text-base text-gray-700">
                        {course.courseName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base text-gray-400 italic">
                    {t("No courses assigned")}
                  </p>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-12 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                    System Generated On
                  </p>
                  <p className="text-xs font-medium text-gray-600">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="text-center w-64">
                  <div className="h-px bg-gray-300 w-full mb-2"></div>
                  <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest leading-none">
                    Authorized Signature
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1 italic">
                    Administrative Office Stamp Required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <p className="text-center text-[10px] text-gray-400 mt-6 hidden print:block">
          Confidential Document. Any unauthorized duplication is strictly prohibited.
        </p>
      </PrintLayout>
    </AdminLayout>
  );
};

export default GradeDownload;