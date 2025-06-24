"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  BarChart4,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Bell,
  HelpCircle,
  Search,
  Home,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { usePathname } from "next/navigation";
import NotificationBell from "./notification-bell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isAdmin = session?.user?.role === "admin";

  const navItems = [
    {
      name: "หน้าหลัก",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      roles: ["admin", "viewer"],
    },
    {
      name: "คำร้องเรียน",
      href: "/dashboard/complaints",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "viewer"],
    },
    {
      name: "รายงานสถิติ",
      href: "/dashboard/statistics",
      icon: <BarChart4 className="h-5 w-5" />,
      roles: ["admin", "viewer"],
    },
    {
      name: "ตั้งค่าระบบ",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
  ];
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed inset-0 z-[90] flex">
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
              onClick={toggleSidebar}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl transition-transform duration-300">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleSidebar}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 mb-4 border-b pb-4">
                  <h1 className="text-xl font-bold text-blue-600">
                    Complaint Hub
                  </h1>
                </div>
                <nav className="mt-5 px-3 space-y-2">
                  {navItems
                    .filter((item) =>
                      item.roles.includes(session?.user?.role || "")
                    )
                    .map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200",
                          item.href === pathname
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {session?.user?.role === "admin"
                        ? "Administrator"
                        : "Viewer"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>{" "}
      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200 shadow-sm">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center flex-shrink-0 px-6 mb-6">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                  <FileText className="h-7 w-7" />
                  <span>Complaint Hub</span>
                </h1>
              </div>
              <nav className="mt-2 flex-1 px-3 space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  เมนูหลัก
                </div>
                {navItems
                  .filter((item) =>
                    item.roles.includes(session?.user?.role || "")
                  )
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                        item.href === pathname
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <div
                        className={cn(
                          "mr-3",
                          item.href === pathname
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-gray-700"
                        )}
                      >
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  ))}

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-6">
                  ช่วยเหลือ
                </div>
                <Link
                  href="#"
                  className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 group"
                >
                  <HelpCircle className="h-5 w-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                  <span>ศูนย์ช่วยเหลือ</span>
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      {session?.user?.name || "ผู้ใช้งาน"}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {session?.user?.role === "admin"
                        ? "ผู้ดูแลระบบ"
                        : "สิทธิ์ดูอย่างเดียว"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>{" "}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-[50] flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            className="lg:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            {/* ด้านซ้าย - ชื่อเมนู (เฉพาะโหมด mobile) */}
            <div className="block lg:hidden">
              <h1 className="text-lg font-semibold text-gray-800">
                {navItems.find((item) => item.href === pathname)?.name ||
                  "Complaint Hub"}
              </h1>
            </div>

            {/* ด้านขวา - แสดงสถานะและการแจ้งเตือน */}
            <div className="flex items-center space-x-4 ml-auto">
              {!isAdmin && (
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
                  โหมดดูอย่างเดียว
                </div>
              )}

              <div className="relative z-[100]">
                <NotificationBell />
              </div>

              <div className="ml-4 flex items-center lg:hidden">
                <button
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <span className="sr-only">ออกจากระบบ</span>
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-5 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
