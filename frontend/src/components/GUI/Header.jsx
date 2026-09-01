import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useLazyLogoutQuery, useGetMeQuery } from "../../redux/api/authApi";
import {
  Cog6ToothIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  PhotoIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "../LanguageSwitcher";
import { useGetCampusQuery, useSetCampusTokenMutation } from "../../redux/api/campusApi";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useGetAcademicYearsListQuery } from "../../redux/api/academicYearApi";
import { useGetSchoolQuery } from "../../redux/api/schoolApi";

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

  const deleteCookie = (name, path = '/') => {
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  };

  const location = useLocation();
  const { isLoading } = useGetMeQuery();
  const { data: campusData, isLoading: campusLoading } = useGetCampusQuery({ limit: 0 });
  const [setCampusToken] = useSetCampusTokenMutation();
  const [logout] = useLazyLogoutQuery();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { data: schoolData, isLoading: schoolLoading } = useGetSchoolQuery();

  const { data: academicYearsData, isLoading: academicYearsLoading } = useGetAcademicYearsListQuery(
    { limit: 0, sort: "-createdAt" },
    { skip: !isAuthenticated }
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState(() => {
    return getCookie('academicYear') || '';
  });
  const [selectedAcademicYearName, setSelectedAcademicYearName] = useState(() => {
    return getCookie('academicYearName') || '';
  });

  const dropdownTimeoutRef = useRef(null);
  const campusRef = useRef(null);
  const yearRef = useRef(null);

  const [selectedCampus, setSelectedCampus] = useState(() => {
    const cookieCampus = getCookie('campus');
    return cookieCampus || user?.campus?._id || '';
  });

  const roleTitles = {
    user: t("User Dashboard"),
    admin: t("Admin Dashboard"),
    teacher: t("Teacher Dashboard"),
    student: t("Student Dashboard"),
    finance: t("Finance Dashboard"),
    principle: t("Principle Dashboard"),
    counselor: t("Counselor Dashboard"),
  };

  const dashboardTitle = roleTitles[user?.role] || t("Dashboard");

  useEffect(() => {
    const storedAcademicYear = getCookie('academicYear');
    const storedAcademicYearName = getCookie('academicYearName');
    if (storedAcademicYear) setSelectedAcademicYear(storedAcademicYear);
    if (storedAcademicYearName) setSelectedAcademicYearName(storedAcademicYearName);
  }, []);

  useEffect(() => {
    if (selectedAcademicYear && !selectedAcademicYearName && academicYearsData?.academicYears) {
      const found = academicYearsData.academicYears.find(y => y._id === selectedAcademicYear);
      if (found && found.name) {
        setSelectedAcademicYearName(found.name);
        document.cookie = `academicYearName=${encodeURIComponent(found.name)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      }
    }
  }, [academicYearsData, selectedAcademicYear, selectedAcademicYearName]);

  useEffect(() => {
    if (!selectedCampus && user?.campus?._id) {
      setSelectedCampus(user.campus._id);
    }
  }, [user, selectedCampus]);

  // Close custom dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (campusRef.current && !campusRef.current.contains(e.target)) setIsCampusOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target)) setIsYearOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const handleCampusChange = (value) => {
    setSelectedCampus(value);
    setIsCampusOpen(false);

    deleteCookie('academicYear');
    deleteCookie('academicYearName');
    setSelectedAcademicYear('');
    setSelectedAcademicYearName('');

    setCampusToken(value)
      .unwrap()
      .then((response) => {
        if (response.success) {
          sessionStorage.setItem('promptAcademicYear', '1');
          window.location.reload();
        }
      })
      .catch((err) => console.error(err));
  };

  const handleAcademicYearChange = (yearId, yearName) => {
    setSelectedAcademicYear(yearId);
    setSelectedAcademicYearName(yearName);
    setIsYearOpen(false);

    document.cookie = `academicYear=${encodeURIComponent(yearId)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    document.cookie = `academicYearName=${encodeURIComponent(yearName)}; path=/; max-age=${60 * 60 * 24 * 365}`;

    sessionStorage.removeItem('promptAcademicYear');
    window.location.reload();
  };

  useEffect(() => {
    if (isAuthenticated && sessionStorage.getItem('promptAcademicYear') === '1' && !selectedAcademicYear) {
      window.alert(t("Campus changed. Please select an academic year to continue."));
      sessionStorage.removeItem('promptAcademicYear');
    }
  }, [isAuthenticated, selectedAcademicYear, t]);

  const logoutHandler = () => {
    logout().then(() => {
      localStorage.clear();
      sessionStorage.clear();

      deleteCookie('academicYear');
      deleteCookie('academicYearName');
      deleteCookie('campus');

      window.location.href = "/";
    });
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || t("User");
  const currentCampusName = campusData?.campuses?.find(c => c._id === selectedCampus)?.name || t("Select Campus");

  if (location.pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-surface-100 px-4 md:px-5 py-1 font-sans">
      <div className="flex items-center justify-between">

        {/* LEFT: Brand & Title Section */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-3 group">
            {schoolData?.logo?.url ? (
              <img
                src={schoolData.logo.url}
                alt={schoolData?.name || "School Logo"}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-surface-100 border border-surface-100">
                <PhotoIcon className="w-8 h-8 text-ink-300" />
              </div>
            )}
            <div className="hidden xl:block">
              <h1 className="text-base-custom font-heading font-black tracking-tight text-ink-900 leading-none">
                {schoolData?.name || "Loading..."}
              </h1>
              <p className="text-nav-caption font-bold text-ink-400 uppercase mt-1">
                {schoolData?.tagline || t("Management Pro")}
              </p>
            </div>
          </Link>

          <div className="hidden md:block h-8 w-px bg-surface-100 mx-2"></div>
        </div>

        {/* RIGHT: Actions & User Info */}
        <div className="flex items-center space-x-4 lg:space-x-8">

          {/* Status & Login Info (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 border-r border-surface-100 pr-6">
            <div className="text-right">
              <p className="text-nav-caption font-bold text-ink-400 uppercase">{t("Last Session")}</p>
              <div className="flex items-center text-sm-custom font-semibold text-ink-700">
                <CalendarIcon className="w-3.5 h-3.5 mr-1 text-brand-500" />
                {dayjs().format('DD MMM, YYYY')}
              </div>
            </div>
            <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-nav-caption font-black uppercase border border-brand-100">
              {user?.role || t("User")}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageSwitcher />

            {/* Academic Year Selector — custom dropdown, no native <select> panel */}
            {isAuthenticated && (
              <div className="relative hidden sm:block" ref={yearRef}>
                <button
                  onClick={() => setIsYearOpen(!isYearOpen)}
                  disabled={academicYearsLoading}
                  className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg border text-xs-custom font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${!selectedAcademicYear
                      ? 'bg-brand-50 border-brand-300 text-brand-700 ring-2 ring-brand-500/15'
                      : 'bg-surface-50 border-surface-200 text-ink-700 hover:border-surface-300'}`}
                >
                  <AcademicCapIcon className="w-3.5 h-3.5 opacity-70" />
                  <span className="max-w-[110px] truncate">
                    {selectedAcademicYearName || t("Select Academic Year")}
                  </span>
                  <ChevronDownIcon className={`w-3 h-3 opacity-60 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
                </button>

                {isYearOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-premium border border-surface-100 py-1.5 z-50 animate-slide-up">
                    {academicYearsLoading ? (
                      <p className="px-3 py-2 text-xs-custom text-ink-400">{t("Loading...")}</p>
                    ) : (
                      academicYearsData?.academicYears?.map((year) => (
                        <button
                          key={year._id}
                          onClick={() => handleAcademicYearChange(year._id, year.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 mx-1 rounded-lg text-xs-custom font-semibold transition-colors
                            ${selectedAcademicYear === year._id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-surface-50'}`}
                        >
                          <span className="truncate">{year.name}</span>
                          {selectedAcademicYear === year._id && <CheckIcon className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {!selectedAcademicYear && (
                  <p className="absolute left-0 top-full mt-1 text-nav-caption font-bold text-brand-600 whitespace-nowrap">
                    {t("Please select academic year")}
                  </p>
                )}
              </div>
            )}

            {/* Campus selector — custom dropdown, replaces the flat system-blue <select> */}
            {isAuthenticated && (
              <>
                {user?.role === "admin" ? (
                  <div className="relative hidden md:block" ref={campusRef}>
                    <button
                      onClick={() => setIsCampusOpen(!isCampusOpen)}
                      className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs-custom font-bold shadow-button hover:shadow-glow-brand transition-all"
                    >
                      <BuildingOffice2Icon className="w-3.5 h-3.5 opacity-90" />
                      <span className="max-w-[110px] truncate">
                        {campusLoading ? t("Loading...") : currentCampusName}
                      </span>
                      <ChevronDownIcon className={`w-3 h-3 opacity-90 transition-transform ${isCampusOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCampusOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-premium border border-surface-100 py-1.5 z-50 animate-slide-up">
                        {campusLoading ? (
                          <p className="px-3 py-2 text-xs-custom text-ink-400">{t("Loading...")}</p>
                        ) : (
                          campusData?.campuses?.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => handleCampusChange(c._id)}
                              className={`w-full flex items-center justify-between px-3 py-2 mx-1 rounded-lg text-xs-custom font-semibold transition-colors
                                ${selectedCampus === c._id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-surface-50'}`}
                            >
                              <span className="truncate">{c.name}</span>
                              {selectedCampus === c._id && <CheckIcon className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  user?.campus?.name && (
                    <span className="hidden md:inline-block px-3 py-1 bg-surface-100 text-ink-700 rounded-lg text-xs-custom font-bold">
                      {user.campus.name}
                    </span>
                  )
                )}
              </>
            )}
          </div>

          {/* User Profile Dropdown */}
          {isAuthenticated && (
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center space-x-2 p-1 rounded-xl hover:bg-surface-50 transition-all">
                <div className="relative">
                  <img
                    src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                    alt="User"
                    className="w-9 h-9 rounded-lg object-cover ring-2 ring-white shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <Cog6ToothIcon className="w-5 h-5 text-ink-400 hover:rotate-90 transition-transform duration-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-premium border border-surface-100 py-2 overflow-hidden animate-slide-up">
                  <div className="px-4 py-3 bg-surface-50/50 border-b border-surface-50">
                    <p className="text-sm-custom font-black text-ink-900 truncate">{displayName}</p>
                    <p className="text-nav-caption text-brand-600 font-bold uppercase">{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/me/profile" className="flex items-center px-3 py-2 text-sm-custom text-ink-600 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors">
                      <i className="fas fa-id-badge mr-3 opacity-70"></i> {t("My Profile")}
                    </Link>
                    {user?.role === "admin" && (
                      <Link to="/admin/dashboard" className="flex items-center px-3 py-2 text-sm-custom text-ink-600 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors">
                        <i className="fas fa-th-large mr-3 opacity-70"></i> {t("Control Panel")}
                      </Link>
                    )}
                    <button onClick={logoutHandler} className="flex items-center w-full px-3 py-2 text-sm-custom text-brand-600 hover:bg-brand-50 rounded-lg font-bold transition-colors">
                      <i className="fas fa-power-off mr-3 opacity-70"></i> {t("Sign Out")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-ink-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;