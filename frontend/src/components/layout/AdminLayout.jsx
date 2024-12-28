import React from "react";
import SideMenu from "./SideMenu";

const AdminLayout = ({ children }) => {
  const menuItems = [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: "fas fa-tachometer-alt",
    },
    {
      name: "New Grade",
      url: "/admin/grade/new",
      icon: "fas fa-plus",
    },
    {
      name: "Grades",
      url: "/admin/grades",
      icon: "fab fa-product-hunt",
    },
    {
      name: "New Course",
      url: "/admin/course/new",
      icon: "fas fa-plus",
    },
    {
      name: "Courses",
      url: "/admin/courses",
      icon: "fab fa-product-hunt",
    },
    {
      name: "New Teacher",
      url: "/admin/teacher/new",
      icon: "fas fa-plus",
    },
    {
      name: "Teachers",
      url: "/admin/teachers",
      icon: "fab fa-product-hunt",
    },
    {
      name: "New Student",
      url: "/admin/student/new",
      icon: "fas fa-plus",
    },
    {
      name: "Students",
      url: "/admin/students",
      icon: "fab fa-product-hunt",
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: "fas fa-user",
    },
    {
      name: "Reviews",
      url: "/admin/reviews",
      icon: "fas fa-star",
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
