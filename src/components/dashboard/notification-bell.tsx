"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Notification {
  id: string;
  subject: string;
  trackingNumber: string;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on component mount and every minute
  useEffect(() => {
    fetchNotifications();

    // Setup polling every minute for new notifications
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/notifications");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      setNotifications(data.notifications || []);
      setTotalCount(data.total || 0);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setError(error.message || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead" }),
      });

      // Refresh notifications after marking as read
      fetchNotifications();
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM HH:mm", { locale: th });
  };

  const getPriorityText = (priority: string) => {
    const priorities: Record<string, string> = {
      low: "ต่ำ",
      medium: "ปานกลาง",
      high: "สูง",
      urgent: "ฉุกเฉิน",
    };
    return priorities[priority] || priority;
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={toggleDropdown}
        aria-label="การแจ้งเตือน"
      >
        <Bell className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>{" "}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-gray-200 overflow-hidden">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">
                  การแจ้งเตือน
                </h3>
                {totalCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {totalCount} รายการ
                  </span>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                <div className="inline-block h-4 w-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mr-1"></div>
                กำลังโหลด...
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-center text-sm text-red-500">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                ไม่มีการแจ้งเตือนใหม่
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={`/dashboard/complaints/${notification.id}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                          {notification.subject}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-2">
                            #{notification.trackingNumber}
                          </span>
                          <span className="mr-2">•</span>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ml-2 whitespace-nowrap ${getPriorityClass(
                          notification.priority
                        )}`}
                      >
                        {getPriorityText(notification.priority)}
                      </span>
                    </div>
                  </Link>
                ))}

                <div className="bg-gray-50 px-4 py-3 flex justify-between">
                  <Link
                    href="/dashboard/complaints"
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setIsOpen(false)}
                  >
                    ดูทั้งหมด
                  </Link>

                  <button
                    onClick={markAsRead}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ทำเครื่องหมายว่าอ่านแล้ว
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
