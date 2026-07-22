import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Optionally ping Express backend to keep Render warm
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
    try {
      await fetch(`${backendUrl}/api/keep-alive`, { cache: "no-store" }).catch(() => null);
    } catch (e) {
      // Ignore backend ping failures
    }

    return NextResponse.json(
      {
        status: "ok",
        service: "TradeTracker Pro Frontend & Keep-Alive Service",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Keep alive check failed" }, { status: 500 });
  }
}
