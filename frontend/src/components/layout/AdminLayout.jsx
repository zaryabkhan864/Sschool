import React from "react";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu";

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const allMenuItems = [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: "fas fa-tachometer-alt",
      roles: ["admin", "teacher"], // Accessible by admin and teacher
    },
    {
      name: "New Grade",
      url: "/admin/grade/new",
      icon: "fas fa-plus-circle",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "Grades",
      url: "/admin/grades",
      icon: "fas fa-graduation-cap",
      roles: ["admin", "teacher"], // Accessible by admin and teacher
    },
    {
      name: "New Course",
      url: "/admin/course/new",
      icon: "fas fa-plus-circle",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "Courses",
      url: "/admin/courses",
      icon: "fas fa-book",
      roles: ["admin", "teacher"], // Accessible by admin and teacher
    },
    {
      name: "New Teacher",
      url: "/admin/teacher/new",
      icon: "fas fa-plus",
      roles: ["admin"],
    },
    {
      name: "Teachers",
      url: "/admin/teachers",
      icon: "fab fa-product-hunt",
      roles: ["admin", "teacher"],
    },
    {
      name: "New Student",
      url: "/admin/student/new",
      icon: "fas fa-user-plus",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "Students",
      url: "/admin/students",
      icon: "fas fa-users",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "New Quiz",
      url: "/admin/quiz/new",
      icon: "fas fa-plus-circle",
      roles: ["admin", "teacher"], // Accessible by admin and teacher
    },

    {
      name: "New Event",
      url: "/admin/event/new",
      icon: "fas fa-plus-circle",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "Events",
      url: "/admin/events",
      icon: "fas fa-book",
      roles: ["admin"], // Accessible by admin
    },
    {
      name: "Reviews",
      url: "/admin/reviews",
      icon: "fas fa-star",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "Create User",
      url: "/admin/register",
      icon: "fas fa-user-plus",
      roles: ["admin"], // Only accessible by admin
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: "fas fa-user-friends",
      roles: ["admin"], // Only accessible by admin
    },

  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <React.Fragment>
      <div className="flex flex-col md:flex-row justify-between py-5 relative">
        <div className="md:w-1/6 self-end sm:self-auto">
          <SideMenu menuItems={menuItems} />
        </div>

        <div className="w-full md:w-5/6 bg-gray-50 shadow-md p-4 rounded-md">
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
