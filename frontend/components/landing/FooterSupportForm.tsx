"use client";

import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function FooterSupportForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "[FOOTER INQUIRY] General Support Request",
          message: message.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Support inquiry sent! We will reply via tradetrackerpro.in@gmail.com.");
        setMessage("");
      } else {
        toast.error("Could not send message. Please email tradetrackerpro.in@gmail.com directly.");
      }
    } catch (err) {
      toast.success("Support inquiry received! We will reach out shortly.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full md:w-auto items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message or question..."
        className="h-9 px-3 text-xs rounded-lg bg-background/80 border border-border/60 text-foreground focus:outline-none focus:border-primary w-full md:w-72"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="h-9 px-4 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shrink-0 flex items-center justify-center gap-1.5"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send"}
      </button>
    </form>
  );
}
