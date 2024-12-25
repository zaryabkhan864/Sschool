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
      <div className="flex flex-col md:flex-row justify-between p-5 relative">
        {/* No additional toggle button here */}
        <div className="md:w-2/12 self-end sm:self-auto">
          <SideMenu menuItems={menuItems} />
        </div>

        <div className="w-full md:w-9/12 bg-gray-50 shadow-md p-4 rounded-md">
          <div className="text-center">
            <h2 className="font-bold text-xl md:text-2xl">User Setting</h2>
          </div>
          {children}
        </div>
      </div>
    </React.Fragment>

  );
};

export default UserLayout;