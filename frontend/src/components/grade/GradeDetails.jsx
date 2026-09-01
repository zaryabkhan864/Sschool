import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux
import {
  useGetGradeDetailsQuery,
  useGetGradeCoursesQuery,       // ✅ naya hook import
} from "../../redux/api/gradesApi";

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

  // --- Main grade detail query ---
  const {
    data: gradeData,
    isLoading: gradeLoading,
    error: gradeError,
    refetch: gradeRefetch,
  } = useGetGradeDetailsQuery(params?.id);

  // --- Naya endpoint: sirf courses (count + names) ---
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: coursesRefetch,
  } = useGetGradeCoursesQuery(params?.id);

  // --- State for grade info and stats ---
  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    year: "",
    campus: "",
    campusName: "",
    createdAt: "",
    status: true,
  });

  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
  });

  // --- State for course list (naye endpoint se aayega) ---
  const [courseList, setCourseList] = useState([]);
  const [courseCount, setCourseCount] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Effect: Grade detail data update
  useEffect(() => {
    if (gradeData?.grade) {
      const g = gradeData.grade;
      setGrade({
        gradeName: g.gradeName || "",
        description: g.description || "",
        year: g.academicYear?.name || "",
        campus: g.campus || "",
        campusName: g.campus?.name || "Main Campus",
        createdAt: g.createdAt ? formatDate(g.createdAt) : "",
        status: g.status ?? true,
      });
      setStats({
        totalTeachers: g.stats?.totalTeachers || 0,
        totalStudents: g.stats?.totalStudents || 0,
      });
    }
    if (gradeError) {
      toast.error(gradeError?.data?.message || t("Error loading grade details"));
    }
  }, [gradeData, gradeError, t]);

  // Effect: Courses data update
  useEffect(() => {
    if (coursesData?.success) {
      setCourseList(coursesData.courses || []);
      setCourseCount(coursesData.count || 0);
    }
    if (coursesError) {
      toast.error(coursesError?.data?.message || t("Error loading courses"));
    }
  }, [coursesData, coursesError, t]);

  // Combined refresh
  const handleRefresh = () => {
    gradeRefetch();
    coursesRefetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  // Combined loading state
  if (gradeLoading || coursesLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Grade Details")} />

      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-dark tracking-tight font-heading">
            {t("Grade Details")}
          </h1>
          <p className="text-sm-custom text-dark-light/70 mt-1 font-normal">
            <i className="fa fa-info-circle mr-2 text-dark-light/60"></i>
            {t("Viewing grade details and information")}
          </p>
        </div>

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
            disabled={gradeLoading || coursesLoading}
          />
          <AppButton
            to={`/admin/grades/edit/${params.id}`}
            label={t("EditGrade")}
            icon="edit"
            variant="primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Grade Information Card */}
          <AppCard title={t("Grade Information")} icon="fa-graduation-cap">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-tag mr-2 text-dark-light/60"></i>
                  {t("Grade Name")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {grade.gradeName || (
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
                  {grade.year || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-school mr-2 text-dark-light/60"></i>
                  {t("Campus")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {grade.campusName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div className="pt-2">
                <AppBadge type="booleanStatus" active={grade.status} />
              </div>
            </div>
          </AppCard>

          {/* Description Card */}
          <AppCard
            title={t("Grade Description")}
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
                  {grade.description || (
                    <span className="text-dark-light/40">
                      {t("noDescription")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>

          {/* Courses Card – Ab naye endpoint se data aayega */}
          <AppCard title={t("Courses")} icon="fa-book">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-list-ul mr-2 text-dark-light/60"></i>
                  {t("Total Courses")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  <span className="text-2xl-custom font-bold text-brand-600">
                    {courseCount}
                  </span>{" "}
                  {t("courses")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-2">
                  <i className="fa fa-book-open mr-2 text-dark-light/60"></i>
                  {t("Course List")}
                </p>
                <div className="max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-surface-100">
                  {courseList.length > 0 ? (
                    <ul className="space-y-2">
                      {courseList.map((course) => (
                        <li
                          key={course._id}
                          className="flex items-center justify-between py-2 border-b border-surface-100 last:border-b-0"
                        >
                          <div>
                            <p className="font-medium text-dark">
                              {course.courseName}
                            </p>
                            {/* Agar code chahiye to ye line add kar sakte hain, par naye endpoint sirf naam deta hai */}
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
                    <p className="text-dark-light/40 text-sm-custom">
                      {t("noCourses")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </AppCard>

          {/* Statistics Card – Total Students & Teachers (vahi rahega) */}
          <AppCard title={t("Grade Statistics")} icon="fa-chart-bar">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-users mr-2 text-dark-light/60"></i>
                  {t("Total Students")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  <span className="text-2xl-custom font-bold text-brand-600">
                    {stats.totalStudents}
                  </span>{" "}
                  {t("students")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-chalkboard-teacher mr-2 text-dark-light/60"></i>
                  {t("Total Teachers")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  <span className="text-2xl-custom font-bold text-brand-600">
                    {stats.totalTeachers}
                  </span>{" "}
                  {t("teachers")}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar-plus mr-2 text-dark-light/60"></i>
                  {t("Created On")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {grade.createdAt || (
                    <span className="text-dark-light/40">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm-custom text-dark-light/70">
            <div className="mb-4 sm:mb-0">
              <i className="fa fa-clock mr-2 text-dark-light/60"></i>
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
              to={`/admin/grade/${params.id}/download`}
              label={t("Download")}
              icon="download"
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
                disabled={gradeLoading || coursesLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradeDetails;