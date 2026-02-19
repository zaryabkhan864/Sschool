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
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

const StudentDashboard = () => {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Student Stats with modern design
  const studentStats = [
    {
      id: 1,
      label: "Completed Courses",
      value: 5,
      icon: <CheckCircleIcon className="w-8 h-8" />,
      color: "from-emerald-600 to-green-400",
      change: "+2 this month",
      shadow: "shadow-emerald-200"
    },
    {
      id: 2,
      label: "Pending Assignments",
      value: 3,
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: "from-amber-500 to-yellow-400",
      change: "Due tomorrow",
      shadow: "shadow-amber-200"
    },
    {
      id: 3,
      label: "Attendance",
      value: "95%",
      icon: <ClockIcon className="w-8 h-8" />,
      color: "from-blue-600 to-cyan-400",
      change: "+5% from last month",
      shadow: "shadow-blue-200"
    },
    {
      id: 4,
      label: "Overall GPA",
      value: "3.8/4.0",
      icon: <TrophyIcon className="w-8 h-8" />,
      color: "from-purple-600 to-violet-400",
      change: "+0.2 this term",
      shadow: "shadow-purple-200"
    },
  ];

  // Recent Activities with icons
  const recentActivities = [
    {
      id: 1,
      description: "Submitted Math Assignment - Linear Algebra",
      date: "2 hours ago",
      type: "assignment",
      icon: <DocumentTextIcon className="w-5 h-5 text-blue-500" />,
      status: "submitted"
    },
    {
      id: 2,
      description: "Joined 'Advanced Physics' Workshop",
      date: "Yesterday",
      type: "workshop",
      icon: <UserGroupIcon className="w-5 h-5 text-emerald-500" />,
      status: "attended"
    },
    {
      id: 3,
      description: "Completed React & Node.js Course",
      date: "2 days ago",
      type: "course",
      icon: <AcademicCapIcon className="w-5 h-5 text-purple-500" />,
      status: "completed"
    },
    {
      id: 4,
      description: "Quiz: History of Science - Score: 92%",
      date: "3 days ago",
      type: "quiz",
      icon: <LightBulbIcon className="w-5 h-5 text-amber-500" />,
      status: "excellent"
    },
  ];

  // Performance Data for Charts
  const barChartData = [
    { month: "Jan", score: 75, attendance: 85 },
    { month: "Feb", score: 80, attendance: 88 },
    { month: "Mar", score: 85, attendance: 90 },
    { month: "Apr", score: 90, attendance: 92 },
    { month: "May", score: 88, attendance: 91 },
    { month: "Jun", score: 92, attendance: 95 },
  ];

  const pieChartData = [
    { name: "Mathematics", value: 30, color: "#3B82F6" },
    { name: "Physics", value: 25, color: "#10B981" },
    { name: "Computer Science", value: 20, color: "#8B5CF6" },
    { name: "English Literature", value: 15, color: "#F59E0B" },
    { name: "History", value: 10, color: "#EF4444" },
  ];

  // Timetable Data - Monday to Friday, 9 lessons each day
  const timetableData = {
    "Monday": [
      { time: "8:00-8:45", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", type: "lecture" },
      { time: "8:45-9:30", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "lab" },
      { time: "9:30-10:15", subject: "Computer Science", teacher: "Ms. Davis", room: "Lab 2", type: "lab" },
      { time: "10:15-10:30", subject: "Break", teacher: "", room: "", type: "break" },
      { time: "10:30-11:15", subject: "English Literature", teacher: "Mrs. Wilson", room: "Room 103", type: "lecture" },
      { time: "11:15-12:00", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", type: "tutorial" },
      { time: "12:00-12:45", subject: "Lunch Break", teacher: "", room: "", type: "break" },
      { time: "12:45-1:30", subject: "History", teacher: "Mr. Brown", room: "Room 104", type: "lecture" },
      { time: "1:30-2:15", subject: "Physical Education", teacher: "Coach Taylor", room: "Ground", type: "practical" },
    ],
    "Tuesday": [
      { time: "8:00-8:45", subject: "English Literature", teacher: "Mrs. Wilson", room: "Room 103", type: "lecture" },
      { time: "8:45-9:30", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", type: "lecture" },
      { time: "9:30-10:15", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "lab" },
      { time: "10:15-10:30", subject: "Break", teacher: "", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Computer Science", teacher: "Ms. Davis", room: "Lab 2", type: "lab" },
      { time: "11:15-12:00", subject: "Chemistry", teacher: "Dr. Miller", room: "Lab 1", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", teacher: "", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Art", teacher: "Ms. Garcia", room: "Room 105", type: "practical" },
      { time: "1:30-2:15", subject: "Library Session", teacher: "Ms. Clark", room: "Library", type: "study" },
    ],
    "Wednesday": [
      { time: "8:00-8:45", subject: "Chemistry", teacher: "Dr. Miller", room: "Lab 1", type: "lab" },
      { time: "8:45-9:30", subject: "English Literature", teacher: "Mrs. Wilson", room: "Room 103", type: "lecture" },
      { time: "9:30-10:15", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", type: "tutorial" },
      { time: "10:15-10:30", subject: "Break", teacher: "", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Computer Science", teacher: "Ms. Davis", room: "Lab 2", type: "lab" },
      { time: "11:15-12:00", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", teacher: "", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Geography", teacher: "Mr. Lee", room: "Room 106", type: "lecture" },
      { time: "1:30-2:15", subject: "Music", teacher: "Mr. White", room: "Room 107", type: "practical" },
    ],
    "Thursday": [
      { time: "8:00-8:45", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "lab" },
      { time: "8:45-9:30", subject: "Chemistry", teacher: "Dr. Miller", room: "Lab 1", type: "lab" },
      { time: "9:30-10:15", subject: "English Literature", teacher: "Mrs. Wilson", room: "Room 103", type: "lecture" },
      { time: "10:15-10:30", subject: "Break", teacher: "", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", type: "lecture" },
      { time: "11:15-12:00", subject: "Computer Science", teacher: "Ms. Davis", room: "Lab 2", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", teacher: "", room: "", type: "break" },
      { time: "12:45-1:30", subject: "History", teacher: "Mr. Brown", room: "Room 104", type: "lecture" },
      { time: "1:30-2:15", subject: "Sports", teacher: "Coach Taylor", room: "Ground", type: "practical" },
    ],
    "Friday": [
      { time: "8:00-8:45", subject: "English Literature", teacher: "Mrs. Wilson", room: "Room 103", type: "lecture" },
      { time: "8:45-9:30", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101", type: "lecture" },
      { time: "9:30-10:15", subject: "Chemistry", teacher: "Dr. Miller", room: "Lab 1", type: "lab" },
      { time: "10:15-10:30", subject: "Break", teacher: "", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "lab" },
      { time: "11:15-12:00", subject: "Computer Science", teacher: "Ms. Davis", room: "Lab 2", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", teacher: "", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Assembly", teacher: "", room: "Auditorium", type: "assembly" },
      { time: "1:30-2:15", subject: "Project Work", teacher: "Ms. Davis", room: "Lab 2", type: "project" },
    ],
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getTypeColor = (type) => {
    switch(type) {
      case 'lecture': return 'bg-blue-100 text-blue-600';
      case 'lab': return 'bg-emerald-100 text-emerald-600';
      case 'tutorial': return 'bg-indigo-100 text-indigo-600';
      case 'practical': return 'bg-amber-100 text-amber-600';
      case 'break': return 'bg-gray-100 text-gray-600';
      case 'project': return 'bg-purple-100 text-purple-600';
      case 'study': return 'bg-cyan-100 text-cyan-600';
      case 'assembly': return 'bg-rose-100 text-rose-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Upcoming Deadlines
  const upcomingDeadlines = [
    { id: 1, subject: "Mathematics", task: "Linear Algebra Assignment", due: "Tomorrow", priority: "high" },
    { id: 2, subject: "Physics", task: "Lab Report - Optics", due: "In 2 days", priority: "medium" },
    { id: 3, subject: "English", task: "Essay - Modern Literature", due: "In 3 days", priority: "medium" },
    { id: 4, subject: "Computer Science", task: "React Project", due: "Next Week", priority: "low" },
  ];

  return (
    <AdminLayout>
      <MetaData title="Student Dashboard" />
      
      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        {/* Header Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {t("Student Dashboard")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Track your academic progress and schedule.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {studentStats.map((stat) => (
            <div 
              key={stat.id} 
              className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold text-emerald-600">
                    {stat.change}
                  </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Recent Activities */}
          <div className="lg:col-span-1">
            {/* Recent Activities */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
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
                  {recentActivities.map((activity, i) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      {i !== recentActivities.length - 1 && (
                        <div className="absolute left-[11px] top-8 w-[2px] h-full bg-gray-100"></div>
                      )}
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-4 border-white shadow-sm flex-shrink-0 z-10 flex items-center justify-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <i className="far fa-clock mr-1"></i> {activity.date}
                          </p>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-colors">
                  {t("View All Activities")}
                </button>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5" />
                Upcoming Deadlines
              </h2>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{deadline.subject}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        deadline.priority === 'high' ? 'bg-red-500' :
                        deadline.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        {deadline.priority}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{deadline.task}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-80">Due: {deadline.due}</span>
                      <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("Performance Over Time")}
                  </h2>
                  <p className="text-sm text-gray-500">Monthly progress tracking</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Scores
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Attendance
                  </button>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={barChartData}>
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
                      dataKey="score" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                      name="Scores"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.2}
                      name="Attendance %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Distribution & Bar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Subject Distribution */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  {t("Subject Distribution")}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Weightage']}
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

              {/* Quick Stats */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  {t("This Week's Overview")}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpenIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Classes Attended</p>
                        <p className="text-xs text-gray-500">This week</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">18/20</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Assignments Submitted</p>
                        <p className="text-xs text-gray-500">On time</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">5/5</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <ChartBarIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Average Quiz Score</p>
                        <p className="text-xs text-gray-500">This month</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">88%</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-bold rounded-xl transition-colors">
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Timetable */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {t("Weekly Timetable")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                9 lessons per day, Monday to Friday
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
                    selectedDay === day
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9 gap-3">
              {timetableData[selectedDay]?.map((lesson, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border ${
                    lesson.type === 'break' || lesson.type === 'assembly'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm'
                  } transition-all group`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-2">
                      <span className="text-xs font-bold text-gray-400">
                        {lesson.time}
                      </span>
                    </div>
                    
                    {lesson.subject && lesson.subject !== 'Break' && lesson.subject !== 'Lunch Break' ? (
                      <>
                        <h4 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {lesson.subject}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">
                          {lesson.teacher}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          {lesson.room}
                        </p>
                        <div className="mt-auto">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getTypeColor(lesson.type)}`}>
                            {lesson.type}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-500 text-center">
                          {lesson.subject || lesson.type}
                        </h4>
                        <p className="text-xs text-gray-400 text-center mt-2">
                          {lesson.room}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Timetable Legend */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-600 mb-3">Legend</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Lecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-600">Lab Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-gray-600">Practical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-xs text-gray-600">Tutorial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-600">Project</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-gray-600">Break</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Submit Assignment', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'View Grades', icon: <ChartBarIcon className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { label: 'Study Materials', icon: <BookOpenIcon className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
            { label: 'Schedule', icon: <CalendarDaysIcon className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
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

export default StudentDashboard;