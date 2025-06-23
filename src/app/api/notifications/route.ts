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
    
    const userId = session.user.id;
    
    // Get new complaints (used as notifications)
    // For now, we'll use localStorage on the client side to track what's been read/deleted
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
        status: true,
      }
    });

    // Get total count of new complaints
    const totalNewComplaints = await prisma.complaint.count({
      where: {
        status: "new",
      }
    });

    // Transform data to include isRead status (for now all new complaints are unread)
    const notifications = newComplaints.map(complaint => ({
      ...complaint,
      isRead: false
    }));    return NextResponse.json({
      notifications,
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
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, id } = body;
    
    if (action === "markAsRead") {
      if (id) {
        // Mark a specific notification as read by archiving the complaint
        await prisma.complaint.update({
          where: {
            id
          },
          data: {
            status: "archived"
          }
        });
      } else {
        // Mark all new complaints as archived
        await prisma.complaint.updateMany({
          where: {
            status: "new"
          },
          data: {
            status: "archived"
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notifications marked as read" 
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete a specific notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Archive the specific complaint instead of deleting it
    await prisma.complaint.update({
      where: { id },
      data: { status: "archived" }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Notification deleted" 
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
