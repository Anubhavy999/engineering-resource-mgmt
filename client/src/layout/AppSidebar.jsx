import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GridIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const navItems = role === "MANAGER"
    ? [
        { icon: <GridIcon />, name: "Dashboard", path: "/manager" },
        { icon: <UserCircleIcon />, name: "Add Engineer", path: "/add-engineer" },
        { icon: <ListIcon />, name: "Projects", path: "/projects" },
        { icon: <TableIcon />, name: "Assignments", path: "/assignments" },
      ]
    : [
        { icon: <GridIcon />, name: "Dashboard", path: "/engineer" },
        { icon: <ListIcon />, name: "Projects", path: "/projects" },
        { icon: <TableIcon />, name: "Assignments", path: "/assignments" },
      ];

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav) => (
        <li key={nav.name}>
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
          >
            <span className={`menu-item-icon-size ${
              isActive(nav.path)
                ? "menu-item-icon-active"
                : "menu-item-icon-inactive"
            }`}>
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO HEADER */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/images/logo/logo-icon.svg"
            alt="Logo"
            className="w-8 h-8"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-bold text-blue-700">ERM</span>
          )}
        </Link>
      </div>

      {/* MENU SECTION */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div>
            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Menu"
              ) : (
                <HorizontaLDots className="size-6" />
              )}
            </h2>
            {renderMenuItems()}
          </div>
        </nav>
      </div>

      {/* LOGOUT FOOTER */}
      <div className="mb-6">
        <button
          onClick={logout}
          className="text-red-600 text-sm hover:underline ml-2"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
