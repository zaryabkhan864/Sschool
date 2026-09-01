import React from "react";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Slider from "../layout/Slider";
import { useGetYearlyCampusCountsQuery } from "../../redux/api/authApi";
import { useTranslation } from "react-i18next";
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";

// ---------- Helper to read cookies ----------
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const Dashboard = () => {
  const { t } = useTranslation();

  // ---------- Current filters from cookies ----------
  const campus = getCookie("campus");
  const academicYear = getCookie("academicYear");

  // -------- API Query (single endpoint with all counts) --------
  const { data: yearlyData, isLoading: yLoading } = useGetYearlyCampusCountsQuery(
    { campus, academicYear },
    { skip: false }
  );

  // -------- Totals (sum over filtered yearly breakdown) --------
  const totalTeachers = yearlyData?.data?.reduce(
    (sum, item) => sum + (item.teacherCount || 0),
    0
  );
  const totalStudents = yearlyData?.data?.reduce(
    (sum, item) => sum + (item.studentCount || 0),
    0
  );
  const totalUncontractedTeachers = yearlyData?.data?.reduce(
    (sum, item) => sum + (item.uncontractedTeachers || 0),
    0
  );
  const totalUnenrolledStudents = yearlyData?.data?.reduce(
    (sum, item) => sum + (item.unenrolledStudents || 0),
    0
  );

  // -------- Stat Cards (dynamic values) --------
  const stats = [
    {
      label: t("Total Students"),
      value: totalStudents ?? (yLoading ? "..." : 0),
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-200",
    },
    {
      label: t("Total Teachers"),
      value: totalTeachers ?? (yLoading ? "..." : 0),
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-200",
    },
    {
      label: t("Uncontracted Teachers"),
      value: totalUncontractedTeachers ?? (yLoading ? "..." : 0),
      icon: <ExclamationTriangleIcon className="w-8 h-8" />,
      color: "from-red-600 to-red-400",
      shadow: "shadow-red-200",
    },
    {
      label: t("Unenrolled Students"),
      value: totalUnenrolledStudents ?? (yLoading ? "..." : 0),
      icon: <UserMinusIcon className="w-8 h-8" />,
      color: "from-orange-600 to-orange-400",
      shadow: "shadow-orange-200",
    },
    {
      label: t("Pending Assignments"),
      value: "234",                     // ← placeholder
      icon: <ClipboardDocumentCheckIcon className="w-8 h-8" />,
      color: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-200",
    },
    {
      label: t("Upcoming Events"),
      value: "5",
      icon: <CalendarDaysIcon className="w-8 h-8" />,
      color: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-200",
    },
    {
      label: t("Completed Projects"),
      value: "45",
      icon: <CheckBadgeIcon className="w-8 h-8" />,
      color: "from-indigo-600 to-indigo-400",
      shadow: "shadow-indigo-200",
    },
    {
      label: t("Staff on Leave"),
      value: "12",
      icon: <ClockIcon className="w-8 h-8" />,
      color: "from-slate-700 to-slate-500",
      shadow: "shadow-slate-200",
    },
  ];

  // -------- Recent Activities (static) --------
  const activities = [
    {
      text: "Student John Doe submitted the assignment 'Math Homework'.",
      time: "2 hours ago",
      type: "assignment",
    },
    {
      text: "Teacher Jane Smith uploaded new study material for 'Physics'.",
      time: "4 hours ago",
      type: "upload",
    },
    {
      text: "New event 'Annual Sports Day' scheduled for next month.",
      time: "Yesterday",
      type: "event",
    },
    {
      text: "Parent meeting scheduled for class 10th on Friday.",
      time: "2 days ago",
      type: "meeting",
    },
  ];

  return (
    <AdminLayout>
      <MetaData title="Admin Dashboard" />

      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {t("System Overview")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("Track your school's performance and activities in real-time.")}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-gray-800">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Campus & Year-wise Breakdown Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {t("Campus & Year Breakdown")}
          </h2>
          {yLoading ? (
            <p className="text-gray-500 text-sm">Loading breakdown...</p>
          ) : yearlyData?.data?.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3">{t("Academic Year")}</th>
                    <th className="px-4 py-3">{t("Campus")}</th>
                    <th className="px-4 py-3 text-center">{t("Teachers")}</th>
                    <th className="px-4 py-3 text-center">{t("Students")}</th>
                    <th className="px-4 py-3 text-center">{t("Uncontracted Teachers")}</th>
                    <th className="px-4 py-3 text-center">{t("Unenrolled Students")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {yearlyData?.data?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.yearName || row.academicYear}</td>
                      <td className="px-4 py-3">{row.campusName || row.campus}</td>
                      <td className="px-4 py-3 text-center">{row.teacherCount}</td>
                      <td className="px-4 py-3 text-center">{row.studentCount}</td>
                      <td className="px-4 py-3 text-center">{row.uncontractedTeachers ?? 0}</td>
                      <td className="px-4 py-3 text-center">{row.unenrolledStudents ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lower Section: Activities + Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Recent Activities */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {t("Recent Activities")}
              </h2>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">
                Live
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== activities.length - 1 && (
                      <div className="absolute left-[11px] top-8 w-[2px] h-full bg-gray-100"></div>
                    )}
                    <div className="w-6 h-6 rounded-full bg-blue-100 border-4 border-white shadow-sm flex-shrink-0 z-10"></div>
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {act.text}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                        <i className="far fa-clock mr-1"></i> {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-colors">
                {t("View All Logs")}
              </button>
            </div>
          </div>

          {/* Slider + Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2">
              <Slider />
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["New Student", "Fee Payment", "Attendance", "Report Card"].map(
                (btn) => (
                  <button
                    key={btn}
                    className="p-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {btn}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;