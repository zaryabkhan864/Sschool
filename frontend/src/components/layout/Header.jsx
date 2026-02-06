import React, { useState, useRef, useEffect } from "react";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import { Cog6ToothIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, CalendarIcon } from "@heroicons/react/24/outline";
import LanguageSwitcher from "../LanguageSwitcher";
import { useGetCampusQuery, useSetCampusTokenMutation } from "../../redux/api/campusApi";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();
  const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) return decodeURIComponent(cookieValue);
    }
    return null;
  };

  const location = useLocation();
  const { isLoading } = useGetMeQuery();
  const { data: CampusData, isLoading: CampusLoading } = useGetCampusQuery();
  const [setCampusToken] = useSetCampusTokenMutation();
  const [logout] = useLazyLogoutQuery();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(getCookie('campus'));
  const [selectedCampusName, setSelectedCampusName] = useState(user?.campus?.name || 'N/A');

  const [selectedYear, setSelectedYear] = useState('');
  const dropdownTimeoutRef = useRef(null);

  const currentYear = dayjs().year();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const roleTitles = {
    user: t("User Dashboard"),
    admin: t("Admin Dashboard"),
    teacher: t("Teacher Dashboard"),
    student: t("Student Dashboard"),
    finance: t("Finance Dashboard"),
    principle: t("Principal Dashboard"),
    counsellor: t("Counsellor Dashboard"),
  };

  const dashboardTitle = roleTitles[user?.role] || t("Dashboard");

  useEffect(() => {
    const storedYear = getCookie('selectedYear');
    if (storedYear) {
      setSelectedYear(storedYear);
    } else {
      const defaultYear = currentYear.toString();
      setSelectedYear(defaultYear);
      document.cookie = `selectedYear=${encodeURIComponent(defaultYear)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
  }, [currentYear, user]);

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const handleChange = (value) => {
    setSelectedCampus(value);
    setCampusToken(value)
      .unwrap()
      .then((response) => {
        if (response.success) window.location.reload();
      })
      .catch((err) => console.error(err));
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    document.cookie = `selectedYear=${encodeURIComponent(year)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  const logoutHandler = () => {
    logout().then(() => {
      window.location.href = "/";
      localStorage.clear();
      sessionStorage.clear();
    });
  };

  if (location.pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 md:px-8 py-3">
      <div className="flex items-center justify-between">
        
        {/* LEFT: Brand & Title Section */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
              <img src="/images/Logo.png" alt="Logo" className="w-7 h-7 brightness-200" />
            </div>
            <div className="hidden xl:block">
              <h1 className="text-lg font-black tracking-tight text-gray-900 leading-none">
                School<span className="text-blue-600">Sync</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Management Pro</p>
            </div>
          </Link>

          <div className="hidden md:block h-8 w-[1px] bg-gray-200 mx-2"></div>

          <h2 className="text-lg md:text-xl font-extrabold text-gray-800 tracking-tight">
            {dashboardTitle}
          </h2>
        </div>

        {/* RIGHT: Actions & User Info */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          
          {/* Status & Login Info (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 border-r border-gray-100 pr-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Last Session</p>
              <div className="flex items-center text-sm font-semibold text-gray-700">
                <CalendarIcon className="w-3.5 h-3.5 mr-1 text-blue-500" />
                {dayjs().format('DD MMM, YYYY')}
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {user?.role || "User"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageSwitcher />

            {/* Session/Year Selector */}
            <div className="relative group hidden sm:block">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer text-xs font-bold"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year} Session</option>
                ))}
              </select>
              <ChevronDownIcon className="w-3 h-3 absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Campus Selector */}
            {isAuthenticated && user?.role === "admin" && (
              <div className="relative hidden md:block">
                <select
                  className="appearance-none bg-blue-600 text-white py-1.5 px-3 pr-8 rounded-lg focus:outline-none shadow-md shadow-blue-200 cursor-pointer text-xs font-bold"
                  value={selectedCampus}
                  onChange={(e) => handleChange(e.target.value)}
                >
                  {CampusLoading ? <option>...</option> : CampusData?.campus?.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-3 h-3 absolute right-2 top-2.5 text-blue-200 pointer-events-none" />
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          {isAuthenticated && (
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-50 transition-all">
                <div className="relative">
                  <img
                    src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                    alt="User"
                    className="w-9 h-9 rounded-lg object-cover ring-2 ring-white shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <Cog6ToothIcon className="w-5 h-5 text-gray-400 hover:rotate-90 transition-transform duration-500" />
              </button>

              {/* Modern Dropdown Card */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-50">
                    <p className="text-sm font-black text-gray-800 truncate">{user?.name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/me/profile" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      <i className="fas fa-id-badge mr-3 opacity-70"></i> {t("My Profile")}
                    </Link>
                    {user?.role === "admin" && (
                      <Link to="/admin/dashboard" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                        <i className="fas fa-th-large mr-3 opacity-70"></i> {t("Control Panel")}
                      </Link>
                    )}
                    <button onClick={logoutHandler} className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors">
                      <i className="fas fa-power-off mr-3 opacity-70"></i> {t("Sign Out")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;