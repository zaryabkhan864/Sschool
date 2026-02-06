import React from "react";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu";

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const allMenuItems = [
    // Dashboard Group
    { name: "Dashboard", url: "/admin/dashboard", icon: "fas fa-chart-line", roles: ["admin"], group: "main" },
    { name: "Teacher Dashboard", url: "/teacher/dashboard", icon: "fas fa-chalkboard-teacher", roles: ["teacher"], group: "main" },
    { name: "Student Dashboard", url: "/student/dashboard", icon: "fas fa-user-graduate", roles: ["student"], group: "main" },
    { name: "Finance Dashboard", url: "/finance/dashboard", icon: "fas fa-coins", roles: ["finance"], group: "main" },
    { name: "Counsellor Dashboard", url: "/counsellor/dashboard", icon: "fas fa-user-md", roles: ["counsellor"], group: "main" },
    { name: "Principal Dashboard", url: "/principle/dashboard", icon: "fas fa-user-tie", roles: ["principle"], group: "main" },

    // Timetable Management (The group you wanted)
    { name: "Create Timetable", url: "/admin/academic-level/new", icon: "fas fa-calendar-plus", roles: ["admin", "principle"], group: "timetable" },
    { name: "Academic Level", url: "/admin/academic-level", icon: "fas fa-layer-group", roles: ["admin", "principle"], group: "timetable" },
    { name: "Class Group", url: "/admin/class-groups", icon: "fas fa-object-group", roles: ["admin", "principle"], group: "timetable" },
    { name: "Session Template", url: "/admin/session-templates", icon: "fas fa-clock", roles: ["admin", "principle"], group: "timetable" },

    // Academics Group
    { name: "Wall", url: "/posting_wall", icon: "fas fa-bullhorn", roles: ["admin", "teacher", "student"], group: "academics" },
    { name: "New Grade", url: "/admin/grade/new", icon: "fas fa-plus-circle", roles: ["admin"], group: "academics" },
    { name: "All Grades", url: "/admin/grades", icon: "fas fa-graduation-cap", roles: ["admin", "teacher"], group: "academics" },
    { name: "New Course", url: "/admin/course/new", icon: "fas fa-plus-circle", roles: ["admin"], group: "academics" },
    { name: "All Courses", url: "/admin/courses", icon: "fas fa-book-open", roles: ["admin", "teacher"], group: "academics" },

    // Users Group
    { name: "New Teacher", url: "/admin/teacher/new", icon: "fas fa-user-plus", roles: ["admin"], group: "users" },
    { name: "All Teachers", url: "/admin/teachers", icon: "fas fa-chalkboard-teacher", roles: ["admin", "teacher"], group: "users" },
    { name: "New Student", url: "/admin/student/new", icon: "fas fa-user-plus", roles: ["admin"], group: "users" },
    { name: "All Students", url: "/admin/students", icon: "fas fa-users", roles: ["admin"], group: "users" },
    { name: "New User", url: "/admin/register", icon: "fas fa-user-plus", roles: ["admin"], group: "users" },
    { name: "All Users", url: "/admin/users", icon: "fas fa-user-friends", roles: ["admin"], group: "users" },

    // Counseling Group
    { name: "Student Counseling", url: "/admin/counseling/new", icon: "fas fa-comments", roles: ["admin", "counsellor"], group: "counseling" },
    { name: "Counselings", url: "/admin/counselings", icon: "fas fa-comments", roles: ["admin"], group: "counseling" },

    // Campus Group
    { name: "New Campus", url: "/admin/campus/new", icon: "fas fa-school", roles: ["admin"], group: "campus" },
    { name: "All Campuses", url: "/admin/campuses", icon: "fas fa-school", roles: ["admin"], group: "campus" },

    // Attendance & Exams Group
    { name: "New Attendance", url: "/admin/attendance/new", icon: "fas fa-clipboard-check", roles: ["admin", "teacher"], group: "attendance" },
    { name: "New Quiz", url: "/admin/quiz/new", icon: "fas fa-question-circle", roles: ["admin", "teacher"], group: "attendance" },
    { name: "New Exam", url: "/admin/exam", icon: "fas fa-file-alt", roles: ["admin", "teacher"], group: "attendance" },

    // Events Group
    { name: "New Event", url: "/admin/event/new", icon: "fas fa-plus-circle", roles: ["admin"], group: "events" },
    { name: "Events", url: "/admin/events", icon: "fas fa-calendar-alt", roles: ["admin"], group: "events" },

    // Finance Group
    { name: "Student Fees", url: "/finance/student/fees", icon: "fas fa-money-bill-wave", roles: ["admin", "finance"], group: "finance" },
    { name: "Student Fees List", url: "/finance/students/fees", icon: "fas fa-receipt", roles: ["admin", "finance"], group: "finance" },
    { name: "Emp Salary", url: "/finance/employee/salaries", icon: "fas fa-coins", roles: ["admin", "finance"], group: "finance" },
    { name: "Emp Salary List", url: "/finance/employees/salaries", icon: "fas fa-list-alt", roles: ["admin", "finance"], group: "finance" },
    { name: "New Expense", url: "/finance/expenses", icon: "fas fa-money-check-alt", roles: ["admin", "finance"], group: "finance" },
    { name: "Expense List", url: "/finance/expense/List", icon: "fas fa-file-invoice-dollar", roles: ["admin", "finance"], group: "finance" },

    // Leaves Group
    { name: "New Teacher Leave", url: "/admin/teacherleave/new", icon: "fas fa-calendar-minus", roles: ["admin", "teacher"], group: "leaves" },
    { name: "Teacher Leave Details", url: "/admin/TeacherLeaves", icon: "fas fa-calendar-minus", roles: ["admin", "teacher"], group: "leaves" },

    // Others Group
    { name: "Reviews", url: "/admin/reviews", icon: "fas fa-star", roles: ["admin"], group: "others" },
    { name: "Reports", url: "/admin/reports", icon: "fas fa-chart-bar", roles: ["admin"], group: "others" },
    { name: "Meeting & Task", url: "/", icon: "fas fa-tasks", roles: ["admin"], group: "others" },
    { name: "Projects", url: "/", icon: "fas fa-project-diagram", roles: ["admin"], group: "others" },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:block w-72 shrink-0 h-screen sticky top-0 overflow-hidden shadow-2xl">
        <SideMenu menuItems={menuItems} user={user} />
      </div>

      {/* Sidebar Mobile Wrapper */}
      <div className="md:hidden">
        <SideMenu menuItems={menuItems} user={user} />
      </div>

      {/* Content Area */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;