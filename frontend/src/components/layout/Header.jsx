import React, { useState, useRef, useEffect } from "react";
import Search from "./Search";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import LanguageSwitcher from "../LanguageSwitcher";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useGetMeQuery();
  const [logout] = useLazyLogoutQuery();
  const { user } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [timer, setTimer] = useState(0);
  const dropdownTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const logoutHandler = () => {
    logout()
      .then(() => {
        window.location.href = "/";
        localStorage.clear();
        sessionStorage.clear();
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (user) {
      const timerInterval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [user]);

  useEffect(() => {
    if (timer > 0) {
      localStorage.setItem("timer", timer);
    }
  }, [timer]);

  useEffect(() => {
    const savedTimer = localStorage.getItem("timer");
    if (savedTimer) {
      setTimer(Number(savedTimer));
    }
  }, []);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-4  shadow-lg relative py-3">
      {user ? (
        <>
          <button
            className="md:hidden text-gray-700 px-4 py-2"
            onClick={toggleMenu}
          >
            {menuOpen ? "✖" : "☰"}
          </button>

          <div className="flex items-center">
            <Link to="/">
              <img
                src="/images/Logo.png"
                alt="School Logo"
                className="w-14 md:w-18"
              />
            </Link>
            <h2>School Managment System</h2>
          </div>

          {menuOpen && (
            <div className="absolute top-12 left-0 w-full bg-white shadow-md md:hidden z-10">
              <ul className="flex flex-col items-start">
                <li className="w-full px-4 py-2 hover:bg-gray-200">
                  <Link to="/me/profile">Profile</Link>
                </li>
                {user?.role === "admin" && (
                  <li className="w-full px-4 py-2 hover:bg-gray-200">
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </li>
                )}
                <li className="w-full px-4 py-2 hover:bg-gray-200">
                  <button
                    className="text-red-600"
                    onClick={logoutHandler}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}

          <div className="flex items-center">
            <LanguageSwitcher/>
            <div className="text-xl text-gray-800 mx-4">{`Login Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</div>
            <div
              className="hidden md:flex relative items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center text-gray-700 hover:text-gray-900">
                <figure className="w-10 h-10 rounded-full overflow-hidden mr-2">
                  <img
                    src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </figure>
                <span className="text-sm font-medium">{user?.name}</span>
                <button className="ml-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                  <Cog6ToothIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-40 w-48 bg-white rounded-md shadow-lg z-10"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
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
          </div>

        </>
      ) : (
        !isLoading && (
          <div className="flex justify-center w-full">
            <>
            <LanguageSwitcher/>
            <Link
              to="/"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300"
            >
              Login
            </Link>
            </>
          </div>
        )
      )}
    </nav>
  );
};

export default Header;