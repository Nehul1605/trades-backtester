import { syncAllTradesPnl } from "@/lib/appwrite/actions";
import { auth } from "@/auth";

export async function GET(req: Request) {
  // Allow cron (Bearer token) or authenticated user session
  const authHeader = req.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron) {
    // Check if user is authenticated via session
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await syncAllTradesPnl();

  if (result.error) {
    return Response.json(result, { status: 500 });
  }

  return Response.json(result);
}
