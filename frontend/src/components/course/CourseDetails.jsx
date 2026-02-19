import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { useGetCourseDetailsQuery } from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const CourseDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetCourseDetailsQuery(params?.id);
  
  const { data: teachersData, isLoading: teacherLoading } = useGetUserByTypeQuery('teacher');
  
  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    year: "",
    teacher: "",
    teacherName: "",
    status: "Active",
    createdAt: "",
  });

  // Get teacher name from teachers list
  const getTeacherName = (teacherId) => {
    if (!teachersData?.users || !teacherId) return "Not Assigned";
    const teacher = teachersData.users.find(t => t._id === teacherId);
    return teacher ? teacher.name : "Not Assigned";
  };

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

  useEffect(() => {
    if (data?.course) {
      const teacherName = getTeacherName(data.course.teacher);
      
      setCourse({
        courseName: data?.course?.courseName || "",
        description: data?.course?.description || "",
        code: data?.course?.code || "",
        year: data?.course?.year || "",
        teacher: data?.course?.teacher || "",
        teacherName: teacherName,
        status: data?.course?.status || "Active",
        createdAt: data?.course?.createdAt ? formatDate(data.course.createdAt) : "",
      });
    }
    
    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error, teachersData]);

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Course Details") || "Course Details"} />
      
      <div className="p-6">
        {/* Header Section - Same as TeacherDetails */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {t("Course Details") || "Course Details"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-normal">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Viewing Course Information") || "Viewing course details and information"}
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
              to="/admin/courses"
              className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <i className="fa fa-arrow-left"></i>
              <span>{t("backToList") || "Back to List"}</span>
            </Link>
            
            <Link
              to={`/admin/courses/${params?.id}`}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
            >
              <i className="fa fa-edit"></i>
              <span>{t("EditCourse") || "Edit Course"}</span>
            </Link>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Course Header - Similar to Teacher Profile Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <i className="fa fa-book text-white text-5xl"></i>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    course.status === "Active" 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      course.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}></span>
                    {course.status}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                  {course.courseName}
                </h2>
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    <i className="fa fa-hashtag mr-2 text-xs"></i>
                    {course.code || "No Code"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                    <i className="fa fa-calendar-alt mr-2 text-xs"></i>
                    Year: {course.year || "N/A"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                    <i className="fa fa-chalkboard-teacher mr-2 text-xs"></i>
                    {course.teacherName}
                  </span>
                </div>
                <p className="text-gray-600 text-sm font-normal">
                  <i className="fa fa-file-alt mr-2 text-gray-400"></i>
                  {course.description || t("noDescription") || "No description available"}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Course Information Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-book-open mr-3 text-green-600 text-lg"></i>
                  {t("Course Information") || "Course Information"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-graduation-cap mr-2 text-gray-400"></i>
                      {t("Course Name") || "Course Name"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {course.courseName || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-hashtag mr-2 text-gray-400"></i>
                      {t("Course Code") || "Course Code"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {course.code || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar mr-2 text-gray-400"></i>
                      {t("Academic Year") || "Academic Year"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {course.year || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-file-alt mr-3 text-blue-600 text-lg"></i>
                  {t("Course Description") || "Course Description"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-align-left mr-2 text-gray-400"></i>
                      {t("Overview") || "Overview"}
                    </p>
                    <p className="text-lg font-normal text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-gray-200 min-h-[100px]">
                      {course.description || <span className="text-gray-400">{t("noDescription") || "No description available"}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teacher & Status Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-chalkboard-teacher mr-3 text-purple-600 text-lg"></i>
                  {t("Instructor & Status") || "Instructor & Status"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-user-tie mr-2 text-gray-400"></i>
                      {t("Assigned Teacher") || "Assigned Teacher"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {course.teacherName || <span className="text-gray-400 font-normal">{t("Not Assigned") || "Not Assigned"}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-user-shield mr-2 text-gray-400"></i>
                      {t("Course Status") || "Course Status"}
                    </p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                        course.status === "Active" 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          course.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}></span>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar-plus mr-2 text-gray-400"></i>
                      {t("Created On") || "Created On"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {course.createdAt || <span className="text-gray-400 font-normal">{t("N/A") || "N/A"}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center tracking-tight">
                  <i className="fa fa-chart-bar mr-3 text-amber-600 text-lg"></i>
                  {t("Course Statistics") || "Course Statistics"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-users mr-2 text-gray-400"></i>
                      {t("Total Students") || "Total Students"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-2xl font-bold text-blue-600">0</span> students enrolled
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-tasks mr-2 text-gray-400"></i>
                      {t("Total Assignments") || "Total Assignments"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-2xl font-bold text-green-600">0</span> assignments
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar-check mr-2 text-gray-400"></i>
                      {t("Class Schedule") || "Class Schedule"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-gray-400 font-normal">{t("Not Scheduled") || "Not Scheduled"}</span>
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
                    to={`/admin/courses/${params?.id}/students`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-users"></i>
                    {t("viewStudents") || "View Enrolled Students"}
                  </Link>
                  <Link
                    to={`/admin/courses/${params?.id}/assignments`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-tasks"></i>
                    {t("viewAssignments") || "View Assignments"}
                  </Link>
                  <Link
                    to={`/admin/courses/${params?.id}/attendance`}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-clipboard-check"></i>
                    {t("viewAttendance") || "View Attendance"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetails;