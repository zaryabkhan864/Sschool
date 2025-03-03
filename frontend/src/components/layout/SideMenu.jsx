import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";



const SideMenu = ({ menuItems }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMenuItemClick = (menuItemUrl) => {
    setActiveMenuItem(menuItemUrl);
    setIsOpen(false); // Close menu after selection on mobile
  };

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.name.split(" ")[0].toLowerCase(); // Extract category from item name
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Single Toggle Button */}
      <button
        className="md:hidden text-white px-4 py-2 mb-2"
        onClick={toggleMenu}
      >
        Menu {isOpen ? "✖" : "☰"}
      </button>

      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-auto md:h-auto`}
      >
        <div className="mt-5 p-4">
          {Object.entries(groupedMenuItems).map(([groupName, items]) => (
            <div key={groupName}>
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between font-bold py-2 px-4 rounded-md transition-colors duration-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <span>{t(groupName.charAt(0).toUpperCase() + groupName.slice(1))}</span>
                {openGroups[groupName] ? (
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                )}
              </button>

              {openGroups[groupName] && (
                <div className="pl-4">
                  {items.map((menuItem, index) => (
                    <Link
                      key={index}
                      to={menuItem.url}
                      className={`block font-bold py-2 px-4 rounded-md transition-colors duration-300 ${activeMenuItem.includes(menuItem.url)
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      onClick={() => handleMenuItemClick(menuItem.url)}
                      aria-current={
                        activeMenuItem.includes(menuItem.url) ? "true" : "false"
                      }
                    >
                      <i className={`${menuItem.icon} fa-fw mr-2`}></i>{" "}
                      {t(menuItem.name)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideMenu;