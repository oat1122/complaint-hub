import { Metadata } from "next";
import ComplaintsList from "@/components/dashboard/complaints-list";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export const metadata: Metadata = {
  title: "คำร้องเรียนทั้งหมด | Complaint Hub",
  description: "จัดการคำร้องเรียนทั้งหมดที่ส่งเข้ามาในระบบ",
};

export default async function ComplaintsPage() {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  
  // Get system settings for items per page
  let settings = await prisma.settings.findUnique({
    where: { id: "singleton" }
  });
  
  // Default to 10 items per page if no settings found
  const itemsPerPage = settings?.itemsPerPage || 10;

  // Get initial complaints (first page)
  const complaints = await prisma.complaint.findMany({
    take: itemsPerPage,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      attachments: {
        select: {
          id: true,
          originalName: true,
          fileSize: true,
          mimeType: true,
          filePath: true,
        },
      },
    },
  });

  // Get total count for pagination
  const totalCount = await prisma.complaint.count();
  // Get count by status for summary
  const statusCounts = {
    new: await prisma.complaint.count({ where: { status: "new" } }),
    received: await prisma.complaint.count({ where: { status: "received" } }),
    discussing: await prisma.complaint.count({ where: { status: "discussing" } }),
    processing: await prisma.complaint.count({ where: { status: "processing" } }),
    resolved: await prisma.complaint.count({ where: { status: "resolved" } }),
    archived: await prisma.complaint.count({ where: { status: "archived" } }),
  };
  // Prepare initial data
  const initialComplaints = {
    complaints,
    pagination: {
      total: totalCount,
      page: 1,
      limit: itemsPerPage,
      pages: Math.ceil(totalCount / itemsPerPage),
    },
    summary: statusCounts
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการคำร้องเรียน</h1>
          <p className="text-gray-600 mt-1">
            ดูและจัดการคำร้องเรียนทั้งหมดในระบบ
          </p>
        </div>
        {role === "viewer" && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium flex items-center">
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            โหมดดูอย่างเดียว
          </div>
        )}
      </div>      {/* Status Summary Cards */}      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 rounded-full p-2">
              <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
            <span className="bg-white py-0.5 px-2 rounded-full text-xs text-blue-700 font-medium">ใหม่</span>
          </div>
          <h3 className="text-xs uppercase text-blue-700 font-semibold mt-2">คำร้องเรียนใหม่</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{statusCounts.new}</p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-indigo-100 rounded-full p-2">
              <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <span className="bg-white py-0.5 px-2 rounded-full text-xs text-indigo-700 font-medium">รับแล้ว</span>
          </div>
          <h3 className="text-xs uppercase text-indigo-700 font-semibold mt-2">รับเรื่องแล้ว</h3>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{statusCounts.received}</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-purple-100 rounded-full p-2">
              <svg className="w-5 h-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="bg-white py-0.5 px-2 rounded-full text-xs text-purple-700 font-medium">พิจารณา</span>
          </div>
          <h3 className="text-xs uppercase text-purple-700 font-semibold mt-2">กำลังพิจารณา</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.discussing}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-yellow-100 rounded-full p-2">
              <svg className="w-5 h-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="6" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <span className="bg-white py-0.5 px-2 rounded-full text-xs text-yellow-700 font-medium">ดำเนินการ</span>
          </div>
          <h3 className="text-xs uppercase text-yellow-700 font-semibold mt-2">กำลังดำเนินการ</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.processing}</p>
        </div>
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-green-100 rounded-full p-2">
              <svg className="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span className="bg-white py-0.5 px-2 rounded-full text-xs text-green-700 font-medium">แก้ไขแล้ว</span>
          </div>
          <h3 className="text-xs uppercase text-green-700 font-semibold mt-2">แก้ไขแล้ว</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts.resolved}</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-gray-200 rounded-full p-2">
              <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
            </div>
            <span className="bg-white py-0.5 px-2 rounded-full text-xs text-gray-700 font-medium">จัดเก็บ</span>
          </div>
          <h3 className="text-xs uppercase text-gray-700 font-semibold mt-2">จัดเก็บแล้ว</h3>
          <p className="text-2xl font-bold text-gray-600 mt-1">{statusCounts.archived}</p>
        </div>
      </div>

      <ComplaintsList initialComplaints={initialComplaints} />
    </div>
  );
}
