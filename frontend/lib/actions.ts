"use server";

import { auth } from "@/auth";
import { computePnlUSD, TradeType } from "@/lib/pnl";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

// Helper to get authorization header with JWT
async function getAuthHeader(): Promise<HeadersInit> {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  if (token) {
    return {
      "Authorization": `Bearer ${token}`,
    };
  }
  return {};
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
  broker_account_id?: string | null;
  commission?: number | null;
}): Promise<{ error?: string }> {
  try {
    const authHeader = await getAuthHeader();
    
    // Map properties from lower_snake_case to camelCase for the Express API
    const body = {
      symbol: data.symbol,
      entryPrice: data.entry_price,
      exitPrice: data.exit_price,
      entryPriceText: data.entry_price_text,
      exitPriceText: data.exit_price_text,
      quantity: data.quantity,
      tradeType: data.trade_type,
      entryDate: data.entry_date,
      exitDate: data.exit_date,
      status: data.status,
      strategyName: data.strategy_name,
      notes: data.notes,
      screenshotUrl: data.screenshot_url,
      pnl: data.pnl,
      pnlPercentage: data.pnl_percentage,
      stopLoss: data.stop_loss,
      takeProfit: data.take_profit,
      brokerAccountId: data.broker_account_id || null,
      commission: data.commission ?? 0,
    };

    const res = await fetch(`${BACKEND_URL}/api/trades`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to create trade" };
    }

    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create trade",
    };
  }
}

export async function deleteTrade(id: string): Promise<{ error?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/trades/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to delete trade" };
    }

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
    const authHeader = await getAuthHeader();
    
    // Map properties from camelCase or lower_snake_case to backend expected camelCase
    const body: Record<string, any> = {};
    const keyMapping: Record<string, string> = {
      entry_price: "entryPrice",
      exit_price: "exitPrice",
      entry_price_text: "entryPriceText",
      exit_price_text: "exitPriceText",
      trade_type: "tradeType",
      entry_date: "entryDate",
      exit_date: "exitDate",
      strategy_name: "strategyName",
      screenshot_url: "screenshotUrl",
      pnl_percentage: "pnlPercentage",
      stop_loss: "stopLoss",
      take_profit: "takeProfit",
      broker_account_id: "brokerAccountId",
      commission: "commission",
    };

    Object.keys(data).forEach((key) => {
      const mappedKey = keyMapping[key] || key;
      body[mappedKey] = data[key];
    });

    const res = await fetch(`${BACKEND_URL}/api/trades/${id}`, {
      method: "PUT",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to update trade" };
    }

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
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/trades`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    const trades = await res.json();

    // Map backend response properties back to lower_snake_case to match what UI expects
    return trades.map((t: any) => ({
      $id: t.id || t._id,
      id: t.id || t._id,
      symbol: t.symbol,
      entry_price: t.entryPrice,
      exit_price: t.exitPrice,
      entry_price_text: t.entryPriceText,
      exit_price_text: t.exitPriceText,
      quantity: t.quantity,
      trade_type: t.tradeType,
      entry_date: t.entryDate,
      exit_date: t.exitDate,
      status: t.status,
      strategy_name: t.strategyName,
      notes: t.notes,
      screenshot_url: t.screenshotUrl,
      pnl: t.pnl,
      pnl_percentage: t.pnlPercentage,
      stop_loss: t.stopLoss,
      take_profit: t.takeProfit,
      broker_account_id: t.brokerAccountId,
      commission: t.commission,
    }));
  } catch (err) {
    console.error("getTradesForUser error:", err);
    return [];
  }
}

export async function getTradesForAccount(
  accountId: string,
) {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/trades?brokerAccountId=${accountId}`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    const trades = await res.json();

    return trades.map((t: any) => ({
      $id: t.id || t._id,
      id: t.id || t._id,
      symbol: t.symbol,
      entry_price: t.entryPrice,
      exit_price: t.exitPrice,
      entry_price_text: t.entryPriceText,
      exit_price_text: t.exitPriceText,
      quantity: t.quantity,
      trade_type: t.tradeType,
      entry_date: t.entryDate,
      exit_date: t.exitDate,
      status: t.status,
      strategy_name: t.strategyName,
      notes: t.notes,
      screenshot_url: t.screenshotUrl,
      pnl: t.pnl,
      pnl_percentage: t.pnlPercentage,
      stop_loss: t.stopLoss,
      take_profit: t.takeProfit,
      broker_account_id: t.brokerAccountId,
      commission: t.commission,
    }));
  } catch (err) {
    console.error("getTradesForAccount error:", err);
    return [];
  }
}

// ─── Broker account actions ───────────────────────────────────────────────────

export async function getBrokerAccounts(userId: string) {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    const accounts = await res.json();
    return accounts.map((a: any) => ({
      $id: a._id,
      id: a._id,
      user_id: a.userId,
      account_category: a.accountCategory || "broker",
      market_type: a.marketType || "cfd",
      broker_type: a.brokerType,
      custom_firm_name: a.customFirmName || "",
      account_id: a.accountId,
      server: a.server,
      status: a.status,
      balance: a.balance,
      equity: a.equity,
      currency: a.currency,
      last_sync: a.lastSync,
      sort_order: a.sortOrder || 0,
    }));
  } catch (err) {
    console.error("getBrokerAccounts error:", err);
    return [];
  }
}

export async function getBrokerAccountById(id: string): Promise<any> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts/${id}`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return null;
    }

    const a = await res.json();
    return {
      $id: a._id,
      id: a._id,
      user_id: a.userId,
      account_category: a.accountCategory || "broker",
      market_type: a.marketType || "cfd",
      broker_type: a.brokerType,
      custom_firm_name: a.customFirmName || "",
      account_id: a.accountId,
      server: a.server,
      status: a.status,
      balance: a.balance,
      equity: a.equity,
      currency: a.currency,
      last_sync: a.lastSync,
    };
  } catch (err) {
    console.error("getBrokerAccountById error:", err);
    return null;
  }
}

export async function createBrokerAccount(data: {
  account_category?: string;
  market_type?: string;
  broker_type: string;
  custom_firm_name?: string;
  account_id: string;
  server?: string;
  password?: string;
  balance?: number;
  equity?: number;
  currency?: string;
}): Promise<{ error?: string; account?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const body = {
      accountCategory: data.account_category || "broker",
      marketType: data.market_type || "cfd",
      brokerType: data.broker_type,
      customFirmName: data.custom_firm_name || "",
      accountId: data.account_id,
      server: data.server || "demo",
      password: data.password || "demo",
      balance: data.balance || 0,
      equity: data.equity || data.balance || 0,
      currency: data.currency || "USD",
    };

    const res = await fetch(`${BACKEND_URL}/api/accounts`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to create broker account" };
    }

    return { account: result };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create broker account",
    };
  }
}

export async function topUpAccount(id: string): Promise<{ error?: string; account?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts/${id}/topup`, {
      method: "POST",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to top up account" };
    }

    return { account: result };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to top up account",
    };
  }
}

export async function archiveBrokerAccount(id: string): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to archive account" };
    }

    return { message: result.message };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to archive account",
    };
  }
}

export async function restoreBrokerAccount(id: string): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts/${id}/restore`, {
      method: "POST",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to restore account" };
    }

    return { message: result.message };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to restore account",
    };
  }
}

export async function deleteBrokerAccountPermanent(id: string): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts/${id}?permanent=true`, {
      method: "DELETE",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to delete account permanently" };
    }

    return { message: result.message };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete account permanently",
    };
  }
}

export async function reorderBrokerAccounts(accountIds: string[]): Promise<{ error?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/accounts/reorder`, {
      method: "PUT",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountIds }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to reorder accounts" };
    }

    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to reorder accounts",
    };
  }
}

// ─── Verification Actions ───────────────────────────────────────────────────

export async function getVerificationStatus(): Promise<{
  status: string;
  role: string;
  request?: any;
  error?: string;
}> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/verification/status`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    const result = await res.json();
    if (!res.ok) {
      return { status: "pending", role: "user", error: result.error || "Failed to fetch status" };
    }
    return result;
  } catch (err: unknown) {
    return {
      status: "pending",
      role: "user",
      error: err instanceof Error ? err.message : "Failed to fetch status",
    };
  }
}

export async function submitVerificationRequest(data: {
  broker: string;
  tradingAccountNumber: string;
  telegramUsername: string;
}): Promise<{ error?: string; message?: string; request?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/verification/submit`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        broker: data.broker,
        tradingAccountNumber: data.tradingAccountNumber,
        telegramUsername: data.telegramUsername,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to submit verification request" };
    }
    return result;
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to submit verification request",
    };
  }
}

// ─── Admin Actions ──────────────────────────────────────────────────────────

export async function getAdminVerifications(): Promise<any[]> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/verifications`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("getAdminVerifications error:", err);
    return [];
  }
}

export async function approveVerificationRequest(id: string): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/verifications/${id}/approve`, {
      method: "POST",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to approve request" };
    }
    return result;
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to approve request",
    };
  }
}

export async function rejectVerificationRequest(
  id: string,
  remarks?: string
): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/verifications/${id}/reject`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ remarks }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to reject request" };
    }
    return result;
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to reject request",
    };
  }
}

export async function searchUsers(query: string, status: string = "approved"): Promise<any[]> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${BACKEND_URL}/api/admin/users/search?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`, {
    method: "GET",
    headers: authHeader,
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to search users (HTTP ${res.status})`);
  }
  return await res.json();
}

export async function updateUserRole(id: string, role: string): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to update user role" };
    }
    return result;
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update user role",
    };
  }
}

export async function getAdminUsers(params: {
  search?: string;
  status?: string;
  role?: string;
  promoOnly?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}): Promise<{
  users: any[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}> {
  try {
    const authHeader = await getAuthHeader();
    const queryParts: string[] = [];
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.role) queryParts.push(`role=${encodeURIComponent(params.role)}`);
    if (params.promoOnly) queryParts.push(`promoOnly=${encodeURIComponent(params.promoOnly)}`);
    if (params.sortBy) queryParts.push(`sortBy=${encodeURIComponent(params.sortBy)}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${encodeURIComponent(params.sortOrder)}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    const res = await fetch(`${BACKEND_URL}/api/admin/users${queryString}`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch users (HTTP ${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error("getAdminUsers error:", err);
    return { users: [], totalPages: 0, currentPage: 1, totalUsers: 0 };
  }
}

export async function updateUserStatus(
  id: string,
  status: string,
  reason?: string
): Promise<{ error?: string; message?: string; user?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, reason }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to update user status" };
    }
    return result;
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update user status",
    };
  }
}

export async function getAdminUserTrades(id: string): Promise<any[]> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}/trades`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    const trades = await res.json();

    // Map backend response properties back to lower_snake_case to match what UI expects
    return trades.map((t: any) => ({
      $id: t.id || t._id,
      id: t.id || t._id,
      symbol: t.symbol,
      entry_price: t.entryPrice,
      exit_price: t.exitPrice,
      entry_price_text: t.entryPriceText,
      exit_price_text: t.exitPriceText,
      quantity: t.quantity,
      trade_type: t.tradeType,
      entry_date: t.entryDate,
      exit_date: t.exitDate,
      status: t.status,
      strategy_name: t.strategyName,
      notes: t.notes,
      screenshot_url: t.screenshotUrl,
      pnl: t.pnl,
      pnl_percentage: t.pnlPercentage,
      stop_loss: t.stopLoss,
      take_profit: t.takeProfit,
      broker_account_id: t.brokerAccountId || t.broker_account_id,
      commission: t.commission,
    }));
  } catch (err) {
    console.error("getAdminUserTrades error:", err);
    return [];
  }
}

export async function getAdminUserAccounts(id: string): Promise<any[]> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}/accounts`, {
      method: "GET",
      headers: authHeader,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("getAdminUserAccounts error:", err);
    return [];
  }
}

// ─── Storage actions ──────────────────────────────────────────────────────────

export async function uploadTradeScreenshot(
  formData: FormData,
): Promise<string | null> {
  try {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return null;

    const res = await fetch(`${BACKEND_URL}/api/trades/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    if (result.url) {
      // Append the backend base URL to construct the full screenshot URL
      return `${BACKEND_URL}${result.url}`;
    }
    return null;
  } catch (err) {
    console.error("Screenshot upload error:", err);
    return null;
  }
}

// ─── Keep-alive (admin) ──────────────────────────────────────────────────────

export async function keepAliveCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── P&L Sync ─────────────────────────────────────────────────────────────────

export async function syncAllTradesPnl(): Promise<{
  fixed: number;
  total: number;
  error?: string;
}> {
  try {
    const trades = await getTradesForUser("");
    let fixed = 0;

    for (const trade of trades) {
      const exitPrice = trade.exit_price_text ? Number(trade.exit_price_text) : trade.exit_price;
      const entryPrice = trade.entry_price_text ? Number(trade.entry_price_text) : trade.entry_price;
      if (!exitPrice || !entryPrice) continue;

      const { pnl: correctPnl, pnlPct: correctPct } = computePnlUSD({
        symbol: trade.symbol,
        entryPrice: entryPrice,
        exitPrice: exitPrice,
        quantity: trade.quantity,
        tradeType: (trade.trade_type?.toLowerCase() as TradeType) || "long",
      });

      const storedPnl = trade.pnl ?? 0;
      const storedPct = trade.pnl_percentage ?? 0;
      const pnlDiff = Math.abs(storedPnl - correctPnl);
      const pctDiff = Math.abs(storedPct - correctPct);

      if (pnlDiff > 0.001 || pctDiff > 0.0001) {
        await updateTrade(trade.$id, {
          pnl: correctPnl,
          pnl_percentage: correctPct,
        });
        fixed++;
      }
    }

    return { fixed, total: trades.length };
  } catch (err: unknown) {
    return {
      fixed: 0,
      total: 0,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}

export async function updateUserProfile(data: {
  name: string;
  image?: string;
}): Promise<{ error?: string; user?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to update profile" };
    }
    return { user: result };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return { error: "Not authorized. Please log in again." };

    const res = await fetch(`${BACKEND_URL}/api/auth/upload-avatar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: result?.error || `Server error (${res.status})` };
    }

    if (result?.url) {
      return { url: result.url };
    }
    return { error: "Invalid response from server" };
  } catch (err: any) {
    console.error("Avatar upload error:", err);
    return { error: err?.message || "Failed to upload avatar" };
  }
}

export async function updateUserPassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ error?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/auth/password`, {
      method: "PUT",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to update password" };
    }
    return { message: result.message };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update password",
    };
  }
}

// ─── Operator HQ Actions ───────────────────────────────────────────────────

export async function getOperatorTrades(): Promise<{
  stats?: {
    totalSignals: number;
    openSignals: number;
    winCount: number;
    lossCount: number;
    closedCount: number;
    accuracyPercent: number;
    totalPips: number;
  };
  monthlyData?: Array<{
    monthKey: string;
    monthName: string;
    stats: {
      totalSignals: number;
      openSignals: number;
      winCount: number;
      lossCount: number;
      closedCount: number;
      accuracyPercent: number;
      totalPips: number;
    };
    trades: any[];
  }>;
  trades?: any[];
  error?: string;
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/operator-trades`, {
      method: "GET",
      next: { revalidate: 0 },
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.message || "Failed to fetch operator signals" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to fetch operator signals" };
  }
}

export async function createOperatorTrade(data: {
  symbol: string;
  direction: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number | null;
  status?: string;
  notes?: string;
  createdAt?: string;
}): Promise<{ error?: string; trade?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/operator-trades`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.message || "Failed to post trade call" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to post trade call" };
  }
}

export async function updateOperatorTrade(
  id: string,
  data: {
    status?: string;
    exitPrice?: number | null;
    stopLoss?: number;
    takeProfit?: number;
    notes?: string;
  }
): Promise<{ error?: string; trade?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/operator-trades/${id}`, {
      method: "PUT",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.message || "Failed to update trade call" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to update trade call" };
  }
}

export async function deleteOperatorTrade(id: string): Promise<{ error?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/operator-trades/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.message || "Failed to delete trade call" };
    }
    return {};
  } catch (err: any) {
    return { error: err.message || "Failed to delete trade call" };
  }
}

export async function applyPromoCode(code: string): Promise<{ error?: string; message?: string; user?: any }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/promo/apply`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to apply promo code" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to apply promo code" };
  }
}

export async function createPaymentOrder(data: {
  planType: "monthly" | "annual";
  customerName: string;
  customerPhone: string;
  currency?: "INR" | "USD";
}): Promise<{ error?: string; orderId?: string; amount?: number; currency?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to create payment order" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to create payment order" };
  }
}

export async function verifyPaymentSignature(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ error?: string; status?: string; message?: string; premiumExpiresAt?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/payments/verify-signature`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to verify payment signature" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to verify payment signature" };
  }
}

export async function getUserSubscriptions(): Promise<{
  error?: string;
  isPremium?: boolean;
  premiumExpiresAt?: string;
  isPromo?: boolean;
  promoExpiresAt?: string;
  membershipTag?: string;
  transactions?: any[];
}> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/payments/subscriptions`, {
      headers: {
        ...authHeader,
      },
      cache: "no-store",
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to fetch subscription details" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to fetch subscription details" };
  }
}

export async function getExchangeRate(): Promise<{
  error?: string;
  rate?: number;
  monthlyInr?: number;
  annualInr?: number;
}> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/payments/exchange-rate`, {
      headers: {
        ...authHeader,
      },
      cache: "no-store",
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to fetch live exchange rate" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to fetch live exchange rate" };
  }
}

export async function cancelPaymentOrder(orderId: string): Promise<{ error?: string; status?: string; message?: string }> {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/payments/cancel-order`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to cancel payment order" };
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to cancel payment order" };
  }
}

