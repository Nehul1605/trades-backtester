import React from "react";
import { auth } from "@/auth";
import { RdxTradesView } from "@/components/dashboard/rdx-trades";

export default async function RdxTradesPage() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col bg-background">
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <RdxTradesView />
      </main>
    </div>
  );
}
