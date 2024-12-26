import React from "react";
import SideMenu from "./SideMenu";

const AdminLayout = ({ children }) => {
  const menuItems = [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: "fas fa-tachometer-alt", // Dashboard icon
    },
    {
      name: "New Grade",
      url: "/admin/grade/new",
      icon: "fas fa-plus-circle", // Add icon for "New" actions
    },
    {
      name: "Grades",
      url: "/admin/grades",
      icon: "fas fa-graduation-cap", // Education-related icon for grades
    },
    {
      name: "New Course",
      url: "/admin/course/new",
      icon: "fas fa-plus-circle", // Add icon for "New" actions
    },
    {
      name: "Courses",
      url: "/admin/courses",
      icon: "fas fa-book", // Book icon for courses
    },
    {
      name: "New Student",
      url: "/admin/student/new",
      icon: "fas fa-user-plus", // Add user icon for new student
    },
    {
      name: "Students",
      url: "/admin/students",
      icon: "fas fa-users", // Group icon for students
    },
    {
      name: "Reviews",
      url: "/admin/reviews",
      icon: "fas fa-star", // Star icon for reviews
    },
    {
      name: "Create User",
      url: "/admin/register",
      icon: "fas fa-user-plus", // Add user icon for creating a user
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: "fas fa-user-friends", // Friends/group icon for users
    },
  ];


  return (
    <React.Fragment>
      <div className="flex flex-col md:flex-row justify-between p-5 relative">
        {/* No additional toggle button here */}
        <div className="md:w-2/12 self-end sm:self-auto">
          <SideMenu menuItems={menuItems} />
        </div>

        <div className="w-full md:w-9/12 bg-gray-50 shadow-md p-4 rounded-md">
          <div className="text-center">
            <h2 className="font-bold text-xl md:text-2xl">Admin Dashboard</h2>
          </div>
          {children}
        </div>
      </div>
    </React.Fragment>
  );
};

export default AdminLayout;
