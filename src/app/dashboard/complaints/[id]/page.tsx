import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import ComplaintDetail from "@/components/dashboard/complaint-detail";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Get complaint data
  const complaint = await prisma.complaint.findUnique({
    where: { id: params.id },
  });

  if (!complaint) {
    return {
      title: "ไม่พบคำร้องเรียน",
      description: "ไม่พบคำร้องเรียนที่ต้องการค้นหา",
    };
  }

  return {
    title: `คำร้องเรียนหมายเลข ${complaint.trackingNumber} - Complaint Hub`,
    description: `รายละเอียดคำร้องเรียนหมายเลข ${complaint.trackingNumber}`,
  };
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // Get complaint with attachments
  const complaint = await prisma.complaint.findUnique({
    where: { id: params.id },
    include: {
      attachments: true,
    },
  });

  // If complaint not found, show 404
  if (!complaint) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {role === "viewer" && (
          <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm font-semibold flex items-center">
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
      </div>

      <ComplaintDetail complaint={complaint} />
    </div>
  );
}
