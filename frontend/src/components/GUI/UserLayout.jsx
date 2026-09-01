import React from "react";
import { useSelector } from "react-redux";
import SideMenu from "../layout/SideMenu";

const UserLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: "Profile", url: "/me/profile", icon: "fas fa-user", group: "settings" },
    { name: "Update Profile", url: "/me/update_profile", icon: "fas fa-user-edit", group: "settings" },
    { name: "Upload Avatar", url: "/me/upload_avatar", icon: "fas fa-user-circle", group: "settings" },
    { name: "Update Password", url: "/me/update_password", icon: "fas fa-lock", group: "settings" },
  ];

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Koi fixed-width wrapper nahi — SideMenu khud apni width control karta hai (w-72 / w-20 / drawer) */}
      <SideMenu menuItems={menuItems} user={user} />

      {/* Main Content */}
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

export default UserLayout;
