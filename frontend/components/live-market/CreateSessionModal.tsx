"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Radio, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: any) => void;
}

const CATEGORIES = [
  "Forex & Currency Pairs",
  "Crypto Market Stream",
  "Indices & Stock Futures",
  "Gold & Commodities",
  "General Market Analysis",
];

export function CreateSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
}: CreateSessionModalProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  const token = (session?.user as any)?.accessToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a title for the stream");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category,
            scheduledAt: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to start live stream");
      }

      const newSession = await res.json();
      toast.success("Live stream room started successfully!");
      setTitle("");
      setDescription("");
      onSessionCreated(newSession);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to start live stream");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 border-border/60 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" /> Start Live Stream
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create an active broadcast room. All viewers will see your stream instantly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Stream Title *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., NY Open Forex Breakout & Chart Analysis"
              className="text-xs bg-background/60 border-border/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Market Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-xs bg-background/60 border-border/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description (Optional)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key levels, pairs to analyze, or discussion topics..."
              rows={3}
              className="text-xs bg-background/60 border-border/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="text-xs font-bold uppercase bg-primary text-primary-foreground"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go Live Now"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
