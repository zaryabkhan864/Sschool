import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";


const groupNames = {
  main: "Dashboard",
  timetable: "Timetable Management",
  academics: "Academics",
  users: "Users",
  finance: "Finance",
  expenses: "Expenses",
  fees: "Fees", 
  counseling: "Counseling",
  campus: "Campus & Academic Year",
  attendance: "Attendance & Exams",
  events: "Events",
  leaves: "Leaves",
  others: "Others"
};

// 👇 FIX: this used to build its "which groups exist" list from
// `Object.keys(groupNames)` — but menu items can (and did, for "fees")
// carry a `group` value that was never added to `groupNames` above.
// Since that group key never appeared in the accordion state object at
// all, `openGroups["fees"]` was permanently `undefined`, so clicking it
// could never set it to `true` — that group could never open, while
// every group actually listed in `groupNames` (like "finance") worked
// fine. Deriving the group list from the actual `menuItems` instead
// means ANY group used anywhere always works, regardless of whether
// it's also in `groupNames` (which now only controls the display
// label, via the `t(groupNames[groupName] || groupName)` fallback
// below).
const getGroupKeys = (items) => {
  const seen = new Set();
  items.forEach((item) => {
    if (item.group) seen.add(item.group);
  });
  return Array.from(seen);
};

// Builds an "all closed" map, with at most one group set to true — used
// both for the initial state and every time we want to open exactly one
// group (accordion behavior).
const buildAccordionState = (items, openGroupName) => {
  const state = {};
  getGroupKeys(items).forEach((key) => {
    state[key] = key === openGroupName;
  });
  return state;
};

const SideMenu = ({ menuItems, user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // 👇 FIX: previously initialized EVERY group to `true` (all open at
  // once, exactly what showed in your screenshot). Now only the group
  // containing the current page starts open.
  const [openGroups, setOpenGroups] = useState(() => {
    const currentItem = menuItems.find((item) => item.url === location.pathname);
    return buildAccordionState(menuItems, currentItem?.group);
  });

  useEffect(() => {
    const currentItem = menuItems.find((item) => item.url === location.pathname);
    if (currentItem && currentItem.group) {
      // 👇 FIX: was `{ ...prev, [currentItem.group]: true }`, which only
      // ever added groups to the open set and never closed any — that's
      // the other half of why everything stayed open. Now it opens just
      // this one group and closes the rest.
      setOpenGroups(buildAccordionState(menuItems, currentItem.group));
    }
    setActiveMenuItem(location.pathname);
  }, [location.pathname, menuItems]);

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  // 👇 FIX: was `{ ...prev, [groupName]: !prev[groupName] }` — toggled
  // only the clicked group and left every other group's state untouched,
  // so opening a second group never closed the first one. Now: opening a
  // closed group closes every other group; clicking an already-open
  // group just closes it.
  const toggleGroup = (groupName) => {
    setOpenGroups((prev) =>
      prev[groupName] ? buildAccordionState(menuItems, null) : buildAccordionState(menuItems, groupName)
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-navy-900 text-white rounded-xl shadow-premium border border-white/10"
      >
        {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {/* Sidebar Body */}
      <div className={`h-screen bg-navy-950 flex flex-col transition-all duration-300 z-40 font-sans md:sticky md:top-0 relative border-r border-white/[0.06]
        ${isDesktopCollapsed ? 'md:w-20' : 'md:w-72'}
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-72 shadow-premium' : 'fixed md:relative -translate-x-full md:translate-x-0 w-72'}`}
      >
        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 z-50 w-6 h-6 items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-glow-brand transition-all"
        >
          {isDesktopCollapsed ? (
            <ChevronRightIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Brand / logo strip — anchors the top so the dark panel doesn't feel empty */}
        <div className={`flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06] ${isDesktopCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow-brand shrink-0" />
          {!isDesktopCollapsed && (
            <span className="text-base-custom font-bold font-heading text-white tracking-tight whitespace-nowrap">
              {t("Campus Admin")}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
          {Object.entries(groupedMenuItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-1">
              {!isDesktopCollapsed && (
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-glow-brand"></div>
                    <span className="text-nav-group font-semibold text-slate-400 group-hover:text-slate-200 uppercase font-heading whitespace-nowrap transition-colors">
                      {t(groupNames[groupName] || groupName)}
                    </span>
                  </div>
                  {openGroups[groupName] ? (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>
              )}

              <div className={`overflow-hidden transition-all duration-300 ${
                  isDesktopCollapsed || openGroups[groupName] ? 'max-h-[1500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`space-y-0.5 ${isDesktopCollapsed ? 'md:ml-0' : 'ml-2 pl-3 border-l border-white/[0.06]'}`}>
                  {items.map((menuItem, index) => {
                    const isActive = activeMenuItem === menuItem.url;
                    return (
                      <Link
                        key={index}
                        to={menuItem.url}
                        title={isDesktopCollapsed ? t(menuItem.name) : undefined}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${isDesktopCollapsed ? 'md:justify-center' : ''}
                          ${
                          isActive
                            ? 'bg-gradient-to-r from-brand-500/15 to-brand-500/0 text-white'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                        }`}
                        onClick={() => {
                          setActiveMenuItem(menuItem.url);
                          if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                        }}
                      >
                        {isActive && (
                          <span className="absolute left-[-13px] top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-brand-400 shadow-glow-brand" />
                        )}
                        <i className={`${menuItem.icon} text-[15px] w-5 text-center shrink-0 ${isActive ? 'text-brand-400' : ''}`}></i>
                        {!isDesktopCollapsed && (
                          <span className="text-nav-item font-medium leading-tight whitespace-nowrap">{t(menuItem.name)}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-4 bg-navy-900/60 border-t border-white/[0.06] ${isDesktopCollapsed ? 'md:flex md:justify-center' : ''}`}>
          <div className={`flex items-center gap-2 ${isDesktopCollapsed ? '' : 'px-2'}`}>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow shrink-0"></div>
            {!isDesktopCollapsed && (
              <span className="text-nav-caption text-slate-300 font-semibold uppercase whitespace-nowrap">
                {t("System Active")}
              </span>
            )}
          </div>
          {!isDesktopCollapsed && (
            <p className="px-2 mt-1 text-nav-caption text-slate-500 uppercase whitespace-nowrap">
              v2.0.4 • {user?.role}
            </p>
          )}
        </div>
      </div>

      {/* Overlay for mobile view */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default SideMenu;