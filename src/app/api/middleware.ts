import { NextRequest, NextResponse } from "next/server";
import { securityMiddleware } from "@/middleware/security";

export async function middleware(request: NextRequest) {
  // Apply security middleware first
  const securityResponse = await securityMiddleware(request);
  
  // If security middleware returned an error response, return it
  if (securityResponse.status !== 200) {
    return securityResponse;
  }
  
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
