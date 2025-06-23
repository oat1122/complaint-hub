import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { trackingNumber },
      select: {
        trackingNumber: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        subject: true,
        attachments: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error tracking complaint:", error);
    return NextResponse.json(
      { error: "Failed to track complaint" },
      { status: 500 }
    );
  }
}
