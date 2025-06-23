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
      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">ตัวกรองคำร้องเรียน</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              หมวดหมู่
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
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
          </div>
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ความสำคัญ
            </label>
            <select
              id="priority"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
            >
              <option value="">ทั้งหมด</option>
              <option value="low">ต่ำ</option>
              <option value="medium">กลาง</option>
              <option value="high">สูง</option>
              <option value="urgent">ด่วน</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              สถานะ
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
            >
              <option value="">ทั้งหมด</option>
              <option value="new">ใหม่</option>
              <option value="archived">จัดเก็บแล้ว</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ค้นหา
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="ค้นหาเลขติดตาม หรือหัวข้อ..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
            />
          </div>
          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              จากวันที่
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
            />
          </div>
          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ถึงวันที่
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          {" "}
          <Button
            onClick={applyFilters}
            variant="secondary"
            className="px-4 py-2"
          >
            กรองข้อมูล
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="px-4 py-2"
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หมายเลขติดตาม
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หัวข้อ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หมวดหมู่
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ความสำคัญ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  วันที่ส่ง
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ไฟล์
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    ไม่พบคำร้องเรียน ลองปรับแต่งตัวกรองของคุณ
                  </td>
                </tr>
              ) : (
                complaints.map((complaint: any) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.trackingNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {complaint.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryLabel(complaint.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority.charAt(0).toUpperCase() +
                          complaint.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.attachments.length > 0
                        ? `${complaint.attachments.length} ไฟล์`
                        : "ไม่มี"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`/dashboard/complaints/${complaint.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        ดู
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComplaint(complaint.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ลบ
                        </button>
                      )}
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
