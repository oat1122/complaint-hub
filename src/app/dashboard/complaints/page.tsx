import { Metadata } from "next";
import ComplaintsList from "@/components/dashboard/complaints-list";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export const metadata: Metadata = {
  title: "Complaints - Complaint Hub",
  description: "Manage all submitted complaints",
};

export default async function ComplaintsPage() {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // Get initial complaints (first page)
  const complaints = await prisma.complaint.findMany({
    take: 10,
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

  // Prepare initial data
  const initialComplaints = {
    complaints,
    pagination: {
      total: totalCount,
      page: 1,
      limit: 10,
      pages: Math.ceil(totalCount / 10),
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Complaints</h1>
        {role === "viewer" && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-semibold">
            Read-Only Mode
          </div>
        )}
      </div>

      <ComplaintsList initialComplaints={initialComplaints} />
    </div>
  );
}
