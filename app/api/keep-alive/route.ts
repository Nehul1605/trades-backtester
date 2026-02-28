import { keepAliveCheck } from "@/lib/appwrite/actions";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ok = await keepAliveCheck();

  if (!ok) {
    return new Response("Database error", { status: 500 });
  }

  return new Response("OK");
}
