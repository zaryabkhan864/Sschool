import React, { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";
import {
  UserGroupIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  BuildingLibraryIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BellAlertIcon,
  ScaleIcon
} from "@heroicons/react/24/outline";

const PrincipalDashboard = () => {
  const { t } = useTranslation();
  const [selectedTimeRange, setSelectedTimeRange] = useState("monthly");

  // Principle Stats with modern design
  const principalStats = [
    {
      id: 1,
      label: "Total Students",
      value: "1,240",
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: "from-blue-600 to-cyan-400",
      change: "+3.2%",
      trend: "up",
      shadow: "shadow-blue-200"
    },
    {
      id: 2,
      label: "Total Teachers",
      value: "85",
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: "from-emerald-600 to-green-400",
      change: "+2 new",
      trend: "up",
      shadow: "shadow-emerald-200"
    },
    {
      id: 3,
      label: "School Rating",
      value: "4.8/5",
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: "from-amber-500 to-yellow-400",
      change: "+0.3 this year",
      trend: "up",
      shadow: "shadow-amber-200"
    },
    {
      id: 4,
      label: "Overall Attendance",
      value: "94.5%",
      icon: <CheckCircleIcon className="w-8 h-8" />,
      color: "from-purple-600 to-violet-400",
      change: "+2.1%",
      trend: "up",
      shadow: "shadow-purple-200"
    },
  ];

  // Additional Stats
  const additionalStats = [
    {
      id: 5,
      label: "Pending Approvals",
      value: "12",
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
      color: "bg-rose-100 text-rose-600",
      category: "administrative"
    },
    {
      id: 6,
      label: "Active Events",
      value: "8",
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      category: "events"
    },
    {
      id: 7,
      label: "Budget Utilization",
      value: "78%",
      icon: <BuildingLibraryIcon className="w-6 h-6" />,
      color: "bg-emerald-100 text-emerald-600",
      category: "finance"
    },
    {
      id: 8,
      label: "Complaints Resolved",
      value: "45/48",
      icon: <ScaleIcon className="w-6 h-6" />,
      color: "bg-amber-100 text-amber-600",
      category: "issues"
    },
  ];

  // Recent Notices with icons
  const recentNotices = [
    {
      id: 1,
      title: "Annual Sports Day 2024",
      date: "Today",
      description: "Sports events schedule and team allocations have been finalized.",
      priority: "high",
      icon: <MegaphoneIcon className="w-5 h-5 text-blue-600" />
    },
    {
      id: 2,
      title: "Parent-Teacher Meeting",
      date: "Tomorrow",
      description: "Schedule for next week's parent-teacher meetings has been published.",
      priority: "medium",
      icon: <UserGroupIcon className="w-5 h-5 text-emerald-600" />
    },
    {
      id: 3,
      title: "Quarterly Examination Schedule",
      date: "2 days ago",
      description: "Examination dates and timetable for all grades released.",
      priority: "high",
      icon: <DocumentTextIcon className="w-5 h-5 text-amber-600" />
    },
    {
      id: 4,
      title: "Infrastructure Upgrade",
      date: "3 days ago",
      description: "New science lab equipment installation completed successfully.",
      priority: "low",
      icon: <BuildingLibraryIcon className="w-5 h-5 text-purple-600" />
    },
    {
      id: 5,
      title: "Staff Development Program",
      date: "1 week ago",
      description: "Teacher training workshop on modern teaching methodologies.",
      priority: "medium",
      icon: <AcademicCapIcon className="w-5 h-5 text-cyan-600" />
    },
  ];

  // Performance Data for Charts
  const enrollmentData = [
    { month: "Jan", students: 1150, newAdmissions: 45 },
    { month: "Feb", students: 1180, newAdmissions: 65 },
    { month: "Mar", students: 1200, newAdmissions: 40 },
    { month: "Apr", students: 1220, newAdmissions: 50 },
    { month: "May", students: 1240, newAdmissions: 60 },
    { month: "Jun", students: 1230, newAdmissions: 35 },
  ];

  const studentDistributionData = [
    { name: "Primary (1-5)", value: 400, color: "#3B82F6" },
    { name: "Middle (6-8)", value: 500, color: "#10B981" },
    { name: "High School (9-10)", value: 240, color: "#8B5CF6" },
    { name: "Senior (11-12)", value: 100, color: "#F59E0B" },
  ];

  const teacherPerformanceData = [
    { name: "Excellent", value: 35, color: "#10B981" },
    { name: "Good", value: 40, color: "#3B82F6" },
    { name: "Average", value: 8, color: "#F59E0B" },
    { name: "Needs Improvement", value: 2, color: "#EF4444" },
  ];

  // Department Performance
  const departmentPerformance = [
    { department: "Mathematics", performance: 92, attendance: 95 },
    { department: "Science", performance: 88, attendance: 93 },
    { department: "Languages", performance: 85, attendance: 91 },
    { department: "Social Studies", performance: 90, attendance: 94 },
    { department: "Computer Science", performance: 95, attendance: 96 },
  ];

  // Upcoming Important Events
  const upcomingEvents = [
    { id: 1, title: "Board Meeting", date: "Feb 15, 2024", time: "10:00 AM", type: "meeting" },
    { id: 2, title: "School Anniversary", date: "Feb 20, 2024", time: "9:00 AM", type: "celebration" },
    { id: 3, title: "Inspection Visit", date: "Feb 25, 2024", time: "11:00 AM", type: "official" },
    { id: 4, title: "Cultural Fest", date: "Mar 5, 2024", time: "8:00 AM", type: "event" },
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-rose-100 text-rose-600';
      case 'medium': return 'bg-amber-100 text-amber-600';
      case 'low': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'meeting': return 'bg-blue-100 text-blue-600';
      case 'celebration': return 'bg-purple-100 text-purple-600';
      case 'official': return 'bg-amber-100 text-amber-600';
      case 'event': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <AdminLayout>
      <MetaData title="Principle Dashboard" />
      
      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        {/* Header Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {t("Principle Dashboard")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("School administration overview and key performance indicators.")}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {principalStats.map((stat) => (
            <div 
              key={stat.id} 
              className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-2">
                    {stat.trend === "up" ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-rose-500" />
                    )}
                    <span className={`text-sm font-bold ${stat.trend === "up" ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {additionalStats.map((stat) => (
            <div 
              key={stat.id} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">{stat.label}</p>
                  <h4 className="text-lg font-black text-gray-800">{stat.value}</h4>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enrollment Chart */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("Student Enrollment Trend")}
                  </h2>
                  <p className="text-sm text-gray-500">Monthly student count and new admissions</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedTimeRange("monthly")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      selectedTimeRange === "monthly" 
                        ? "text-blue-700 bg-blue-100" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange("quarterly")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      selectedTimeRange === "quarterly" 
                        ? "text-blue-700 bg-blue-100" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Quarterly
                  </button>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="students" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                      name="Total Students"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newAdmissions" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.2}
                      name="New Admissions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student Distribution */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  {t("Student Distribution by Level")}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {studentDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} students`, 'Count']}
                        contentStyle={{ 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Teacher Performance */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("Teacher Performance")}
                  </h2>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded">
                    85 Teachers
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teacherPerformanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {teacherPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} teachers`, 'Count']}
                        contentStyle={{ 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Notices & Events */}
          <div className="space-y-8">
            {/* Recent Notices */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  {t("Recent Notices & Announcements")}
                </h2>
                <BellAlertIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentNotices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {notice.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {notice.title}
                            </h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getPriorityColor(notice.priority)}`}>
                              {notice.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notice.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{notice.date}</span>
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-colors">
                  {t("View All Notices")}
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Upcoming Important Events</h2>
                <CalendarDaysIcon className="w-6 h-6 opacity-80" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{event.title}</h4>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm opacity-90">
                      <span>{event.date}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-colors backdrop-blur-sm">
                {t("View Calendar")}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">
                {t("School Performance")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Academic Excellence</p>
                      <p className="text-xs text-gray-500">Board Results</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-800">96.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <UserGroupIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Parent Satisfaction</p>
                      <p className="text-xs text-gray-500">Survey Results</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-800">4.7/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <BuildingLibraryIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Infrastructure</p>
                      <p className="text-xs text-gray-500">Facility Rating</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-800">4.5/5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-800">
              {t("Department Performance Overview")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Academic year 2023-2024</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 px-4">Department</th>
                    <th className="pb-3 px-4">Performance Score</th>
                    <th className="pb-3 px-4">Attendance Rate</th>
                    <th className="pb-3 px-4">Student Feedback</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departmentPerformance.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">{dept.department}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${dept.performance}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-800">{dept.performance}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-600 h-2 rounded-full" 
                              style={{ width: `${dept.attendance}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-800">{dept.attendance}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < 4 ? 'text-amber-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          dept.performance >= 90 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : dept.performance >= 80 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-amber-100 text-amber-600'
                        }`}>
                          {dept.performance >= 90 ? 'Excellent' : dept.performance >= 80 ? 'Good' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Publish Notice', icon: <MegaphoneIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'View Reports', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { label: 'Staff Meeting', icon: <UserGroupIcon className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { label: 'Budget Review', icon: <BuildingLibraryIcon className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
          ].map((action, index) => (
            <button
              key={index}
              className={`p-4 border rounded-2xl text-sm font-bold hover:shadow-md transition-all flex items-center justify-center gap-2 ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PrincipalDashboard;