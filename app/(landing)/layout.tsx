import type React from "react";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}
