import dbConnect from "@/app/lib/mongoose";
import MapVisitor from "@/app/models/MapVisitors";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    await dbConnect();
    // await MapVisitor.deleteMany({ ip: "127.0.0.1" });
    const users = await MapVisitor.find({});
    // res.json(users);
    return NextResponse.json(users);
    console.log("Request hit sending data for all users");
  } catch (err) {
    console.log("error message", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { pathName } = await req.json();
    const headers = req.headers;

    const userAgent = headers.get("user-agent") || "unknown";

    let ip =
      headers.get("x-forwarded-for")?.split(",")[0] ||
      headers.get("remote-addr") ||
      "unknown";


    if (ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }

    await dbConnect();

    await MapVisitor.create({
      pathName,
      userAgent,
      ip,
    });

    const total = await MapVisitor.countDocuments();

    return NextResponse.json({ success: true, total });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
