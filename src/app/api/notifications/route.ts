import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET /api/notifications - Get unread notifications (new complaints)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get new complaints (used as notifications)
    const newComplaints = await prisma.complaint.findMany({
      where: {
        status: "new",
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Limit to 5 newest complaints
      select: {
        id: true,
        subject: true,
        trackingNumber: true,
        priority: true,
        createdAt: true,
      }
    });

    // Get total count of new complaints
    const totalNewComplaints = await prisma.complaint.count({
      where: {
        status: "new",
      }
    });

    return NextResponse.json({
      notifications: newComplaints,
      total: totalNewComplaints
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Currently our system doesn't track read status of notifications
    // But in the future we can add this functionality
    // For now, we'll just acknowledge the request

    return NextResponse.json({ 
      success: true, 
      message: "Notifications acknowledged" 
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}
