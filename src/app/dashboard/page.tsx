import { Metadata } from "next";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, BarChart4 } from "lucide-react";
import DailyComplaintTrendChartWrapper from "@/components/dashboard/daily-complaint-trend-chart-wrapper";

export const metadata: Metadata = {
  title: "Dashboard - Complaint Hub",
  description: "Admin dashboard for complaint management",
};

export default async function Dashboard() {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isAdmin = role === "admin";

  // Get statistics
  const [
    totalComplaints,
    todaysComplaints,
    complaintsByCategory,
    complaintsByPriority,
    totalAttachments,
    newComplaints,
    archivedComplaints,
  ] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.complaint.groupBy({
      by: ["category"],
      _count: true,
    }),
    prisma.complaint.groupBy({
      by: ["priority"],
      _count: true,
    }),
    prisma.attachment.count(),
    prisma.complaint.count({
      where: {
        status: "new",
      },
    }),
    prisma.complaint.count({
      where: {
        status: "archived",
      },
    }),
  ]);

  // Get top categories
  const topCategories = [...complaintsByCategory]
    .sort((a: any, b: any) => b._count - a._count)
    .slice(0, 5)
    .map((item: any) => ({
      category: item.category,
      count: item._count,
    }));

  // Prepare initial stats
  const initialStats = {
    totalComplaints,
    todaysComplaints,
    newComplaints,
    archivedComplaints,
    complaintsByCategory,
    complaintsByPriority,
    topCategories,
    attachments: {
      total: totalAttachments,
      avgPerComplaint:
        totalComplaints > 0 ? totalAttachments / totalComplaints : 0,
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              ยินดีต้อนรับกลับ!
            </h1>
            <p className="text-gray-600 mt-1">
              ระบบจัดการข้อร้องเรียนและติดตามสถานะ
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/tracking">
              <Button variant="outline" className="gap-2 px-4">
                <FileText className="h-4 w-4" />
                ตรวจสอบสถานะ
              </Button>
            </Link>
            <Link href="/dashboard/complaints">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2 px-4 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                ดูคำร้องเรียนทั้งหมด
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  คำร้องเรียนทั้งหมด
                </p>
                <p className="text-3xl font-bold mt-1">
                  {initialStats.totalComplaints.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-green-600 font-medium">
                +{initialStats.todaysComplaints}{" "}
              </span>
              <span className="text-gray-500">วันนี้</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">คำร้องใหม่</p>
                <p className="text-3xl font-bold mt-1">
                  {initialStats.newComplaints.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <PlusCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-500">คิดเป็น </span>
              <span className="text-blue-600 font-medium">
                {totalComplaints > 0
                  ? Math.round(
                      (initialStats.newComplaints / totalComplaints) * 100
                    )
                  : 0}
                %
              </span>
              <span className="text-gray-500"> ของทั้งหมด</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ไฟล์แนบทั้งหมด
                </p>
                <p className="text-3xl font-bold mt-1">
                  {initialStats.attachments.total.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              เฉลี่ย {initialStats.attachments.avgPerComplaint.toFixed(1)}{" "}
              ไฟล์ต่อคำร้อง
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  คำร้องที่จัดเก็บแล้ว
                </p>
                <p className="text-3xl font-bold mt-1">
                  {initialStats.archivedComplaints.toLocaleString()}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <BarChart4 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-500">คิดเป็น </span>
              <span className="text-amber-600 font-medium">
                {totalComplaints > 0
                  ? Math.round(
                      (initialStats.archivedComplaints / totalComplaints) * 100
                    )
                  : 0}
                %
              </span>
              <span className="text-gray-500"> ของทั้งหมด</span>            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1 lg:col-span-2">
          <DailyComplaintTrendChartWrapper />
        </div>
      </div>

      <DashboardStats initialStats={initialStats} />
    </div>
  );
}
