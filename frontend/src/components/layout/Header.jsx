import React, { useState } from "react";
import Search from "./Search";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import { Cog6ToothIcon } from "@heroicons/react/24/outline"; // Example for Heroicons

const Header = () => {
  const navigate = useNavigate();

  const { isLoading } = useGetMeQuery();
  const [logout] = useLazyLogoutQuery();

  const { user } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logoutHandler = () => {
    logout()
      .then(() => {
        console.log("Logout successful");
        window.location.href = "/"; // Force reload and redirect
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-4 bg-gray-100 shadow-lg">
      <div className="flex items-center justify-start w-full md:w-1/3">
        <div className="navbar-brand">
          <Link to="/">
            <img src="/images/Logo.png" alt="School Logo" className="w-16 md:w-24" />
          </Link>
        </div>
      </div>

      <div className="w-full md:w-1/3 mt-4 md:mt-0">
        <Search />
      </div>

      <div className="flex items-center justify-end w-full md:w-1/3 mt-4 md:mt-0 text-center">
        {user ? (
          <div className="relative">
            <button
              className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <figure className="w-10 h-10 rounded-full overflow-hidden mr-2">
                <img
                  src={
                    user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"
                  }
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </figure>
              <span className="text-sm font-medium">{user?.name}</span>
              <button className="ml-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                <Cog6ToothIcon className="w-6 h-6 text-gray-700" />
              </button>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                {user?.role === "admin" && (
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    to="/admin/dashboard"
                  >
                    Dashboard
                  </Link>
                )}

                <Link
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  to="/me/profile"
                >
                  Profile
                </Link>

                <button
                  className="block w-full text-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            )}

          </div>
        ) : (
          !isLoading && (
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
          )
        )}
        {/* Settings Icon */}

      </div>
    </nav>
  );
};

export default Header;
