// src/layout/AppLayout.jsx

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { getRole, onRoleChange } from "@/utils/auth";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  // local state to trigger re-render on role-change
  const [role, setRole] = useState(getRole());

  useEffect(() => {
    // subscribe to role changes
    const unsubscribe = onRoleChange((newRole) => {
      setRole(newRole);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar + backdrop */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      {/* Main content shifts based on sidebar */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default AppLayout;
