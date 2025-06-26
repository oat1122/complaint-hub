import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = 'force-dynamic'; // Important for SSE

// Server-Sent Events (SSE) endpoint for real-time notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Import and use the connection manager
    const { sseConnectionManager } = await import('@/lib/sse/connection-manager');

    // Prepare SSE response with connection management
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Add this connection to the manager
        sseConnectionManager.addConnection(userId, controller);
        
        // Initial connection message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'connection', 
          status: 'connected',
          connectionCount: sseConnectionManager.getConnectionCount(userId)
        })}\n\n`));
        
        // Load initial notifications
        const initialNotifications = await getActiveNotifications(userId);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'initial', 
          notifications: initialNotifications.notifications, 
          total: initialNotifications.total 
        })}\n\n`));
        
        // Check for new notifications periodically
        const checkInterval = async () => {
          try {
            // Get latest notifications
            const latestNotifications = await getActiveNotifications(userId);
            
            // Send updates if there are notifications
            if (latestNotifications.total > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'update', 
                notifications: latestNotifications.notifications,
                total: latestNotifications.total 
              })}\n\n`));
            }
          } catch (error) {
            console.error('SSE data fetch error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: 'Error fetching notifications' 
            })}\n\n`));
          }
        };
        
        // Schedule regular checks
        const intervalId = setInterval(checkInterval, 15000);
        
        // Clean up when the connection is closed
        request.signal.addEventListener('abort', () => {
          clearInterval(intervalId);
          sseConnectionManager.removeConnection(userId, controller);
        });
      }
    });

    // Return the stream with appropriate headers for SSE
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error("SSE error:", error);
    return NextResponse.json(
      { error: "Failed to establish SSE connection" },
      { status: 500 }
    );
  }
}

// Helper function to get active notifications
async function getActiveNotifications(userId: string) {
  // First, check for new complaints and create notifications if needed
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

  return {
    notifications,
    total: totalUnreadNotifications,
  };
}
