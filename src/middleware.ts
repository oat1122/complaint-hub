import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { securityMiddleware } from "./middleware/security";

// Apply security middleware for non-static routes and then authenticate dashboard routes
export default withAuth(
  async function middleware(request) {
    const path = request.nextUrl.pathname;
    
    // Skip security middleware for static assets
    if (
      path.startsWith('/_next/') || 
      path.startsWith('/favicon.ico') || 
      path.startsWith('/images/') ||
      path.includes('.') // Skip files with extensions
    ) {
      return NextResponse.next();
    }
    
    // Apply security headers and rate limiting
    const securityResponse = await securityMiddleware(request);
    
    // If security middleware returned a response, return it
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    // Admin-only routes check
    if (path.startsWith("/dashboard/settings") && 
        request.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Continue to next middleware or route handler
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only authenticate dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        // Allow access to all other routes
        return true;
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

// Middleware config applies to all routes, but authentication only applies to dashboard routes
export const config = {
  matcher: [
    // Apply middleware to all paths except static assets
    "/((?!_next/static|_next/image|favicon.ico|images).*)"
  ]
};
