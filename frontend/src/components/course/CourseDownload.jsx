import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux hooks – adjust import path if needed
import { useGetCourseDetailsQuery } from "../../redux/api/courseApi";

// Shared GUI components
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import PrintLayout from "../GUI/PrintLayout";
import AppCard from "../GUI/AppCard";
import InfoBlock from "../GUI/InfoBlock";

const CourseDownload = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentRef = useRef(null);

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseDetailsQuery(id);

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    academicYearName: "",
    teacherName: "",
    status: "active",
    createdAt: "",
    studentCount: 0,
    assignmentsCount: 0,
  });

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
    if (courseData?.course) {
      const c = courseData.course;

      // Normalise status to a lowercase string for styling
      let normalisedStatus = "active";
      if (typeof c.status === "string") {
        normalisedStatus = c.status.toLowerCase();
      } else if (typeof c.status === "boolean") {
        normalisedStatus = c.status ? "active" : "inactive";
      }

      setCourse({
        courseName: c.courseName || "",
        description: c.description || "",
        code: c.code || "",
        academicYearName: c.academicYearName || "",
        teacherName: c.teacher?.name || t("Not Assigned"),
        status: normalisedStatus,
        createdAt: c.createdAt ? formatDate(c.createdAt) : "",
        studentCount: c.studentCount || 0,
        assignmentsCount: c.assignmentsCount || 0,
      });
    }
    if (courseError) {
      toast.error(courseError?.data?.message || t("Error loading course details"));
    }
  }, [courseData, courseError, t]);

  if (courseLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  const statusLabel =
    course.status === "active"
      ? "Active"
      : course.status.charAt(0).toUpperCase() + course.status.slice(1);

  return (
    <AdminLayout>
      <MetaData title={t("Course Report")} />

      <PrintLayout
        title={t("Course Report")}
        subtitle={t("Official Academic Record")}
        backUrl="/admin/courses"
        documentName={course.courseName}
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
                  Official Academic Record – Course Report
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter italic">
                  Ref No: CRS-{id?.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* Course Header */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {course.courseName}
              </h2>
              <div className="grid grid-cols-2 gap-y-2">
                <div>
                  <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">
                    {t("Course Code")}
                  </span>
                  <span className="text-md font-semibold text-gray-700">
                    {course.code}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">
                    {t("Academic Year")}
                  </span>
                  <span className="text-md font-semibold text-gray-700">
                    {course.academicYearName}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block uppercase text-gray-400 font-bold tracking-wider">
                    {t("Instructor")}
                  </span>
                  <span className="text-md font-semibold text-gray-700">
                    {course.teacherName}
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
                  <InfoBlock label={t("Course Name")} value={course.courseName} />
                  <InfoBlock label={t("Course Code")} value={course.code} />
                  <InfoBlock label={t("Academic Year")} value={course.academicYearName} />
                  <InfoBlock label={t("Instructor")} value={course.teacherName} />
                  <InfoBlock label={t("Status")} value={statusLabel} />
                  <InfoBlock label={t("Created On")} value={course.createdAt} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  {t("Description")}
                </h3>
                <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">
                  {course.description || t("No description available")}
                </p>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4 border-b border-gray-100 pb-2">
                  {t("Statistics")}
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <InfoBlock
                    label={t("Total Students")}
                    value={`${course.studentCount} ${t("students")}`}
                  />
                  <InfoBlock
                    label={t("Total Assignments")}
                    value={`${course.assignmentsCount} ${t("assignments")}`}
                  />
                </div>
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

export default CourseDownload;