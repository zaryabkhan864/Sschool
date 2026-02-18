import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../GUI/AdminLayout";
import MetaData from "../layout/MetaData";
import Slider from "../layout/Slider";
import { useTranslation } from "react-i18next";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetGradesQuery();
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Stats Data for Teacher
  const teacherStats = [
    {
      label: t("Total Students"),
      value: "156",
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: "from-blue-600 to-blue-400",
      change: "+12",
    },
    {
      label: t("Classes Assigned"),
      value: data?.grades?.length || 0,
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: "from-emerald-600 to-emerald-400",
      change: null,
    },
    {
      label: t("Pending Assignments"),
      value: "24",
      icon: <ClipboardDocumentCheckIcon className="w-8 h-8" />,
      color: "from-amber-500 to-orange-400",
      change: "3 new",
    },
    {
      label: t("Upcoming Classes"),
      value: "8",
      icon: <ClockIcon className="w-8 h-8" />,
      color: "from-rose-600 to-rose-400",
      change: "Today",
    },
  ];

  // Recent Activities
  const activities = [
    {
      text: "Student John Doe submitted the assignment 'Math Homework'.",
      time: "2 hours ago",
      type: "assignment",
      icon: <DocumentTextIcon className="w-5 h-5 text-blue-500" />,
    },
    {
      text: "You uploaded new study material for 'Physics Chapter 3'.",
      time: "4 hours ago",
      type: "upload",
      icon: <BookOpenIcon className="w-5 h-5 text-emerald-500" />,
    },
    {
      text: "Parent meeting scheduled for Grade 10 on Friday at 3 PM.",
      time: "Yesterday",
      type: "meeting",
      icon: <UsersIcon className="w-5 h-5 text-purple-500" />,
    },
    {
      text: "New event 'Science Fair' scheduled for next month.",
      time: "2 days ago",
      type: "event",
      icon: <CalendarDaysIcon className="w-5 h-5 text-rose-500" />,
    },
    {
      text: "Attendance marked for Grade 9 - 85% present today.",
      time: "3 days ago",
      type: "attendance",
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    },
  ];

  // Timetable Data - Monday to Friday, 9 lessons each day
  const timetableData = {
    "Monday": [
      { time: "8:00-8:45", subject: "Mathematics", room: "Room 101", type: "lecture" },
      { time: "8:45-9:30", subject: "Physics", room: "Lab 3", type: "lab" },
      { time: "9:30-10:15", subject: "Chemistry", room: "Room 102", type: "lecture" },
      { time: "10:15-10:30", subject: "Break", room: "", type: "break" },
      { time: "10:30-11:15", subject: "English", room: "Room 103", type: "lecture" },
      { time: "11:15-12:00", subject: "Biology", room: "Lab 1", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", room: "", type: "break" },
      { time: "12:45-1:30", subject: "History", room: "Room 104", type: "lecture" },
      { time: "1:30-2:15", subject: "Computer Science", room: "Lab 2", type: "lab" },
    ],
    "Tuesday": [
      { time: "8:00-8:45", subject: "English", room: "Room 103", type: "lecture" },
      { time: "8:45-9:30", subject: "Mathematics", room: "Room 101", type: "lecture" },
      { time: "9:30-10:15", subject: "Biology", room: "Lab 1", type: "lab" },
      { time: "10:15-10:30", subject: "Break", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Physics", room: "Lab 3", type: "lab" },
      { time: "11:15-12:00", subject: "Chemistry", room: "Room 102", type: "lecture" },
      { time: "12:00-12:45", subject: "Lunch Break", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Physical Education", room: "Ground", type: "practical" },
      { time: "1:30-2:15", subject: "Art", room: "Room 105", type: "practical" },
    ],
    "Wednesday": [
      { time: "8:00-8:45", subject: "Chemistry", room: "Room 102", type: "lecture" },
      { time: "8:45-9:30", subject: "English", room: "Room 103", type: "lecture" },
      { time: "9:30-10:15", subject: "Mathematics", room: "Room 101", type: "lecture" },
      { time: "10:15-10:30", subject: "Break", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Computer Science", room: "Lab 2", type: "lab" },
      { time: "11:15-12:00", subject: "Physics", room: "Lab 3", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Biology", room: "Lab 1", type: "lab" },
      { time: "1:30-2:15", subject: "Library", room: "Library", type: "study" },
    ],
    "Thursday": [
      { time: "8:00-8:45", subject: "Physics", room: "Lab 3", type: "lab" },
      { time: "8:45-9:30", subject: "Chemistry", room: "Room 102", type: "lecture" },
      { time: "9:30-10:15", subject: "English", room: "Room 103", type: "lecture" },
      { time: "10:15-10:30", subject: "Break", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Mathematics", room: "Room 101", type: "lecture" },
      { time: "11:15-12:00", subject: "Biology", room: "Lab 1", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Geography", room: "Room 106", type: "lecture" },
      { time: "1:30-2:15", subject: "Music", room: "Room 107", type: "practical" },
    ],
    "Friday": [
      { time: "8:00-8:45", subject: "English", room: "Room 103", type: "lecture" },
      { time: "8:45-9:30", subject: "Mathematics", room: "Room 101", type: "lecture" },
      { time: "9:30-10:15", subject: "Chemistry", room: "Room 102", type: "lecture" },
      { time: "10:15-10:30", subject: "Break", room: "", type: "break" },
      { time: "10:30-11:15", subject: "Physics", room: "Lab 3", type: "lab" },
      { time: "11:15-12:00", subject: "Computer Science", room: "Lab 2", type: "lab" },
      { time: "12:00-12:45", subject: "Lunch Break", room: "", type: "break" },
      { time: "12:45-1:30", subject: "Assembly", room: "Auditorium", type: "assembly" },
      { time: "1:30-2:15", subject: "Sports", room: "Ground", type: "practical" },
    ],
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getTypeColor = (type) => {
    switch(type) {
      case 'lecture': return 'bg-blue-100 text-blue-600';
      case 'lab': return 'bg-emerald-100 text-emerald-600';
      case 'practical': return 'bg-amber-100 text-amber-600';
      case 'break': return 'bg-gray-100 text-gray-600';
      case 'study': return 'bg-indigo-100 text-indigo-600';
      case 'assembly': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MetaData title="Teacher Dashboard" />

      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        {/* Header Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {t("Teacher Dashboard")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("Welcome back! Here's your teaching overview for today.")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {teacherStats.map((stat, index) => (
            <div
              key={index}
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
                  {stat.change && (
                    <p className="text-xs font-bold text-emerald-600">
                      {stat.change}
                    </p>
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {stat.icon}
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Grades Section */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {t("Your Classes")}
              </h2>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">
                {data?.grades?.length || 0} Classes
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data?.grades?.map((grade) => (
                  <div
                    key={grade._id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">
                              {grade.gradeName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {grade.yearFrom} - {grade.yearTo}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            45 Students
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                            8:00 AM
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-sm font-bold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-colors">
                {t("View All Classes")}
              </button>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            {/* Activities Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  {t("Recent Activities")}
                </h2>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded">
                  Live Updates
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {activities.map((act, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== activities.length - 1 && (
                        <div className="absolute left-[11px] top-8 w-[2px] h-full bg-gray-100"></div>
                      )}
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-4 border-white shadow-sm flex-shrink-0 z-10 flex items-center justify-center">
                        {act.icon}
                      </div>
                      <div className="flex-1">
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
                <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-colors">
                  {t("View All Activities")}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Mark Attendance", icon: <CheckCircleIcon className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { label: "Upload Material", icon: <DocumentTextIcon className="w-5 h-5" />, color: "bg-blue-50 text-blue-600 border-blue-100" },
                { label: "Assign Homework", icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: "bg-amber-50 text-amber-600 border-amber-100" },
                { label: "Schedule Meeting", icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, color: "bg-purple-50 text-purple-600 border-purple-100" },
              ].map((action, index) => (
                <button
                  key={index}
                  className={`p-4 border rounded-2xl text-xs font-bold hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 ${action.color}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
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
            <div className="grid grid-cols-1 md:grid-cols-9 gap-3">
              {timetableData[selectedDay]?.map((lesson, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border ${
                    lesson.type === 'break' || lesson.type === 'assembly'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm'
                  } transition-all`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-2">
                      <span className="text-xs font-bold text-gray-400">
                        {lesson.time}
                      </span>
                    </div>
                    
                    {lesson.subject ? (
                      <>
                        <h4 className="font-bold text-gray-800 mb-1">
                          {lesson.subject}
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
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
                        <h4 className="font-bold text-gray-500">
                          {lesson.subject || lesson.type}
                        </h4>
                        <p className="text-xs text-gray-400 mt-2">
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
              <div className="flex flex-wrap gap-3">
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
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-600">Assembly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-gray-600">Break</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Section */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2">
            <Slider />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDashboard;