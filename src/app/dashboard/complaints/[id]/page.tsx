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
      title: "Complaint Not Found",
      description: "The requested complaint could not be found.",
    };
  }

  return {
    title: `Complaint ${complaint.trackingNumber} - Complaint Hub`,
    description: `View details for complaint ${complaint.trackingNumber}`,
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
        <h1 className="text-2xl font-bold">Complaint Details</h1>
        {role === "viewer" && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-semibold">
            Read-Only Mode
          </div>
        )}
      </div>

      <ComplaintDetail complaint={complaint} />
    </div>
  );
}
