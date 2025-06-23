import { Metadata } from "next";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export const metadata: Metadata = {
  title: "Dashboard - Complaint Hub",
  description: "Admin dashboard for complaint management",
};

export default async function Dashboard() {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // Get statistics
  const [
    totalComplaints,
    todaysComplaints,
    complaintsByCategory,
    complaintsByPriority,
    totalAttachments,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        {role === "viewer" && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-semibold">
            โหมดดูอย่างเดียว
          </div>
        )}
      </div>

      <DashboardStats initialStats={initialStats} />
    </div>
  );
}
