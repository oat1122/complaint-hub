import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "กรุณากรอกหมายเลขติดตาม" },
        { status: 400 }
      );
    }    const complaint = await prisma.complaint.findUnique({
      where: { trackingNumber },
      select: {
        id: true,
        trackingNumber: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        subject: true,
        description: true,
        attachments: {
          select: {
            id: true,
            originalName: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            filePath: true,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "ไม่พบคำร้องเรียนที่ตรงกับหมายเลขติดตามนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error tracking complaint:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการติดตามคำร้องเรียน" },
      { status: 500 }
    );
  }
}
