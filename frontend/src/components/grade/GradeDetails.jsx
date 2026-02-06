import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { useGetGradeDetailsQuery } from "../../redux/api/gradesApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

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
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (!grade.courses) return { totalCourses: 0, totalTeachers: 0, totalStudents: 0 };
    
    const totalCourses = grade.courses.length;
    const teacherIds = new Set(grade.courses.map(course => course.teacher));
    const totalTeachers = teacherIds.size;
    
    // You might want to fetch actual student count from backend
    const totalStudents = totalCourses * 25; // Example calculation
    
    return { totalCourses, totalTeachers, totalStudents };
  };

  useEffect(() => {
    if (data?.grade) {
      setGrade({
        gradeName: data?.grade?.gradeName || "",
        description: data?.grade?.description || "",
        year: data?.grade?.year || "",
        campus: data?.grade?.campus || "",
        campusName: data?.grade?.campusName || "Main Campus", // You might want to fetch campus name
        courses: data?.grade?.courses || [],
        createdAt: data?.grade?.createdAt ? formatDate(data.grade.createdAt) : "",
      });
    }
    
    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

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
      <MetaData title={t("Grade Details") || "Grade Details"} />
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {t("Grade Details") || "Grade Details"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-normal">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Viewing Grade Information") || "Viewing grade details and information"}
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
              to="/admin/grades"
              className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <i className="fa fa-arrow-left"></i>
              <span>{t("backToList") || "Back to List"}</span>
            </Link>
            
            <Link
              to={`/admin/grades/edit/${params?.id}`}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
            >
              <i className="fa fa-edit"></i>
              <span>{t("EditGrade") || "Edit Grade"}</span>
            </Link>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Grade Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <i className="fa fa-graduation-cap text-white text-5xl"></i>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                    Active
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                  {grade.gradeName}
                </h2>
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    <i className="fa fa-calendar-alt mr-2 text-xs"></i>
                    Academic Year: {grade.year || "N/A"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                    <i className="fa fa-school mr-2 text-xs"></i>
                    {grade.campusName}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                    <i className="fa fa-book mr-2 text-xs"></i>
                    {grade.courses?.length || 0} Courses
                  </span>
                </div>
                <p className="text-gray-600 text-sm font-normal">
                  <i className="fa fa-file-alt mr-2 text-gray-400"></i>
                  {grade.description || t("noDescription") || "No description available"}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Grade Information Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-graduation-cap mr-3 text-indigo-600 text-lg"></i>
                  {t("Grade Information") || "Grade Information"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-tag mr-2 text-gray-400"></i>
                      {t("Grade Name") || "Grade Name"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {grade.gradeName || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar mr-2 text-gray-400"></i>
                      {t("Academic Year") || "Academic Year"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {grade.year || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-school mr-2 text-gray-400"></i>
                      {t("Campus") || "Campus"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {grade.campusName || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-file-alt mr-3 text-blue-600 text-lg"></i>
                  {t("Grade Description") || "Grade Description"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-align-left mr-2 text-gray-400"></i>
                      {t("Overview") || "Overview"}
                    </p>
                    <p className="text-lg font-normal text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-gray-200 min-h-[100px]">
                      {grade.description || <span className="text-gray-400">{t("noDescription") || "No description available"}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Courses Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-book mr-3 text-green-600 text-lg"></i>
                  {t("Courses") || "Courses"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-list-ul mr-2 text-gray-400"></i>
                      {t("Total Courses") || "Total Courses"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-2xl font-bold text-green-600">{grade.courses?.length || 0}</span> courses
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-book-open mr-2 text-gray-400"></i>
                      {t("Course List") || "Course List"}
                    </p>
                    <div className="max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-gray-200">
                      {grade.courses && grade.courses.length > 0 ? (
                        <ul className="space-y-2">
                          {grade.courses.map((course) => (
                            <li key={course._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <p className="font-medium text-gray-800">{course.courseName}</p>
                                <p className="text-xs text-gray-500">{course.code}</p>
                              </div>
                              <Link 
                                to={`/admin/courses/${course._id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <i className="fa fa-external-link-alt"></i>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">{t("noCourses") || "No courses assigned"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-chart-bar mr-3 text-amber-600 text-lg"></i>
                  {t("Grade Statistics") || "Grade Statistics"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-users mr-2 text-gray-400"></i>
                      {t("Total Students") || "Total Students"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-2xl font-bold text-blue-600">{stats.totalStudents}</span> students
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-chalkboard-teacher mr-2 text-gray-400"></i>
                      {t("Total Teachers") || "Total Teachers"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-2xl font-bold text-purple-600">{stats.totalTeachers}</span> teachers
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar-plus mr-2 text-gray-400"></i>
                      {t("Created On") || "Created On"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {grade.createdAt || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 font-normal">
                <div className="mb-4 sm:mb-0">
                  <p>
                    <i className="fa fa-clock mr-2 text-gray-400"></i>
                    {t("lastUpdated") || "Last updated"}: {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/admin/grades/${params?.id}/students`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-users"></i>
                    {t("viewStudents") || "View Students"}
                  </Link>
                  <Link
                    to={`/admin/grades/${params?.id}/courses`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-book"></i>
                    {t("manageCourses") || "Manage Courses"}
                  </Link>
                  <Link
                    to={`/admin/grades/${params?.id}/timetable`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-calendar-alt"></i>
                    {t("viewTimetable") || "View Timetable"}
                  </Link>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-sync-alt"></i>
                    {t("refreshData") || "Refresh Data"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradeDetails;