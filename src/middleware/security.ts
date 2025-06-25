import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/rate-limiter";

// Rate limiter instances
const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

export async function securityMiddleware(request: NextRequest) {
  const url = new URL(request.url);
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Apply rate limiting
  if (url.pathname.startsWith('/api/')) {
    const limiter = url.pathname.includes('auth') ? authLimiter : apiLimiter;
    
    try {
      await limiter.check(ip);
    } catch (error) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // CORS headers (adjust origin as needed)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';"
  );
  
  return response;
}
