"use client";

import { useEffect, useRef } from "react";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function PnlSyncProvider() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const doSync = async () => {
      try {
        const res = await fetch("/api/sync-pnl");
        if (res.ok) {
          const data = await res.json();
          if (data.fixed > 0) {
            console.log(`[PnL Sync] Fixed ${data.fixed}/${data.total} trades`);
            // Trigger a page refresh so updated P&L values show
            window.location.reload();
          }
        }
      } catch {
        // Silent fail — will retry next interval
      }
    };

    // Run once on mount (after a short delay so page loads first)
    const initTimer = setTimeout(doSync, 5000);

    // Then every 5 minutes
    timerRef.current = setInterval(doSync, SYNC_INTERVAL_MS);

    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return null; // Renders nothing
}
