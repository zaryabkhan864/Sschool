// admin layout 
import React from "react";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu";

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const allMenuItems = [

    { name: "Dashboard", url: "/admin/dashboard", icon: "fas fa-chart-line", roles: ["admin"], group: "main" },
    { name: "Teacher Dashboard", url: "/teacher/dashboard", icon: "fas fa-chalkboard-teacher", roles: ["teacher"], group: "main" },
    { name: "Student Dashboard", url: "/student/dashboard", icon: "fas fa-user-graduate", roles: ["student"], group: "main" },
    { name: "Finance Dashboard", url: "/finance/dashboard", icon: "fas fa-coins", roles: ["finance"], group: "main" },
    { name: "Counsellor Dashboard", url: "/counsellor/dashboard", icon: "fas fa-user-md", roles: ["counselor"], group: "main" },
    { name: "Principal Dashboard", url: "/principle/dashboard", icon: "fas fa-user-tie", roles: ["principal"], group: "main" },

    // Timetable Management
    { name: "Academic Level", url: "/admin/academic-level", icon: "fas fa-layer-group", roles: ["admin", "principal"], group: "timetable" },
    { name: "Create Timetable", url: "/admin/academic-level/new", icon: "fas fa-calendar-plus", roles: ["admin", "principal"], group: "timetable" },
    { name: "Session Template", url: "/admin/session-templates", icon: "fas fa-stream", roles: ["admin", "principal"], group: "timetable" },
    { name: "Week Days", url: "/admin/week-day", icon: "fas fa-calendar-week", roles: ["admin", "principal"], group: "timetable" },
    { name: "Day Session Template", url: "/admin/day-session-template/new", icon: "fas fa-hourglass-half", roles: ["admin", "principal"], group: "timetable" },

    // Academics Group
    { name: "Wall", url: "/posting_wall", icon: "fas fa-bullhorn", roles: ["admin", "teacher", "student"], group: "academics" },
    { name: "New Grade", url: "/admin/grade/new", icon: "fas fa-plus-circle", roles: ["admin"], group: "academics" },
    { name: "All Grades", url: "/admin/grades", icon: "fas fa-graduation-cap", roles: ["admin", "teacher"], group: "academics" },
    { name: "New Course", url: "/admin/course/new", icon: "fas fa-plus-circle", roles: ["admin"], group: "academics" },
    { name: "All Courses", url: "/admin/courses", icon: "fas fa-book-open", roles: ["admin", "teacher"], group: "academics" },
    { name: "New Class Group", url: "/admin/class-groups/new", icon: "fas fa-object-group", roles: ["admin", "principal"], group: "academics" },
    { name: "All Class Groups", url: "/admin/class-groups", icon: "fas fa-object-group", roles: ["admin", "principal"], group: "academics" },

    { name: "Homework & Assignments", url: "/teacher/homework", icon: "fas fa-tasks", roles: ["admin", "teacher"], group: "academics" },
    { name: "My Homework & Assignments", url: "/student/homework", icon: "fas fa-tasks", roles: ["admin", "student"], group: "academics" },

    { name: "Projects", url: "/teacher/projects", icon: "fas fa-project-diagram", roles: ["admin", "teacher"], group: "academics" },
    { name: "My Projects", url: "/student/projects", icon: "fas fa-project-diagram", roles: ["admin", "student"], group: "academics" },


    { name: "New Teacher", url: "/admin/teacher/new", icon: "fas fa-user-plus", roles: ["admin"], group: "users" },
    { name: "All Teachers", url: "/admin/teachers", icon: "fas fa-chalkboard-teacher", roles: ["admin", "teacher"], group: "users" },
    { name: "New Employee Contract", url: "/admin/employee-contracts/new", icon: "fas fa-file-signature", roles: ["admin", "principal"], group: "users" },
    { name: "All Employee Contracts", url: "/admin/employee-contracts", icon: "fas fa-file-contract", roles: ["admin", "principal"], group: "users" },
    { name: "New Student", url: "/admin/student/new", icon: "fas fa-user-plus", roles: ["admin"], group: "users" },
    { name: "All Students", url: "/admin/students", icon: "fas fa-users", roles: ["admin"], group: "users" },
    { name: "New Student Enrollment", url: "/admin/studentenrollement/new", icon: "fas fa-clipboard-list", roles: ["admin", "principal"], group: "users" },
    { name: "All Student Enrollments", url: "/admin/studentenrollements", icon: "fas fa-clipboard-list", roles: ["admin", "principal"], group: "users" },
    { name: "New User", url: "/admin/register", icon: "fas fa-user-plus", roles: ["admin"], group: "users" },
    { name: "All Users", url: "/admin/users", icon: "fas fa-user-friends", roles: ["admin"], group: "users" },

    // Counseling Group
    { name: "Student Counseling", url: "/admin/counseling/new", icon: "fas fa-comments", roles: ["admin", "counselor"], group: "counseling" },
    { name: "Counselings", url: "/admin/counselings", icon: "fas fa-comments", roles: ["admin"], group: "counseling" },

    // Campus Group
    { name: "School Information", url: "/admin/school/new", icon: "fas fa-school", roles: ["admin"], group: "campus" },
    { name: "New Campus", url: "/admin/campus/new", icon: "fas fa-school", roles: ["admin"], group: "campus" },
    { name: "All Campuses", url: "/admin/campuses", icon: "fas fa-school", roles: ["admin"], group: "campus" },
    { name: "Academic Year", url: "/admin/AcademicYear/new", icon: "fas fa-clock", roles: ["admin", "principal"], group: "campus" },

    // Attendance & Exams Group
    { name: "New Attendance", url: "/admin/attendance/new", icon: "fas fa-clipboard-check", roles: ["admin", "teacher"], group: "attendance" },

    { name: "New Quiz", url: "/teacher/quiz/new", icon: "fas fa-question-circle", roles: ["admin", "teacher"], group: "attendance" },
    { name: "Quizzes", url: "/teacher/quizzes", icon: "fas fa-list-ol", roles: ["admin", "teacher"], group: "attendance" },
    { name: "New Exam", url: "/teacher/exam/new", icon: "fas fa-file-alt", roles: ["admin", "teacher"], group: "attendance" },
    { name: "Exams", url: "/teacher/exams", icon: "fas fa-file-invoice", roles: ["admin", "teacher"], group: "attendance" },

    // Events Group
    { name: "New Event", url: "/admin/event/new", icon: "fas fa-plus-circle", roles: ["admin"], group: "events" },
    { name: "Events", url: "/admin/events", icon: "fas fa-calendar-alt", roles: ["admin"], group: "events" },

    // Finance Group
    { name: "Collect Payment", url: "/admin/finance/fees/payment", icon: "fas fa-money-bill-wave", roles: ["admin", "finance"], group: "fees" },
    { name: "Paid Fees List", url: "/admin/finance/fees/paid", icon: "fas fa-receipt", roles: ["admin", "finance"], group: "fees" },
    { name: "Upcoming Dues", url: "/admin/finance/fees/due", icon: "fas fa-bell", roles: ["admin", "finance"], group: "fees" },


    { name: "Pending Fees (Students)", url: "/finance/students/fees", icon: "fas fa-hand-holding-usd", roles: ["admin", "finance"], group: "fees" },

    { name: "Dues Cleared", url: "/finance/students/fees/dues-cleared", icon: "fas fa-check-circle", roles: ["admin", "finance"], group: "fees" },
    { name: "New Fee Entry", url: "/finance/fees/new", icon: "fas fa-plus-circle", roles: ["admin", "finance"], group: "fees" },

    { name: "Emp Salary", url: "/finance/employee/salaries", icon: "fas fa-money-check-alt", roles: ["admin", "finance"], group: "finance" },
    { name: "Emp Salary List", url: "/finance/employees/salaries", icon: "fas fa-clipboard-list", roles: ["admin", "finance"], group: "finance" },
    // 👇 NEW: rest of the Salary module
    { name: "Pay Salary", url: "/finance/salaries/pay", icon: "fas fa-money-bill-wave", roles: ["admin", "finance"], group: "finance" },
    { name: "Paid Salaries", url: "/finance/salaries/paid", icon: "fas fa-receipt", roles: ["admin", "finance"], group: "finance" },
    { name: "Find Teacher Salary", url: "/finance/salaries/lookup", icon: "fas fa-search-dollar", roles: ["admin", "finance"], group: "finance" },
    { name: "New Expense", url: "/finance/expenses", icon: "fas fa-file-invoice", roles: ["admin", "finance"], group: "expenses" },
    { name: "Expense List", url: "/finance/expense/List", icon: "fas fa-list-ul", roles: ["admin", "finance"], group: "expenses" },


    // Leaves Group
    { name: "New Teacher Leave", url: "/admin/teacherleave/new", icon: "fas fa-calendar-minus", roles: ["admin", "teacher"], group: "leaves" },
    { name: "Teacher Leave Details", url: "/admin/TeacherLeaves", icon: "fas fa-calendar-minus", roles: ["admin", "teacher"], group: "leaves" },

    // Others Group
    { name: "Reviews", url: "/admin/reviews", icon: "fas fa-star", roles: ["admin"], group: "others" },
    { name: "Reports", url: "/admin/reports", icon: "fas fa-chart-bar", roles: ["admin"], group: "others" },

    { name: "Meeting & Task", url: "/", icon: "fas fa-tasks", roles: ["admin"], group: "others" },

  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(user?.role));

  return (

    <div className="flex min-h-screen bg-surface-50">

      <SideMenu menuItems={menuItems} user={user} />

      {/* Content Area */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-surface-100 min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;