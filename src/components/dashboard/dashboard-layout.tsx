"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import NotificationBell from "./notification-bell";

// React Icons
import {
  HiHome,
  HiDocumentText,
  HiChartBar,
  HiCog,
  HiLogout,
  HiUser,
  HiMenu,
  HiX,
  HiEye,
  HiQuestionMarkCircle,
} from "react-icons/hi";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const isAdmin = session?.user?.role === "admin";

  const navItems = [
    {
      name: "หน้าหลัก",
      href: "/dashboard",
      icon: HiHome,
      roles: ["admin", "viewer"],
    },
    {
      name: "คำร้องเรียน",
      href: "/dashboard/complaints",
      icon: HiDocumentText,
      roles: ["admin", "viewer"],
    },
    {
      name: "รายงานสถิติ",
      href: "/dashboard/statistics",
      icon: HiChartBar,
      roles: ["admin", "viewer"],
    },
    {
      name: "ตั้งค่าระบบ",
      href: "/dashboard/settings",
      icon: HiCog,
      roles: ["admin"],
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById("mobile-sidebar");
        const menuButton = document.getElementById("mobile-menu-button");
        
        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          id="mobile-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HiDocumentText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Complaint Hub</h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4">
                เมนูหลัก
              </div>
              {navItems
                .filter((item) => item.roles.includes(session?.user?.role || ""))
                .map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-200",
                        item.href === pathname
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <IconComponent className="w-6 h-6 mr-3" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4 mt-8">
                ช่วยเหลือ
              </div>
              <Link
                href="#"
                className="flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <HiQuestionMarkCircle className="w-6 h-6 mr-3" />
                <span>ศูนย์ช่วยเหลือ</span>
              </Link>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || "ผู้ใช้งาน"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.role === "admin" ? "ผู้ดูแลระบบ" : "สิทธิ์ดูอย่างเดียว"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="ออกจากระบบ"
                >
                  <HiLogout className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center justify-center h-16 px-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HiDocumentText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Complaint Hub</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4">
              เมนูหลัก
            </div>
            {navItems
              .filter((item) => item.roles.includes(session?.user?.role || ""))
              .map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      item.href === pathname
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4 mt-8">
              ช่วยเหลือ
            </div>
            <Link
              href="#"
              className="flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <HiQuestionMarkCircle className="w-5 h-5 mr-3" />
              <span>ศูนย์ช่วยเหลือ</span>
            </Link>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HiUser className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || "ผู้ใช้งาน"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.role === "admin" ? "ผู้ดูแลระบบ" : "สิทธิ์ดูอย่างเดียว"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="ออกจากระบบ"
              >
                <HiLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm border-b lg:px-6">
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
          >
            <HiMenu className="w-6 h-6" />
          </button>

          {/* Mobile Page Title */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4 ml-auto">
            {!isAdmin && (
              <div className="hidden sm:flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <HiEye className="w-4 h-4 mr-1" />
                โหมดดูอย่างเดียว
              </div>
            )}

            {/* Mobile User Menu */}
            <div className="lg:hidden">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiLogout className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Bell - Desktop/Tablet */}
            <div className="relative">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
