import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function validateUserAccess(request: NextRequest, requiredRole?: string) {
  const token = await getToken({ req: request });
  
  if (!token) {
    throw new Error('Unauthorized');
  }
  
  if (requiredRole && token.role !== requiredRole) {
    throw new Error('Insufficient permissions');
  }
  
  return token;
}
