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

const CourseDetails = () => {
  const { t } = useTranslation();
  const params = useParams();

  // --- Main course detail query ---
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
    refetch: courseRefetch,
  } = useGetCourseDetailsQuery(params?.id);

  // --- State for course info ---
  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    academicYearName: "",
    teacherName: "",
    status: true,
    createdAt: "",
    studentCount: 0,
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

  // Effect: Course detail data update
  useEffect(() => {
    if (courseData?.course) {
      const c = courseData.course;
      setCourse({
        courseName: c.courseName || "",
        description: c.description || "",
        code: c.code || "",
        academicYearName: c.academicYearName || "",
        teacherName: c.teacher?.name || t("Not Assigned"),
        status: c.status === "Active" ? true : false, // converting to boolean for AppBadge
        createdAt: c.createdAt ? formatDate(c.createdAt) : "",
        studentCount: c.studentCount || 0,
      });
    }
    if (courseError) {
      toast.error(courseError?.data?.message || t("Error loading course details"));
    }
  }, [courseData, courseError, t]);

  // Refresh handler
  const handleRefresh = () => {
    courseRefetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  // Loading state
  if (courseLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Course Details")} />

      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-dark tracking-tight font-heading">
            {t("Course Details")}
          </h1>
          <p className="text-sm-custom text-dark-light/70 mt-1 font-normal">
            <i className="fa fa-info-circle mr-2 text-dark-light/60"></i>
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
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-tag mr-2 text-dark-light/60"></i>
                  {t("Course Name")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {course.courseName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-hashtag mr-2 text-dark-light/60"></i>
                  {t("Course Code")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {course.code || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar mr-2 text-dark-light/60"></i>
                  {t("Academic Year")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {course.academicYearName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div className="pt-2">
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
              <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-2">
                <i className="fa fa-align-left mr-2 text-dark-light/60"></i>
                {t("Overview")}
              </p>
              <div className="bg-surface-50 p-4 rounded-lg border border-surface-100 min-h-[120px]">
                <p className="text-base-custom text-dark leading-relaxed">
                  {course.description || (
                    <span className="text-dark-light/40">
                      {t("noDescription")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>

          {/* Teacher Information Card */}
          <AppCard title={t("Instructor")} icon="fa-chalkboard-teacher">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-user-tie mr-2 text-dark-light/60"></i>
                  {t("Assigned Teacher")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {course.teacherName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("Not Assigned")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>

          {/* Course Statistics Card */}
          <AppCard title={t("Course Statistics")} icon="fa-chart-bar">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-users mr-2 text-dark-light/60"></i>
                  {t("Total Students")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  <span className="text-2xl-custom font-bold text-brand-600">
                    {course.studentCount}
                  </span>{" "}
                  {t("students")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-tasks mr-2 text-dark-light/60"></i>
                  {t("Total Assignments")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  <span className="text-2xl-custom font-bold text-brand-600">
                    0
                  </span>{" "}
                  {t("assignments")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar-plus mr-2 text-dark-light/60"></i>
                  {t("Created On")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {course.createdAt || (
                    <span className="text-dark-light/40">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-surface-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm-custom text-dark-light/70">
            <div className="mb-4 sm:mb-0">
              <i className="fa fa-clock mr-2 text-dark-light/60"></i>
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