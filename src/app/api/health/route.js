import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const CONNECTION_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// Liveness probe used by Render. It intentionally does not require MongoDB,
// so a slow database connection cannot cause the service to be restarted.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "gloria",
    database: {
      configured: Boolean(process.env.MONGODB_URI),
      state: CONNECTION_STATES[mongoose.connection.readyState] || "unknown",
    },
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
