import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

interface Params {
  params: {
    id: string;
  };
}

// GET complaint by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const id = params.id;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint" },
      { status: 500 }
    );
  }
}

// DELETE complaint by ID (admin only)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const id = params.id;

    // Check if complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Delete complaint (will cascade delete attachments too)
    await prisma.complaint.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return NextResponse.json(
      { error: "Failed to delete complaint" },
      { status: 500 }
    );
  }
}

// PATCH complaint status by ID (admin only)
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const id = params.id;
    const data = await request.json();

    // Validate status
    const validStatuses = [
      "new",
      "received",
      "discussing",
      "processing",
      "resolved",
      "archived",
    ];
    if (!data.status || !validStatuses.includes(data.status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Allowed statuses: " +
            validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    // Check if complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Update complaint status
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: data.status,
      },
    });

    // Create notification for all users that should be notified of this status change
    await prisma.userNotification.createMany({
      data: (
        await prisma.user.findMany({
          where: {
            role: "admin", // Notify all admins
          },
          select: { id: true },
        })
      ).map((user) => ({
        userId: user.id,
        complaintId: id,
        isRead: false,
        isDeleted: false,
      })),
      skipDuplicates: true, // Skip if notification already exists
    });

    return NextResponse.json({
      success: true,
      status: updatedComplaint.status,
      message: "Complaint status updated successfully",
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json(
      { error: "Failed to update complaint status" },
      { status: 500 }
    );
  }
}
