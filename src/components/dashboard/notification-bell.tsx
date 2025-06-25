"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Clock, CheckCircle2, X, AlertCircle, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Notification {
  id: string;
  complaintId?: string; // Optional complaintId for when notifications reference complaints
  subject: string;
  trackingNumber: string;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  isRead: boolean;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize SSE connection
  useEffect(() => {
    // Clean up any localStorage if it exists from previous versions
    try {
      localStorage.removeItem("readNotifications");
      localStorage.removeItem("deletedNotifications");
    } catch (error) {
      console.error("Error removing localStorage items:", error);
    }
    
    // Establish SSE connection
    connectSSE();
    
    return () => {
      // Clean up SSE connection when component unmounts
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Connect to SSE endpoint
  const connectSSE = () => {
    setConnectionStatus('connecting');
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const eventSource = new EventSource('/api/notifications/sse');
    eventSourceRef.current = eventSource;
    
    // Connection opened
    eventSource.onopen = () => {
      setConnectionStatus('connected');
      console.log('SSE connection established');
    };
    
    // Handle connection error
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setConnectionStatus('disconnected');
      
      // Try to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          connectSSE();
        }
      }, 5000);
    };
    
    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection':
            setConnectionStatus('connected');
            setIsLoading(false);
            break;
            
          case 'initial':
          case 'update':
            const newNotifications = data.notifications || [];
            const newTotalCount = data.total || 0;
            
            // Update state with new data
            setNotifications(newNotifications);
            setTotalCount(newTotalCount);
            setIsLoading(false);
            
            prevCountRef.current = newTotalCount;
            break;
            
          case 'heartbeat':
            // Just a keepalive, no action needed
            break;
            
          case 'error':
            console.error('SSE server error:', data.message);
            break;
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };
  };

  // Auto-open dropdown when new notifications arrive
  useEffect(() => {
    // Only open if count has increased and we're not already showing the dropdown
    if (totalCount > prevCountRef.current && !isOpen) {
      setIsOpen(true);

      // Add a subtle animation to the bell
      const bellButton = document.querySelector(".notification-bell");
      if (bellButton) {
        bellButton.classList.add("animate-ring");
        setTimeout(() => {
          bellButton.classList.remove("animate-ring");
        }, 2000);
      }
    }
    prevCountRef.current = totalCount;
  }, [totalCount, isOpen]);

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const markAsRead = async () => {
    try {
      // Update UI first for instant feedback
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      // Update count
      setTotalCount(0);

      // Update on server
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      // Close dropdown
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  
  const deleteNotification = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      // Find if the notification was unread before removing
      const targetNotification = notifications.find((n) => n.id === id);
      const wasUnread = targetNotification ? !targetNotification.isRead : false;

      // Remove from UI immediately for responsive feel
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );

      // Update count if it was unread
      if (wasUnread) {
        setTotalCount((prevCount) => Math.max(0, prevCount - 1));
      }

      // Call API to delete notification on server
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
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
  };  // The bell ring animation is defined in globals.css

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 notification-bell ${
          totalCount > 0 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={toggleDropdown}
        aria-label="การแจ้งเตือน"
      >
        <Bell className={`h-5 w-5 ${totalCount > 0 && !isOpen ? 'animate-bounce' : ''}`} />
        {totalCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-gray-200 overflow-hidden">
          <div className="py-1">
            {/* Dropdown Header */}
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    การแจ้งเตือน
                  </h3>
                  
                  {/* Connection Status Indicator */}
                  <span className={`inline-flex h-2 w-2 rounded-full ${
                    connectionStatus === 'connected' 
                      ? 'bg-green-500' 
                      : connectionStatus === 'connecting'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}></span>
                </div>
                
                {totalCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {totalCount} รายการ
                  </span>
                )}
              </div>
            </div>
            
            {/* Loading State */}
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
                {/* Notification Items */}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 relative ${
                      !notification.isRead
                        ? "bg-blue-50 notification-highlight"
                        : ""
                    }`}
                  >
                    <Link
                      href={`/dashboard/complaints/${
                        notification.complaintId || notification.id
                      }`}
                      className="block"
                      onClick={() => {
                        // Mark this notification as read on the server
                        fetch("/api/notifications", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "markAsRead",
                            id: notification.id,
                          }),
                        });

                        // Close dropdown
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start pr-6">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate mb-1 ${
                              !notification.isRead
                                ? "text-blue-600 font-semibold"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.subject}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2">
                              #{notification.trackingNumber}
                            </span>
                            <span className="mr-2">•</span>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(notification.createdAt)}</span>
                            </div>
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
                    
                    {/* Delete Button */}
                    <button
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={(e) => deleteNotification(notification.id, e)}
                      aria-label="ลบการแจ้งเตือน"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {/* Footer Actions */}
                <div className="bg-gray-50 px-4 py-3 flex justify-between">
                  <Link
                    href="/dashboard/complaints"
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setIsOpen(false)}
                  >
                    ดูทั้งหมด
                  </Link>

                  <div className="flex gap-3">
                    <button
                      onClick={markAsRead}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      อ่านทั้งหมดแล้ว
                    </button>
                      {/* Browser Notification Permission Button - Removed */}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
  );
}
