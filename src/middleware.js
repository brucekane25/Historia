import { NextResponse } from "next/server";

// Gloria owns its API. Handle CORS preflight for /api/* so browser clients on
// other origins (and mobile apps) can call it. Normal GET responses get their
// CORS headers from next.config.mjs.
export function middleware(request) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};