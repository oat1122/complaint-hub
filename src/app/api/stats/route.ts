import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !["admin", "viewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get total complaints count
    const totalComplaints = await prisma.complaint.count();

    // Get today's complaints count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysComplaints = await prisma.complaint.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Get complaints by category
    const complaintsByCategory = await prisma.complaint.groupBy({
      by: ["category"],
      _count: true,
    });

    // Get complaints by priority
    const complaintsByPriority = await prisma.complaint.groupBy({
      by: ["priority"],
      _count: true,
    });
    // Get top 5 categories
    const topCategories = complaintsByCategory
      .sort((a: any, b: any) => b._count - a._count)
      .slice(0, 5)
      .map((item: any) => ({
        category: item.category,
        count: item._count,
      }));

    // Get complaints trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyComplaints = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM
        complaints
      WHERE
        created_at >= ${thirtyDaysAgo}
      GROUP BY
        DATE(created_at)
      ORDER BY
        date ASC
    `;

    // Get attachment statistics
    const totalAttachments = await prisma.attachment.count();
    const avgAttachmentsPerComplaint =
      totalComplaints > 0 ? totalAttachments / totalComplaints : 0;

    return NextResponse.json({
      totalComplaints,
      todaysComplaints,
      complaintsByCategory,
      complaintsByPriority,
      topCategories,
      dailyComplaints,
      attachments: {
        total: totalAttachments,
        avgPerComplaint: avgAttachmentsPerComplaint,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
