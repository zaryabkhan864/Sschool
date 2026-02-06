import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon 
} from "@heroicons/react/24/outline";

const SideMenu = ({ menuItems, user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const groupNames = {
    main: "Dashboard",
    timetable: "Timetable Management",
    academics: "Academics",
    users: "Users",
    finance: "Finance",
    counseling: "Counseling",
    campus: "Campus",
    attendance: "Attendance & Exams",
    events: "Events",
    leaves: "Leaves",
    others: "Others"
  };

  useEffect(() => {
    const currentItem = menuItems.find(item => item.url === location.pathname);
    if (currentItem && currentItem.group) {
      setOpenGroups(prev => ({ ...prev, [currentItem.group]: true }));
    }
    setActiveMenuItem(location.pathname);
  }, [location.pathname, menuItems]);

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Sidebar Body */}
      <div className={`h-full w-72 bg-slate-900 flex flex-col transition-all duration-300 z-40
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 shadow-2xl' : 'fixed md:relative -translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SchoolSync</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {Object.entries(groupedMenuItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-2">
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">
                    {groupNames[groupName] || groupName}
                  </span>
                </div>
                {openGroups[groupName] ? (
                  <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${
                  openGroups[groupName] ? 'max-h-[1500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="ml-4 border-l border-slate-800 space-y-1">
                  {items.map((menuItem, index) => (
                    <Link
                      key={index}
                      to={menuItem.url}
                      className={`flex items-center gap-3 p-3 ml-2 rounded-lg transition-all ${
                        activeMenuItem === menuItem.url
                          ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                      onClick={() => {
                        setActiveMenuItem(menuItem.url);
                        if(window.innerWidth < 768) setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className={`${menuItem.icon} text-base w-5 text-center`}></i>
                      <span className="text-[15px] font-medium leading-tight">{t(menuItem.name)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800">
           <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400 font-medium tracking-wide">SYSTEM ACTIVE</span>
           </div>
           <p className="px-2 mt-1 text-[10px] text-slate-600 uppercase">v2.0.4 • {user?.role}</p>
        </div>
      </div>
      
      {/* Overlay for mobile view */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default SideMenu;