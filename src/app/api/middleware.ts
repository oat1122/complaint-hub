import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // No middleware logic needed yet
  return NextResponse.next();
}

export function onError(error: Error) {
  console.error("API route error:", error);
  return new NextResponse(
    JSON.stringify({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    }),
    {
      status: 500,
      headers: { "content-type": "application/json" },
    }
  );
}
