import React from "react";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu";
import { useTranslation } from "react-i18next";

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // Role-based Dashboard Titles
  const roleTitles = {
    user: t("User Dashboard"),
    admin: t("Admin Dashboard"),
    teacher: t("Teacher Dashboard"),
    student: t("Student Dashboard"),
    finance: t("Finance Dashboard"),
    principle: t("Principal Dashboard"),
    counsellor: t("Counsellor Dashboard"),
  };

  const dashboardTitle = roleTitles[user?.role] || t("Dashboard");

  const allMenuItems = [
    { name: "Dashboard", url: "/admin/dashboard", icon: "fas fa-chart-line", roles: ["admin"] },
    { name: "Dashboard", url: "/teacher/dashboard", icon: "fas fa-chalkboard-teacher", roles: ["teacher"] },
    { name: "Dashboard", url: "/student/dashboard", icon: "fas fa-user-graduate", roles: ["student"] },
    { name: "Dashboard", url: "/finance/dashboard", icon: "fas fa-coins", roles: ["finance"] },
    { name: "Dashboard", url: "/counsellor/dashboard", icon: "fas fa-user-md", roles: ["counsellor"] },
    { name: "Dashboard", url: "/principle/dashboard", icon: "fas fa-user-tie", roles: ["principle"] },
    { name: "Wall", url: "/posting_wall", icon: "fas fa-bullhorn", roles: ["admin", "teacher", "student"] },
    { name: "New Grade", url: "/admin/grade/new", icon: "fas fa-plus-circle", roles: ["admin"] },
    { name: "All Grades", url: "/admin/grades", icon: "fas fa-graduation-cap", roles: ["admin", "teacher"] },
    { name: "New Course", url: "/admin/course/new", icon: "fas fa-plus-circle", roles: ["admin"] },
    { name: "All Courses", url: "/admin/courses", icon: "fas fa-book-open", roles: ["admin", "teacher"] },
    { name: "New Teacher", url: "/admin/teacher/new", icon: "fas fa-user-plus", roles: ["admin"] },
    { name: "All Teachers", url: "/admin/teachers", icon: "fas fa-chalkboard-teacher", roles: ["admin", "teacher"] },
    { name: "New Student", url: "/admin/student/new", icon: "fas fa-user-plus", roles: ["admin"] },
    { name: "All Student", url: "/admin/students", icon: "fas fa-users", roles: ["admin"] },
    { name: "Student Counseling", url: "/admin/counseling/new", icon: "fas fa-comments", roles: ["admin", "counsellor"] },
    { name: "Counselings", url: "/admin/counselings", icon: "fas fa-comments", roles: ["admin"] },
    { name: "New Campus", url: "/admin/campus/new", icon: "fas fa-comments", roles: ["admin"] },
    { name: "All Campuses", url: "/admin/campuses", icon: "fas fa-comments", roles: ["admin"] },
    { name: "New Attendance", url: "/admin/attendance/new", icon: "fas fa-clipboard-check", roles: ["admin", "teacher"] },
    { name: "New Quiz", url: "/admin/quiz/new", icon: "fas fa-question-circle", roles: ["admin", "teacher"] },
    { name: "New Exam", url: "/admin/exam", icon: "fas fa-file-alt", roles: ["admin", "teacher"] },
    { name: "New Event", url: "/admin/event/new", icon: "fas fa-plus-circle", roles: ["admin"] },
    { name: "Events", url: "/admin/events", icon: "fas fa-calendar-alt", roles: ["admin"] },
    { name: "Reviews", url: "/admin/reviews", icon: "fas fa-star", roles: ["admin"] },
    { name: "New User", url: "/admin/register", icon: "fas fa-user-plus", roles: ["admin"] },
    { name: "All Users", url: "/admin/users", icon: "fas fa-user-friends", roles: ["admin"] },
    { name: "Student Fees", url: "/finance/student/fees", icon: "fas fa-money-bill-wave", roles: ["admin", "finance"] },
    { name: "Student Fees List", url: "/finance/students/fees", icon: "fas fa-receipt", roles: ["admin", "finance"] },
    { name: "Emp Salary", url: "/finance/employee/salaries", icon: "fas fa-coins", roles: ["admin", "finance"] },
    { name: "Emp Salary List", url: "/finance/employees/salaries", icon: "fas fa-list-alt", roles: ["admin", "finance"] },
    { name: "New Expense", url: "/finance/expenses", icon: "fas fa-money-check-alt", roles: ["admin", "finance"] },
    { name: "Expense List", url: "/finance/expense/List", icon: "fas fa-file-invoice-dollar", roles: ["admin", "finance"] },
    { name: "New Teacher Leave", url: "/admin/teacherleave/new", icon: "fas fa-calendar-minus", roles: ["admin","teacher"] },
    { name: "Reports", url: "/admin/reports", icon: "fas fa-chart-bar", roles: ["admin"] },
];
  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* SideMenu */}
      <aside className="md:w-1/6 fixed md:relative h-full z-50">
        <SideMenu menuItems={menuItems} />
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:w-5/6 bg-gray-50 shadow-md p-4 rounded-md overflow-auto">
        <div className="text-center">
          <h2 className="font-bold text-xl md:text-2xl">{dashboardTitle}</h2>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;