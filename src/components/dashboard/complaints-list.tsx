"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

// React Icons
import {
  HiFilter,
  HiSearch,
  HiRefresh,
  HiEye,
  HiTrash,
  HiCalendar,
  HiClock,
  HiFolder,
  HiFlag,
  HiChevronLeft,
  HiChevronRight,
  HiDotsVertical,
  HiDocumentText,
  HiPaperClip,
} from "react-icons/hi";

interface ComplaintsListProps {
  initialComplaints?: any;
}

export default function ComplaintsList({ initialComplaints }: ComplaintsListProps) {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState(initialComplaints?.complaints || []);
  const [pagination, setPagination] = useState(
    initialComplaints?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }
  );
  const [isLoading, setIsLoading] = useState(!initialComplaints);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards'); // Default to cards for mobile
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const isAdmin = session?.user?.role === "admin";

  // Detect screen size and adjust view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setViewMode('list');
      } else {
        setViewMode('cards');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchComplaints(1);
    setShowFilters(false);
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
      safety: "ความปลอดภัย",
      financial: "การเงิน",
      others: "อื่นๆ",
    };
    return categories[category] || category;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { class: "bg-blue-100 text-blue-800", label: "ต่ำ" },
      medium: { class: "bg-yellow-100 text-yellow-800", label: "กลาง" },
      high: { class: "bg-orange-100 text-orange-800", label: "สูง" },
      urgent: { class: "bg-red-100 text-red-800", label: "ด่วน" },
    };
    const { class: className, label } = config[priority as keyof typeof config] || config.medium;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        <HiFlag className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      new: { class: "bg-blue-100 text-blue-800", label: "ใหม่" },
      received: { class: "bg-indigo-100 text-indigo-800", label: "รับเรื่องแล้ว" },
      discussing: { class: "bg-purple-100 text-purple-800", label: "กำลังพิจารณา" },
      processing: { class: "bg-yellow-100 text-yellow-800", label: "กำลังดำเนินการ" },
      resolved: { class: "bg-green-100 text-green-800", label: "แก้ไขแล้ว" },
      archived: { class: "bg-gray-100 text-gray-800", label: "จัดเก็บแล้ว" },
    };
    const { class: className, label } = config[status as keyof typeof config] || config.new;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!isAdmin) return;

    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำร้องเรียนนี้?")) {
      return;
    }

    try {
      const response = await fetch(`/api/complaint/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถลบคำร้องเรียนได้");
      }

      fetchComplaints(pagination.page);
    } catch (error: any) {
      alert(`ข้อผิดพลาด: ${error.message}`);
    }
  };

  if (isLoading && !complaints.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดคำร้องเรียน...</p>
        </div>
      </div>
    );
  }

  if (error && !complaints.length) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">เกิดข้อผิดพลาดในการโหลดคำร้องเรียน</p>
        <p>{error}</p>
        <Button onClick={() => fetchComplaints(pagination.page)} className="mt-2">
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <HiFilter className="w-4 h-4 mr-2" />
            ตัวกรอง
          </button>
          
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <HiDocumentText className="w-4 h-4 mr-1" />
            {pagination.total} รายการ
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="lg:hidden flex border rounded-lg p-1 bg-gray-100">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
              }`}
            >
              การ์ด
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
              }`}
            >
              รายการ
            </button>
          </div>

          <button
            onClick={() => fetchComplaints(pagination.page)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="รีเฟรช"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="ค้นหาหมายเลขติดตาม หรือหัวข้อ..."
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="technical">ปัญหาทางเทคนิค</option>
                <option value="environment">สิ่งแวดล้อม</option>
                <option value="hr">ทรัพยากรบุคคล</option>
                <option value="equipment">อุปกรณ์</option>
                <option value="safety">ความปลอดภัย</option>
                <option value="financial">การเงิน</option>
                <option value="others">อื่นๆ</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="low">ต่ำ</option>
                <option value="medium">กลาง</option>
                <option value="high">สูง</option>
                <option value="urgent">ด่วน</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="new">ใหม่</option>
                <option value="received">รับเรื่องแล้ว</option>
                <option value="discussing">กำลังพิจารณา</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="resolved">แก้ไขแล้ว</option>
                <option value="archived">จัดเก็บแล้ว</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จากวันที่</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={applyFilters} className="flex-1 sm:flex-none">
              <HiSearch className="w-4 h-4 mr-2" />
              ค้นหา
            </Button>
            <Button variant="outline" onClick={resetFilters} className="flex-1 sm:flex-none">
              <HiRefresh className="w-4 h-4 mr-2" />
              ล้างตัวกรอง
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {complaints.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <HiDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบคำร้องเรียน</h3>
          <p className="text-gray-500 mb-4">ไม่พบคำร้องเรียนที่ตรงกับเงื่อนไขการค้นหา</p>
          <Button variant="outline" onClick={resetFilters}>
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      ) : (
        <>
          {/* Cards View (Mobile) */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((complaint: any) => (
                <div key={complaint.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{complaint.subject}</h3>
                      <p className="text-sm text-gray-500 mt-1">{complaint.trackingNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <a
                        href={`/dashboard/complaints/${complaint.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <HiEye className="w-4 h-4" />
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComplaint(complaint.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(complaint.status)}
                    {getPriorityBadge(complaint.priority)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <HiFolder className="w-4 h-4 mr-1" />
                      {getCategoryLabel(complaint.category)}
                    </div>
                    <div className="flex items-center">
                      <HiClock className="w-4 h-4 mr-1" />
                      {formatDate(complaint.createdAt)}
                    </div>
                  </div>

                  {complaint.attachments?.length > 0 && (
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <HiPaperClip className="w-4 h-4 mr-1" />
                      {complaint.attachments.length} ไฟล์แนบ
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Table View (Desktop) */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        คำร้องเรียน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หมวดหมู่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ความสำคัญ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complaints.map((complaint: any) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{complaint.subject}</div>
                            <div className="text-sm text-gray-500">{complaint.trackingNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getCategoryLabel(complaint.category)}
                        </td>
                        <td className="px-6 py-4">
                          {getPriorityBadge(complaint.priority)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(complaint.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(complaint.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <a
                              href={`/dashboard/complaints/${complaint.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ดูรายละเอียด"
                            >
                              <HiEye className="w-4 h-4" />
                            </a>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteComplaint(complaint.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="ลบ"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 rounded-lg border">
          <div className="mb-3 sm:mb-0">
            <p className="text-sm text-gray-700">
              แสดง {(pagination.page - 1) * pagination.limit + 1} ถึง{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} จาก{" "}
              {pagination.total} รายการ
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNumber;
                if (pagination.pages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.page <= 3) {
                  pageNumber = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNumber = pagination.pages - 4 + i;
                } else {
                  pageNumber = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      pagination.page === pageNumber
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
