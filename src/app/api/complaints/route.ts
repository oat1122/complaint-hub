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

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build query filters
    const filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.OR = [
        { subject: { contains: search } },
        { description: { contains: search } },
        { trackingNumber: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      filters.createdAt = {};

      if (dateFrom) {
        // Create date at start of day (00:00:00)
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        filters.createdAt.gte = fromDate;
      }

      if (dateTo) {
        // Create date at end of day (23:59:59.999)
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filters.createdAt.lte = toDate;
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.complaint.count({
      where: filters,
    });

    // Get complaints with pagination
    const complaints = await prisma.complaint.findMany({
      where: filters,
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
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      complaints,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
