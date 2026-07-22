"use client";

import React from "react";
import { LiveMeetingProvider } from "./LiveMeetingProvider";

export function LiveMeetingWrapper({ children }: { children: React.ReactNode }) {
  return <LiveMeetingProvider>{children}</LiveMeetingProvider>;
}
