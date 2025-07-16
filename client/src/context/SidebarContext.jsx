// client/src/context/SidebarContext.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import { getRole, onRoleChange } from "../utils/auth";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // sidebar UI state
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // role state
  const [role, setRole] = useState(getRole());

  // wire up cross‑tab & in‑tab role changes
  useEffect(() => {
    const unsub = onRoleChange((newRole) => {
      setRole(newRole);
    });
    return unsub;
  }, []);

  // responsive logic
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsExpanded((p) => !p);
  const toggleMobileSidebar = () => setIsMobileOpen((p) => !p);
  const toggleSubmenu = (item) =>
    setOpenSubmenu((p) => (p === item ? null : item));

  return (
    <SidebarContext.Provider
      value={{
        // sidebar UI
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        // role
        role,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
