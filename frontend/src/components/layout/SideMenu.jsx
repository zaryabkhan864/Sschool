import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SideMenu = ({ menuItems }) => {
  const location = useLocation();

  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);

  const handleMenuItemClick = (menuItemUrl) => {
    setActiveMenuItem(menuItemUrl);
  };

  return (
    <div className="mt-5 pl-4">
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
  );
};

export default SideMenu;
