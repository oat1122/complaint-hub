import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET /api/notifications - Get user-specific notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // First, make sure all new complaints have notifications for this user
    const newComplaints = await prisma.complaint.findMany({
      where: {
        status: "new",
        userNotifications: {
          none: {
            userId,
          },
        },
      },
    });

    // Create notifications for new complaints that don't have notifications yet
    if (newComplaints.length > 0) {
      for (const complaint of newComplaints) {
        await prisma.userNotification.create({
          data: {
            userId,
            complaintId: complaint.id,
            isRead: false,
            isDeleted: false,
          },
        });
      }
    }

    // Get user's notifications that aren't deleted
    const userNotifications = await prisma.userNotification.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        complaint: {
          select: {
            id: true,
            subject: true,
            trackingNumber: true,
            priority: true,
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to 5 newest notifications
    });

    // Get total count of user's unread notifications
    const totalUnreadNotifications = await prisma.userNotification.count({
      where: {
        userId,
        isRead: false,
        isDeleted: false,
      },
    });

    // Transform data format to match what the frontend expects
    const notifications = userNotifications.map((notification) => ({
      id: notification.id,
      complaintId: notification.complaintId,
      subject: notification.complaint.subject,
      trackingNumber: notification.complaint.trackingNumber,
      priority: notification.complaint.priority,
      createdAt: notification.complaint.createdAt.toISOString(),
      isRead: notification.isRead,
    }));

    return NextResponse.json({
      notifications,
      total: totalUnreadNotifications,
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { action, id } = body;

    if (action === "markAsRead") {
      if (id) {
        // Mark a specific notification as read
        await prisma.userNotification.update({
          where: {
            id,
            userId, // Ensure this notification belongs to the current user
          },
          data: {
            isRead: true,
          },
        });
      } else {
        // Mark all user's notifications as read
        await prisma.userNotification.updateMany({
          where: {
            userId,
            isRead: false,
            isDeleted: false,
          },
          data: {
            isRead: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Soft delete the notification (mark as deleted)
    await prisma.userNotification.update({
      where: {
        id,
        userId, // Ensure this notification belongs to the current user
      },
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
