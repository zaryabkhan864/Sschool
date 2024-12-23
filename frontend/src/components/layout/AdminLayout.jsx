import React from "react";
import SideMenu from "./SideMenu";
import Header from "./Header";

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
      <Header />
      <div className="my-4 py-4">
        <h2 className="text-center font-bold text-xl md:text-2xl">Admin Dashboard</h2>
      </div>

      <div className="flex flex-col md:flex-row justify-between">
        <div className="w-full md:w-1/6 mb-4 md:mb-0">
          <SideMenu menuItems={menuItems} />
        </div>
        <div className="w-full md:w-9/12 bg-gray-50 shadow-md p-4 rounded-md">
          {children}
        </div>
      </div>
    </React.Fragment>
  );
};

export default AdminLayout;
