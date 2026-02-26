import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux
import { useGetGradeDetailsQuery } from "../../redux/api/gradesApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

const GradeDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetGradeDetailsQuery(params?.id);

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    year: "",
    campus: "",
    campusName: "",
    courses: [],
    createdAt: "",
    status: true,
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (!grade.courses) return { totalCourses: 0, totalTeachers: 0, totalStudents: 0 };
    const totalCourses = grade.courses.length;
    const teacherIds = new Set(grade.courses.map((course) => course.teacher));
    const totalTeachers = teacherIds.size;
    const totalStudents = totalCourses * 25; // placeholder
    return { totalCourses, totalTeachers, totalStudents };
  };

  useEffect(() => {
    if (data?.grade) {
      setGrade({
        gradeName: data.grade.gradeName || "",
        description: data.grade.description || "",
        year: data.grade.year || "",
        campus: data.grade.campus || "",
        campusName: data.grade.campusName || "Main Campus",
        courses: data.grade.courses || [],
        createdAt: data.grade.createdAt ? formatDate(data.grade.createdAt) : "",
        status: data.grade.status ?? true,
      });
    }
    if (error) {
      toast.error(error?.data?.message || t("Error loading grade details"));
    }
  }, [data, error, t]);

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  const stats = calculateStatistics();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Grade Details")} />

      <div className="max-w-6xl mx-auto p-6">
        {/* Report-style header */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl-custom font-bold text-gray-800 tracking-tight">
            {t("Grade Details")}
          </h1>
          <p className="text-base-custom text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2 text-gray-400"></i>
            {t("Viewing grade details and information")}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end items-center gap-3 mb-8">
          <AppButton
            to="/admin/grades"
            label={t("backToList")}
            icon="arrow-left"
            variant="secondary"
          />
          <AppButton
            onClick={handleRefresh}
            label={t("refresh")}
            icon="sync-alt"
            variant="secondary"
            disabled={isLoading}
          />
          <AppButton
            to={`/admin/grades/edit/${params.id}`}
            label={t("EditGrade")}
            icon="edit"
            variant="primary"
          />
        </div>

        {/* Grid of information cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Grade Information Card */}
          <AppCard title={t("Grade Information")} icon="fa-graduation-cap">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-tag mr-2 text-gray-400"></i>
                  {t("Grade Name")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  {grade.gradeName || <span className="text-gray-400">{t("N/A")}</span>}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar mr-2 text-gray-400"></i>
                  {t("Academic Year")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  {grade.year || <span className="text-gray-400">{t("N/A")}</span>}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-school mr-2 text-gray-400"></i>
                  {t("Campus")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  {grade.campusName || <span className="text-gray-400">{t("N/A")}</span>}
                </p>
              </div>
              <div className="pt-2">
                <AppBadge type="booleanStatus" active={grade.status} />
              </div>
            </div>
          </AppCard>

          {/* Description Card (spans 2 columns) */}
          <AppCard title={t("Grade Description")} icon="fa-file-alt" className="md:col-span-2">
            <div>
              <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-2">
                <i className="fa fa-align-left mr-2 text-gray-400"></i>
                {t("Overview")}
              </p>
              <div className="bg-surface-50 p-4 rounded-lg border border-gray-200 min-h-[120px]">
                <p className="text-base-custom text-gray-800 leading-relaxed">
                  {grade.description || <span className="text-gray-400">{t("noDescription")}</span>}
                </p>
              </div>
            </div>
          </AppCard>

          {/* Courses Card */}
          <AppCard title={t("Courses")} icon="fa-book">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-list-ul mr-2 text-gray-400"></i>
                  {t("Total Courses")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  <span className="text-2xl-custom font-bold text-brand-600">
                    {grade.courses?.length || 0}
                  </span>{" "}
                  {t("courses")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-2">
                  <i className="fa fa-book-open mr-2 text-gray-400"></i>
                  {t("Course List")}
                </p>
                <div className="max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-gray-200">
                  {grade.courses && grade.courses.length > 0 ? (
                    <ul className="space-y-2">
                      {grade.courses.map((course) => (
                        <li
                          key={course._id}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{course.courseName}</p>
                            <p className="text-xs-custom text-gray-500">{course.code}</p>
                          </div>
                          <AppButton
                            to={`/admin/courses/${course._id}`}
                            icon="external-link-alt"
                            size="sm"
                            variant="ghost"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm-custom">{t("noCourses")}</p>
                  )}
                </div>
              </div>
            </div>
          </AppCard>

          {/* Statistics Card */}
          <AppCard title={t("Grade Statistics")} icon="fa-chart-bar">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-users mr-2 text-gray-400"></i>
                  {t("Total Students")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  <span className="text-2xl-custom font-bold text-blue-600">
                    {stats.totalStudents}
                  </span>{" "}
                  {t("students")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-chalkboard-teacher mr-2 text-gray-400"></i>
                  {t("Total Teachers")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  <span className="text-2xl-custom font-bold text-purple-600">
                    {stats.totalTeachers}
                  </span>{" "}
                  {t("teachers")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-gray-500 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar-plus mr-2 text-gray-400"></i>
                  {t("Created On")}
                </p>
                <p className="text-lg-custom font-semibold text-gray-800">
                  {grade.createdAt || <span className="text-gray-400">{t("N/A")}</span>}
                </p>
              </div>
            </div>
          </AppCard>
        </div>

        {/* Bottom action buttons and metadata */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm-custom text-gray-500">
            <div className="mb-4 sm:mb-0">
              <i className="fa fa-clock mr-2 text-gray-400"></i>
              {t("lastUpdated")}: {new Date().toLocaleString()}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                to={`/admin/grades/${params.id}/students`}
                label={t("viewStudents")}
                icon="users"
                variant="secondary"
              />
              <AppButton
                to={`/admin/grades/${params.id}/courses`}
                label={t("manageCourses")}
                icon="book"
                variant="secondary"
              />
              <AppButton
                to={`/admin/grades/${params.id}/timetable`}
                label={t("viewTimetable")}
                icon="calendar-alt"
                variant="secondary"
              />
              <AppButton
                onClick={handleRefresh}
                label={t("refreshData")}
                icon="sync-alt"
                variant="secondary"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradeDetails;