import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux
import { useGetCourseDetailsQuery } from "../../redux/api/courseApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

// Small helper: "Zaryab It" -> "ZI", "Rüya Demirci" -> "RD"
const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

// A labeled field row with an icon in a colored circle — used throughout
// the Course Information / Instructor cards for a cleaner, scannable look.
const InfoRow = ({ icon, label, value, placeholder }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <i className={`fa fa-${icon} text-brand-600 text-sm-custom`}></i>
    </div>
    <div className="min-w-0">
      <p className="text-xs-custom font-semibold text-ink-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-base-custom font-semibold text-ink-900 truncate">
        {value || <span className="text-ink-300 font-normal">{placeholder}</span>}
      </p>
    </div>
  </div>
);

// A compact stat tile matching the chip style used elsewhere in the app
// (icon in a colored rounded box, big number, small label).
const StatTile = ({ icon, label, value, suffix }) => (
  <div className="flex items-center gap-3 bg-surface-50 border border-surface-100 rounded-xl p-3.5">
    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
      <i className={`fa fa-${icon} text-brand-600 text-base-custom`}></i>
    </div>
    <div className="min-w-0">
      <p className="text-xs-custom font-semibold text-ink-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg-custom font-bold text-ink-900 leading-tight">
        {value} {suffix && <span className="text-sm-custom font-medium text-ink-400">{suffix}</span>}
      </p>
    </div>
  </div>
);

const CourseDetails = () => {
  const { t } = useTranslation();
  const params = useParams();

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
    refetch: courseRefetch,
  } = useGetCourseDetailsQuery(params?.id);

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    academicYearName: "",
    teacherName: "",
    teacherEmail: "",
    status: true,
    createdAt: "",
    studentCount: 0,
    classGroups: [],
    students: [],
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
      setCourse({
        courseName: c.courseName || "",
        description: c.description || "",
        code: c.code || "",
        academicYearName: c.academicYearName || "",
        teacherName: c.teacher?.name || t("Not Assigned"),
        teacherEmail: c.teacher?.email || "",
        status: c.status === "Active" ? true : false,
        createdAt: c.createdAt ? formatDate(c.createdAt) : "",
        studentCount: c.studentCount || 0,
        classGroups: c.classGroups || [],
        students: c.students || [],
      });
    }
    if (courseError) {
      toast.error(courseError?.data?.message || t("Error loading course details"));
    }
  }, [courseData, courseError, t]);

  const handleRefresh = () => {
    courseRefetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  if (courseLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Course Details")} />

      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-ink-900 tracking-tight font-heading">
            {t("Course Details")}
          </h1>
          <p className="text-sm-custom text-ink-400 mt-1 font-normal">
            <i className="fa fa-info-circle mr-2 text-ink-400"></i>
            {t("Viewing course details and information")}
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-end items-center gap-3 mb-8">
          <AppButton
            to="/admin/courses"
            label={t("backToList")}
            icon="arrow-left"
            variant="secondary"
          />
          <AppButton
            onClick={handleRefresh}
            label={t("refresh")}
            icon="sync-alt"
            variant="secondary"
            disabled={courseLoading}
          />
          <AppButton
            to={`/admin/courses/edit/${params.id}`}
            label={t("EditCourse")}
            icon="edit"
            variant="primary"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course Information Card */}
          <AppCard title={t("Course Information")} icon="fa-book">
            <div className="space-y-5">
              <InfoRow icon="tag" label={t("Course Name")} value={course.courseName} placeholder={t("N/A")} />
              <InfoRow icon="hashtag" label={t("Course Code")} value={course.code} placeholder={t("N/A")} />
              <InfoRow icon="calendar" label={t("Academic Year")} value={course.academicYearName} placeholder={t("N/A")} />
              <div className="pt-1">
                <AppBadge type="booleanStatus" active={course.status} />
              </div>
            </div>
          </AppCard>

          {/* Description Card – span 2 columns */}
          <AppCard
            title={t("Course Description")}
            icon="fa-file-alt"
            className="md:col-span-2"
          >
            <div>
              <p className="text-xs-custom font-semibold text-ink-400 uppercase tracking-wide mb-2">
                <i className="fa fa-align-left mr-2 text-ink-400"></i>
                {t("Overview")}
              </p>
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-100 min-h-[120px]">
                <p className="text-base-custom text-ink-900 leading-relaxed">
                  {course.description || (
                    <span className="text-ink-300">
                      {t("noDescription")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>

          {/* Teacher Information Card */}
          <AppCard title={t("Instructor")} icon="fa-chalkboard-teacher">
            {course.teacherName && course.teacherName !== t("Not Assigned") ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-base-custom shadow-soft flex-shrink-0">
                  {getInitials(course.teacherName)}
                </div>
                <div className="min-w-0">
                  <p className="text-base-custom font-semibold text-ink-900 truncate">
                    {course.teacherName}
                  </p>
                  {course.teacherEmail && (
                    <p className="text-xs-custom text-ink-400 truncate">
                      {course.teacherEmail}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-100 text-ink-300 flex items-center justify-center flex-shrink-0">
                  <i className="fa fa-user-slash"></i>
                </div>
                <p className="text-base-custom font-medium text-ink-300">
                  {t("Not Assigned")}
                </p>
              </div>
            )}
          </AppCard>

          {/* Class Group Card — which class group(s) this course is taught in */}
          <AppCard title={t("Class Group")} icon="fa-users">
            {course.classGroups.length === 0 ? (
              <p className="text-sm-custom text-ink-300 italic">
                {t("Not assigned to any class group yet")}
              </p>
            ) : (
              <div className="space-y-3">
                {course.classGroups.map((cg) => (
                  <div
                    key={cg._id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-surface-50 border border-surface-100 rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-600 font-bold text-sm-custom">
                        {cg.section}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm-custom font-semibold text-ink-900 truncate">
                        {cg.displayName}
                      </p>
                      <p className="text-xs-custom text-ink-400 truncate">
                        {cg.academicLevelName}
                        {cg.gradeName ? ` · ${t("Grade")} ${cg.gradeName}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCard>

          {/* Course Statistics Card */}
          <AppCard title={t("Course Statistics")} icon="fa-chart-bar">
            <div className="space-y-3">
              <StatTile icon="users" label={t("Total Students")} value={course.studentCount} suffix={t("students")} />
              <StatTile icon="tasks" label={t("Total Assignments")} value={0} suffix={t("assignments")} />
              <StatTile icon="calendar-plus" label={t("Created On")} value={course.createdAt || t("N/A")} />
            </div>
          </AppCard>

          {/* Enrolled Students Card — span all 3 columns */}
          <AppCard
            title={`${t("Enrolled Students")}${course.students.length ? ` (${course.students.length})` : ""}`}
            icon="fa-user-graduate"
            className="md:col-span-3"
          >
            {course.students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mb-3">
                  <i className="fa fa-user-graduate text-ink-300 text-xl"></i>
                </div>
                <p className="text-sm-custom text-ink-400">
                  {t("No students enrolled in this course's class group yet.")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                      <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                        {t("Name")}
                      </th>
                      <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                        {t("Email")}
                      </th>
                      <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                        {t("Class Group")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {course.students.map((s) => (
                      <tr key={s.enrollmentId || s._id} className="hover:bg-surface-50/70 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                              {getInitials(s.name)}
                            </div>
                            <span className="text-sm-custom font-semibold text-ink-900">
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm-custom text-ink-600">
                          {s.email || "—"}
                        </td>
                        <td className="p-3">
                          <span className="text-xs-custom font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                            {s.classGroup || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AppCard>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-surface-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm-custom text-ink-400">
            <div className="mb-4 sm:mb-0">
              <i className="fa fa-clock mr-2 text-ink-400"></i>
              {t("lastUpdated")}: {new Date().toLocaleString()}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                to={`/admin/courses/${params.id}/students`}
                label={t("viewStudents")}
                icon="users"
                variant="secondary"
              />
              <AppButton
                to={`/admin/courses/${params.id}/assignments`}
                label={t("viewAssignments")}
                icon="tasks"
                variant="secondary"
              />
              <AppButton
                to={`/admin/courses/${params.id}/attendance`}
                label={t("viewAttendance")}
                icon="clipboard-check"
                variant="secondary"
              />
               <AppButton
              to={`/admin/course/${params.id}/download`}
              label={t("Download")}
              icon="download"
              variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetails;