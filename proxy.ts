import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimit {
  count: number;
  resetAt: number;
}

// In-memory store (Note: works per isolate/instance in production)
const rateLimits = new Map<string, RateLimit>();

// 100 requests per minute
const LIMIT = 100;
const WINDOW_MS = 60 * 1000;

export function proxy(req: NextRequest) {
  // Only apply to /api/* routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();

  let entry = rateLimits.get(ip);
  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    rateLimits.set(ip, entry);
  } else {
    entry.count += 1;
  }

  if (entry.count > LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429, headers: { 'Retry-After': Math.ceil((entry.resetAt - now) / 1000).toString() } }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', LIMIT.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, LIMIT - entry.count).toString());
  response.headers.set('X-RateLimit-Reset', entry.resetAt.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
