"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "./server";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_TRADES_COLLECTION_ID,
  APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID,
  APPWRITE_STORAGE_BUCKET_ID,
} from "./config";
import { auth } from "@/auth";
import { computePnlUSD } from "@/lib/pnl";

// ─── Helper: get authenticated user ID or throw ──────────────────────────────

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// ─── Trade actions ────────────────────────────────────────────────────────────

export async function createTrade(data: {
  user_id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  entry_price_text: string;
  exit_price_text: string | null;
  quantity: number;
  trade_type: string;
  entry_date: string;
  exit_date: string | null;
  status: string;
  strategy_name: string | null;
  notes: string | null;
  screenshot_url: string | null;
  pnl: number | null;
  pnl_percentage: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
}): Promise<{ error?: string }> {
  try {
    const userId = await requireUserId();
    const { databases } = await createAdminClient();

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRADES_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        symbol: data.symbol,
        entry_price: data.entry_price,
        exit_price: data.exit_price,
        entry_price_text: data.entry_price_text,
        exit_price_text: data.exit_price_text,
        quantity: data.quantity,
        trade_type: data.trade_type,
        entry_date: data.entry_date,
        exit_date: data.exit_date,
        status: data.status,
        strategy_name: data.strategy_name,
        notes: data.notes,
        screenshot_url: data.screenshot_url,
        pnl: data.pnl,
        pnl_percentage: data.pnl_percentage,
        stop_loss: data.stop_loss ?? null,
        take_profit: data.take_profit ?? null,
      },
    );

    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create trade",
    };
  }
}

export async function deleteTrade(id: string): Promise<{ error?: string }> {
  try {
    await requireUserId();
    const { databases } = await createAdminClient();
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRADES_COLLECTION_ID,
      id,
    );
    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete trade",
    };
  }
}

export async function updateTrade(
  id: string,
  data: Record<string, unknown>,
): Promise<{ error?: string }> {
  try {
    await requireUserId();
    const { databases } = await createAdminClient();
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRADES_COLLECTION_ID,
      id,
      data,
    );
    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update trade",
    };
  }
}

export async function getTradesForUser(
  userId: string,
  orderField = "entry_date",
  orderDirection: "asc" | "desc" = "desc",
) {
  try {
    const { databases } = await createAdminClient();

    const queries = [
      Query.equal("user_id", userId),
      Query.limit(5000),
      orderDirection === "asc"
        ? Query.orderAsc(orderField)
        : Query.orderDesc(orderField),
    ];

    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRADES_COLLECTION_ID,
      queries,
    );

    return result.documents;
  } catch {
    return [];
  }
}

export async function getBrokerAccounts(userId: string) {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID,
      [Query.equal("user_id", userId)],
    );

    return result.documents;
  } catch {
    return [];
  }
}

// ─── Storage actions ──────────────────────────────────────────────────────────

export async function uploadTradeScreenshot(
  formData: FormData,
): Promise<string | null> {
  try {
    const file = formData.get("file") as File;
    const userId = await requireUserId();

    if (!file) return null;

    const { storage } = await createAdminClient();

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;

    // Convert buffer to a File object for node-appwrite v22+
    const uploadFile = new File([buffer], fileName, { type: file.type });

    const result = await storage.createFile(
      APPWRITE_STORAGE_BUCKET_ID,
      ID.unique(),
      uploadFile,
    );

    // Build the public file view URL
    const publicUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_STORAGE_BUCKET_ID}/files/${result.$id}/view?project=${APPWRITE_PROJECT_ID}`;

    return publicUrl;
  } catch (err) {
    console.error("Screenshot upload error:", err);
    return null;
  }
}

// ─── Keep-alive (admin) ──────────────────────────────────────────────────────

export async function keepAliveCheck(): Promise<boolean> {
  try {
    const { databases } = await createAdminClient();
    await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRADES_COLLECTION_ID,
      [Query.limit(1)],
    );
    return true;
  } catch {
    return false;
  }
}

// ─── P&L Sync ─────────────────────────────────────────────────────────────────

/**
 * Recalculate P&L for all closed trades and fix any mismatches.
 * Returns the number of trades that were corrected.
 */
export async function syncAllTradesPnl(): Promise<{
  fixed: number;
  total: number;
  error?: string;
}> {
  try {
    const { databases } = await createAdminClient();

    // Fetch all closed trades across all users
    let allClosed: any[] = [];
    let offset = 0;
    const batchSize = 100;

    while (true) {
      const batch = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_TRADES_COLLECTION_ID,
        [
          Query.equal("status", "closed"),
          Query.limit(batchSize),
          Query.offset(offset),
        ],
      );
      allClosed = allClosed.concat(batch.documents);
      if (batch.documents.length < batchSize) break;
      offset += batchSize;
    }

    let fixed = 0;

    for (const trade of allClosed) {
      // Skip trades missing exit price
      const exitPrice = trade.exit_price_text ?? trade.exit_price;
      const entryPrice = trade.entry_price_text ?? trade.entry_price;
      if (!exitPrice || !entryPrice) continue;

      const { pnl: correctPnl, pnlPct: correctPct } = computePnlUSD({
        symbol: trade.symbol,
        entryPrice: entryPrice,
        exitPrice: exitPrice,
        quantity: trade.quantity,
        tradeType: (trade.trade_type as "long" | "short") || "long",
      });

      // Compare with stored values (allow tiny float tolerance)
      const storedPnl = trade.pnl ?? 0;
      const storedPct = trade.pnl_percentage ?? 0;
      const pnlDiff = Math.abs(storedPnl - correctPnl);
      const pctDiff = Math.abs(storedPct - correctPct);

      if (pnlDiff > 0.001 || pctDiff > 0.0001) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_TRADES_COLLECTION_ID,
          trade.$id,
          { pnl: correctPnl, pnl_percentage: correctPct },
        );
        fixed++;
      }
    }

    return { fixed, total: allClosed.length };
  } catch (err: unknown) {
    return {
      fixed: 0,
      total: 0,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}
