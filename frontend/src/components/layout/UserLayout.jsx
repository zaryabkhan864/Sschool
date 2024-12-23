import React from "react";
import SideMenu from "./SideMenu";
import Header from "./Header";

const UserLayout = ({ children }) => {
  const menuItems = [
    {
      name: "Profile",
      url: "/me/profile",
      icon: "fas fa-user",
    },
    {
      name: "Update Profile",
      url: "/me/update_profile",
      icon: "fas fa-user",
    },
    {
      name: "Upload Avatar",
      url: "/me/upload_avatar",
      icon: "fas fa-user-circle",
    },
    {
      name: "Update Password",
      url: "/me/update_password",
      icon: "fas fa-lock",
    },
  ];

  return (
    <React.Fragment>
      <Header />
      <div className="my-4 py-4">
        <h2 className="text-center font-bold text-xl md:text-2xl text-gray-800">
          User Settings
        </h2>
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

export default UserLayout;