// client/src/components/sidebar/AppSidebar.jsx

import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GridIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { getRole } from "../utils/auth"; // pull role from sessionStorage

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const role = getRole(); // “MANAGER” or “ENGINEER”

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Mirror exactly the routes you protect in App.jsx
  const navItems =
    role === "MANAGER"
      ? [
          { icon: <GridIcon />, name: "Dashboard", path: "/manager" },
          {
            icon: <UserCircleIcon />,
            name: "Add Engineer",
            path: "/add-engineer",
          },
          { icon: <ListIcon />, name: "Projects", path: "/projects" },
          {
            icon: <TableIcon />,
            name: "Assignments",
            path: "/assignments",
          },
        ]
      : [
          { icon: <GridIcon />, name: "Dashboard", path: "/engineer" },
          {
            icon: <ListIcon />,
            name: "Projects",
            path: "/engineer-projects",
          },
          {
            icon: <TableIcon />,
            name: "Assignments",
            path: "/engineer-assignments",
          },
        ];

  return (
    <aside
      className={`fixed top-0 left-0 mt-16 lg:mt-0 flex flex-col h-screen z-50
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-800
        shadow-xl transition-all duration-300 ease-in-out
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: '0 8px 32px 0 rgba(30,64,175,0.10)' }}
    >
      {/* Logo */}
      <div
        className={`px-5 py-8 flex border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm
          ${!isExpanded && !isHovered ? "justify-center" : "justify-start"}`}
      >
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/images/logo/logo-icon.svg"
            alt="Logo"
            className="w-8 h-8 drop-shadow"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-bold text-blue-700 tracking-wide">ERM</span>
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pt-4">
        <h2
          className={`mb-4 text-xs uppercase tracking-widest text-gray-400 flex items-center font-semibold
            ${!isExpanded && !isHovered ? "justify-center" : ""}`}
        >
          {(isExpanded || isHovered || isMobileOpen) ? (
            "Menu"
          ) : (
            <HorizontaLDots className="size-6" />
          )}
        </h2>

        <ul className="flex flex-col gap-2">
          {navItems.map(({ icon, name, path }) => (
            <li key={path}>
              <Link
                to={path}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl relative transition-all
                  focus:outline-none focus:ring-2 focus:ring-blue-300 w-full
                  ${
                    isActive(path)
                      ? "bg-blue-50 text-blue-700 font-semibold shadow border-l-4 border-blue-600"
                      : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                  }
                  ${!isExpanded && !isHovered ? "justify-center" : "justify-start"} ${isMobileOpen ? "justify-start items-center w-full" : ""}`}
                tabIndex={0}
              >
                <span
                  className={`text-xl transition-colors duration-200
                    ${isActive(path) ? "text-blue-700" : "text-gray-400 group-hover:text-blue-600"}`}
                >
                  {icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="text-base font-medium tracking-wide">
                    {name}
                  </span>
                )}
                {/* Active left accent bar (for accessibility) */}
                {isActive(path) && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r-lg" aria-hidden="true"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 border-t border-gray-100 dark:border-gray-800" />

      {/* Logout */}
      <div className="px-5 mb-6">
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-red-50 text-red-600 text-base font-semibold hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
