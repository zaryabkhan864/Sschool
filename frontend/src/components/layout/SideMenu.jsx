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
        className="md:hidden bg-teal-800 text-white px-4 py-2 mb-2"
        onClick={toggleMenu}
      >
        Menu {isOpen ? "✖" : "☰"}
      </button>

      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-auto md:h-auto`}
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <div className="mt-5 p-4 modern-scrollbar">
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
      <style>
        {`
          /* Modern Scrollbar Styling */
          .modern-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #6b7280 transparent; /* Thumb and transparent track */
          }

          .modern-scrollbar::-webkit-scrollbar {
            width: 12px; /* Wider scrollbar for a modern look */
            height: 12px; /* Optional for horizontal scroll */
          }

          .modern-scrollbar::-webkit-scrollbar-track {
            background: transparent; /* Transparent track for a sleek look */
          }

          .modern-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #4b5563, #9ca3af); /* Gradient thumb */
            border-radius: 10px;
            border: 2px solid transparent; /* Adds spacing effect */
            background-clip: content-box; /* Adds inner padding */
          }

          .modern-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #374151, #6b7280); /* Darker gradient on hover */
          }

          .modern-scrollbar::-webkit-scrollbar-thumb:active {
            background: #1f2937; /* Darker color when active */
          }
        `}
      </style>
    </>
  );
};

export default SideMenu;
