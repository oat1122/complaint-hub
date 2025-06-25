"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface ComplaintsListProps {
  initialComplaints?: any;
}

export default function ComplaintsList({
  initialComplaints,
}: ComplaintsListProps) {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState(
    initialComplaints?.complaints || []
  );
  const [pagination, setPagination] = useState(
    initialComplaints?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }
  );
  const [isLoading, setIsLoading] = useState(!initialComplaints);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (!initialComplaints) {
      fetchComplaints();
    }
  }, [initialComplaints]);

  const fetchComplaints = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/complaints?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลคำร้องเรียนได้");
      }

      const data = await response.json();
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลคำร้องเรียน");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchComplaints(page);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchComplaints(1);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      priority: "",
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    fetchComplaints(1);
  };

  // Date quick selection presets
  const setDateToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setFilters((prev) => ({
      ...prev,
      dateFrom: today,
      dateTo: today,
    }));
    setTimeout(() => fetchComplaints(1), 0); // Apply filters immediately
  };

  const setDateYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    setFilters((prev) => ({
      ...prev,
      dateFrom: yesterdayStr,
      dateTo: yesterdayStr,
    }));
    setTimeout(() => fetchComplaints(1), 0); // Apply filters immediately
  };

  const setDateThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() || today.getDate() - 6); // Adjust for week starting on Monday

    setFilters((prev) => ({
      ...prev,
      dateFrom: startOfWeek.toISOString().split("T")[0],
      dateTo: today.toISOString().split("T")[0],
    }));
    setTimeout(() => fetchComplaints(1), 0); // Apply filters immediately
  };

  const setDateThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setFilters((prev) => ({
      ...prev,
      dateFrom: startOfMonth.toISOString().split("T")[0],
      dateTo: today.toISOString().split("T")[0],
    }));
    setTimeout(() => fetchComplaints(1), 0); // Apply filters immediately
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!isAdmin) return;

    if (
      !window.confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการลบคำร้องเรียนนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/complaint/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถลบคำร้องเรียนได้");
      }

      // Refresh the list
      fetchComplaints(pagination.page);
    } catch (error: any) {
      alert(`ข้อผิดพลาด: ${error.message || "ไม่สามารถลบคำร้องเรียนได้"}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      technical: "ปัญหาทางเทคนิค",
      environment: "สิ่งแวดล้อม",
      hr: "ทรัพยากรบุคคล",
      equipment: "อุปกรณ์",
      safety: "ความปลอดภัยและความมั่นคง",
      financial: "การเงิน",
      others: "อื่นๆ",
    };
    return categories[category] || category;
  };

  const getPriorityBadgeClass = (priority: string) => {
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

  const getPriorityLabel = (priority: string) => {
    const priorities: Record<string, string> = {
      low: "ต่ำ",
      medium: "กลาง",
      high: "สูง",
      urgent: "ด่วน",
    };
    return priorities[priority] || priority;
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      new: "bg-blue-100 text-blue-800",
      received: "bg-indigo-100 text-indigo-800",
      discussing: "bg-purple-100 text-purple-800",
      processing: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };

    const statusLabels: Record<string, string> = {
      new: "ใหม่",
      received: "รับเรื่องแล้ว",
      discussing: "กำลังพิจารณา",
      processing: "กำลังดำเนินการ",
      resolved: "แก้ไขแล้ว",
      archived: "จัดเก็บแล้ว",
    };

    const badgeClass =
      (badgeClasses as any)[status] || "bg-gray-100 text-gray-800";
    const label = statusLabels[status] || status;

    return (
      <span
        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  // Helper function to check if date filters are applied
  const isDateFiltered = () => {
    return Boolean(filters.dateFrom || filters.dateTo);
  };

  if (isLoading && !complaints.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดคำร้องเรียน...</p>
        </div>
      </div>
    );
  }

  if (error && !complaints.length) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">เกิดข้อผิดพลาดในการโหลดคำร้องเรียน</p>
        <p>{error}</p>{" "}
        <Button
          onClick={() => fetchComplaints(pagination.page)}
          variant="secondary"
          className="mt-2"
        >
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
          <div className="flex items-center">
            <div className="bg-primary-50 p-3 rounded-full mr-4 text-primary-600">
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                ตัวกรองคำร้องเรียน
              </h3>
              <p className="text-sm text-gray-500">
                กรองและค้นหาคำร้องเรียนตามเกณฑ์ที่ต้องการ
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-0 bg-primary-50 px-4 py-2 rounded-full text-primary-700 font-medium flex items-center">
            <svg
              className="w-4 h-4 mr-1.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            พบทั้งหมด <span className="font-bold">{pagination.total}</span> รายการ
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          <div className="relative">
            <label
              htmlFor="category"
              className={`block text-sm font-medium mb-1 ${filters.category ? 'text-primary-700' : 'text-gray-700'}`}
            >
              หมวดหมู่
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className={`w-full pl-3 pr-10 py-2.5 rounded-lg border shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20 appearance-none ${filters.category ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'}`}
              >
                <option value="">ทั้งหมด</option>
                <option value="technical">ปัญหาทางเทคนิค</option>
                <option value="environment">สิ่งแวดล้อม</option>
                <option value="hr">ทรัพยากรบุคคล</option>
                <option value="equipment">อุปกรณ์</option>
                <option value="safety">ความปลอดภัยและความมั่นคง</option>
                <option value="financial">การเงิน</option>
                <option value="others">อื่นๆ</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative">
            <label
              htmlFor="priority"
              className={`block text-sm font-medium mb-1 ${filters.priority ? 'text-primary-700' : 'text-gray-700'}`}
            >
              ความสำคัญ
            </label>
            <div className="relative">
              <select
                id="priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className={`w-full pl-3 pr-10 py-2.5 rounded-lg border shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20 appearance-none ${filters.priority ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'}`}
              >
                <option value="">ทั้งหมด</option>
                <option value="low">ต่ำ</option>
                <option value="medium">กลาง</option>
                <option value="high">สูง</option>
                <option value="urgent">ด่วน</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative">
            <label
              htmlFor="status"
              className={`block text-sm font-medium mb-1 ${filters.status ? 'text-primary-700' : 'text-gray-700'}`}
            >
              สถานะ
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={`w-full pl-3 pr-10 py-2.5 rounded-lg border shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20 appearance-none ${filters.status ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'}`}
              >
                <option value="">ทั้งหมด</option>
                <option value="new">ใหม่</option>
                <option value="received">รับเรื่องแล้ว</option>
                <option value="discussing">กำลังพิจารณา</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="resolved">แก้ไขแล้ว</option>
                <option value="archived">จัดเก็บแล้ว</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="search"
              className={`block text-sm font-medium mb-1 ${filters.search ? 'text-primary-700' : 'text-gray-700'}`}
            >
              ค้นหา
            </label>
            <div className="relative">
              
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="ค้นหาเลขติดตาม หรือหัวข้อ..."
                className={`w-full pl-3 pr-3 py-2.5 rounded-lg border shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20 ${filters.search ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              />
            </div>
          </div>{" "}
          <div>
            <label
              htmlFor="dateFrom"
              className={`block text-sm font-medium mb-1 ${filters.dateFrom ? 'text-primary-700' : 'text-gray-700'}`}
            >
              จากวันที่
            </label>
            <div className="relative">
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                placeholder="วว-ดด-ปปปป"
                className={`w-full pl-3 pr-3 py-2.5 rounded-lg border shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20 ${filters.dateFrom ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              />
            </div>
          </div>{" "}
          <div>
            <label
              htmlFor="dateTo"
              className={`block text-sm font-medium mb-1 ${filters.dateTo ? 'text-primary-700' : 'text-gray-700'}`}
            >
              ถึงวันที่
            </label>
            <div className="relative">
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                placeholder="วว-ดด-ปปปป"
                className={`w-full pl-3 pr-3 py-2.5 rounded-lg border shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20 ${filters.dateTo ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              />
            </div>
          </div>{" "}
        </div>
        {/* Date quick selections */}
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-xs text-gray-500 w-full mb-1">เลือกช่วงวันแบบรวดเร็ว:</p>
          <button
            onClick={setDateToday}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center"
          >
            <svg 
              className="w-3 h-3 mr-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 11.5H6M18 7.5H6M18 15.5H6M6 19.5h12"></path>
            </svg>
            วันนี้
          </button>
          <button
            onClick={setDateYesterday}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center"
          >
            <svg 
              className="w-3 h-3 mr-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M13 5H9.5M13 9H6.5M13 13H6.5M13 17H6.5M17 5v12"></path>
            </svg>
            เมื่อวาน
          </button>
          <button
            onClick={setDateThisWeek}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center"
          >
            <svg 
              className="w-3 h-3 mr-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            สัปดาห์นี้
          </button>
          <button
            onClick={setDateThisMonth}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center"
          >
            <svg 
              className="w-3 h-3 mr-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            เดือนนี้
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          <Button
            onClick={applyFilters}
            variant="secondary"
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md flex items-center transition-all font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            ค้นหาคำร้องเรียน
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 shadow-sm flex items-center transition-all font-medium text-gray-700"
            aria-label="ล้างตัวกรองทั้งหมด"
            title="ล้างตัวกรองทั้งหมด"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            ล้างตัวกรอง
          </Button>
         
        </div>
      </div>{" "}
      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
        <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
          <h3 className="font-medium text-gray-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            รายการคำร้องเรียนทั้งหมด
          </h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
            กำลังแสดงผลหน้า {pagination.page} จาก {pagination.pages}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    หมายเลขติดตาม
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <path d="M12 18v-6"></path>
                      <path d="M8 18v-1"></path>
                      <path d="M16 18v-3"></path>
                    </svg>
                    สถานะ
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"></path>
                      <line x1="16" y1="8" x2="2" y2="22"></line>
                      <line x1="17.5" y1="15" x2="9" y2="15"></line>
                    </svg>
                    หัวข้อ
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    หมวดหมู่
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m8 14-6 6h22L8 14z"></path>
                      <path d="M18 14 8 4l-6 6 6 6 10-10 6 6-6 6z"></path>
                    </svg>
                    ความสำคัญ
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        width="18"
                        height="18"
                        x="3"
                        y="4"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    วันที่ส่ง
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    ไฟล์
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    การดำเนินการ
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    {" "}
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-5 rounded-full mb-3">
                        <svg
                          className="w-16 h-16 text-gray-300"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <h3 className="text-gray-600 font-medium text-lg">
                        ไม่พบคำร้องเรียน
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 max-w-sm text-center">
                        ไม่พบคำร้องเรียนที่ตรงกับเงื่อนไขการค้นหา
                        ลองปรับแต่งตัวกรองของคุณหรือล้างตัวกรองเพื่อดูรายการทั้งหมด
                      </p>
                      <Button
                        onClick={resetFilters}
                        variant="outline"
                        className="mt-4 text-sm font-medium px-4 py-2 rounded-lg border border-primary-300 text-primary-700 hover:bg-primary-50 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 16h5v5" />
                        </svg>
                        ล้างตัวกรองทั้งหมด
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint: any) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.trackingNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {complaint.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {getCategoryLabel(complaint.category)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getPriorityBadgeClass(
                          complaint.priority
                        )}`}
                      >
                        {getPriorityLabel(complaint.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {formatDate(complaint.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {complaint.attachments.length > 0 ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-gray-500 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span className="text-sm text-gray-700">
                            {complaint.attachments.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">ไม่มี</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        {" "}
                        <a
                          href={`/dashboard/complaints/${complaint.id}`}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-full transition-colors"
                          title="ดูรายละเอียดคำร้องเรียน"
                          aria-label="ดูรายละเอียดคำร้องเรียน"
                        >
                          <svg
                            className="w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </a>                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition-all"
                            title="ลบคำร้องเรียน"
                            aria-label="ลบคำร้องเรียน"
                          >
                            <svg
                              className="w-5 h-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดงผล{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  จาก <span className="font-medium">{pagination.total}</span>{" "}
                  รายการ
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, pagination.page - 1))
                    }
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    ก่อนหน้า
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      // Show first page, last page, current page and pages around current page
                      return (
                        pageNum === 1 ||
                        pageNum === pagination.pages ||
                        Math.abs(pageNum - pagination.page) <= 1
                      );
                    })
                    .map((pageNum, i, filteredPages) => {
                      // Add ellipsis where pages are skipped
                      const showEllipsisBefore =
                        i > 0 && filteredPages[i - 1] !== pageNum - 1;
                      const showEllipsisAfter =
                        i < filteredPages.length - 1 &&
                        filteredPages[i + 1] !== pageNum + 1;

                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                          {showEllipsisAfter && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                        </div>
                      );
                    })}
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.pages, pagination.page + 1)
                      )
                    }
                    disabled={pagination.page >= pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    ถัดไป
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
