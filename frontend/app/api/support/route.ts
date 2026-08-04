import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const token = (session?.user as any)?.accessToken || "";
    const body = await req.json();

    // Call Express Backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
    
    // Explicitly type headers as HeadersInit to resolve TS overload issues
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    console.log("Forwarding support ticket to backend:", `${backendUrl}/api/support`);

    const response = await fetch(`${backendUrl}/api/support`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText };
      }
      return new NextResponse(
        JSON.stringify({ error: errorJson.error || "Failed to forward support request" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Support API Forwarding Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
