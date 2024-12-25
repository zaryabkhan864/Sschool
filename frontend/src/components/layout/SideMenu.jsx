import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SideMenu = ({ menuItems }) => {
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMenuItemClick = (menuItemUrl) => {
    setActiveMenuItem(menuItemUrl);
    setIsOpen(false); // Close menu after selection on mobile
  };

  return (
    <>
      {/* Single Toggle Button */}
      <button
        className="md:hidden bg-teal-800 text-white px-4 py-2 mb-2 "
        onClick={toggleMenu}
      >
        Menu {isOpen ? "✖" : "☰"}
      </button>

      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-auto md:h-auto`}
      >
        <div className="mt-5 p-4">
          {menuItems?.map((menuItem, index) => (
            <Link
              key={index}
              to={menuItem.url}
              className={`block font-bold py-2 px-4 rounded-md transition-colors duration-300 ${activeMenuItem.includes(menuItem.url)
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              onClick={() => handleMenuItemClick(menuItem.url)}
              aria-current={
                activeMenuItem.includes(menuItem.url) ? "true" : "false"
              }
            >
              <i className={`${menuItem.icon} fa-fw mr-2`}></i> {menuItem.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideMenu;
