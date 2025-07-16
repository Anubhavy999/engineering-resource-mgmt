import { useState, useEffect } from "react";
import api from "../../services/api";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { FaCheckCircle, FaTasks, FaBell } from 'react-icons/fa';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleNotificationClick = async (id) => {
    try {
      await api.post("/notifications/mark-read", { id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {}
  };

  const handleClearAll = async () => {
    try {
      await api.delete("/notifications/clear-read");
      fetchNotifications(); // Refetch to update the list
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        )}
        <FaBell className="w-5 h-5" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-100 bg-blue-50"
            title="Clear all read notifications"
          >
            Clear All
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <li className="text-center text-gray-400 py-8">Loading...</li>
          ) : notifications.length === 0 ? (
            <li className="text-center text-gray-400 py-8">No notifications</li>
          ) : (
            <>
              {/* Unread Notifications */}
              {notifications.filter(n => !n.read).length > 0 && (
                <li className="px-2 py-1 text-xs text-blue-700 font-semibold uppercase tracking-wide bg-blue-50 rounded mb-1">Unread</li>
              )}
              {notifications.filter(n => !n.read).map((n) => (
                <li key={n.id}>
            <DropdownItem
                    onItemClick={() => handleNotificationClick(n.id)}
                    className="flex gap-3 rounded-lg p-3 px-4.5 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 border border-blue-100 dark:border-blue-900 shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-2">
                      <FaTasks className="w-4 h-4" />
              </span>
              <span className="block">
                      <span className="mb-1.5 block text-theme-sm text-gray-800 dark:text-gray-100 font-medium">
                        {n.message}
                  </span>
                      <span className="flex items-center gap-2 text-gray-500 text-xs dark:text-gray-400">
                        <span>{n.type.replace('_', ' ')}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                </span>
              </span>
            </DropdownItem>
          </li>
              ))}
              {/* Read Notifications */}
              {notifications.filter(n => n.read).length > 0 && (
                <li className="px-2 py-1 text-xs text-gray-500 font-semibold uppercase tracking-wide mt-2">Read</li>
              )}
              {notifications.filter(n => n.read).map((n) => (
                <li key={n.id}>
            <DropdownItem
                    onItemClick={() => handleNotificationClick(n.id)}
                    className="flex gap-3 rounded-lg p-3 px-4.5 py-3 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-100 dark:border-gray-800 cursor-pointer"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 mr-2">
                      <FaCheckCircle className="w-4 h-4" />
              </span>
              <span className="block">
                      <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-200">
                        {n.message}
                  </span>
                      <span className="flex items-center gap-2 text-gray-400 text-xs dark:text-gray-500">
                        <span>{n.type.replace('_', ' ')}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                </span>
              </span>
            </DropdownItem>
          </li>
              ))}
            </>
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
