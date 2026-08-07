"use client";

import React, { useState } from "react";
import { Loader2, Send, User, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function FooterSupportForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all support desk fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: "[FOOTER INQUIRY] General Support Request",
          message: message.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Support ticket sent! We will reply to your email shortly.");
        setName("");
        setEmail("");
        setMessage("");
        if (onSuccess) onSuccess();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Could not send ticket.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please contact support@tradetrackerpro.in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      {/* Name Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
          <User className="w-3.5 h-3.5" />
        </span>
        <input
          id="support-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="h-9 w-full pl-9 pr-3 text-xs rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          required
        />
      </div>

      {/* Email Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
          <Mail className="w-3.5 h-3.5" />
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="h-9 w-full pl-9 pr-3 text-xs rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          required
        />
      </div>

      {/* Message Textarea */}
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-muted-foreground/60">
          <MessageSquare className="w-3.5 h-3.5" />
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message or question..."
          rows={3}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-9 w-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Send Inquiry
          </>
        )}
      </button>
    </form>
  );
}
