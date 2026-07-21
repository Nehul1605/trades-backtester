"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserCheck, UserPlus, UserMinus, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface CoHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: any;
  onCoHostUpdated: () => void;
}

export function CoHostModal({
  isOpen,
  onClose,
  sessionData,
  onCoHostUpdated,
}: CoHostModalProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const token = (session?.user as any)?.accessToken;

  // Fetch users when modal opens or search query changes
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions/users/search?q=${encodeURIComponent(
            searchQuery
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, token]);

  const handleToggleCoHost = async (userId: string, isCurrentlyCoHost: boolean) => {
    if (!sessionData?._id) return;
    setActionLoadingId(userId);

    const action = isCurrentlyCoHost ? "remove" : "add";

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions/${sessionData._id}/cohosts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coHostId: userId,
            action,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update co-host status");
      }

      toast.success(
        action === "add" ? "Co-Host assigned successfully!" : "Co-Host removed"
      );
      onCoHostUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update co-host");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isUserCoHost = (userId: string) => {
    return sessionData?.coHosts?.some(
      (ch: any) => (ch._id || ch).toString() === userId.toString()
    );
  };

  const isUserHost = (userId: string) => {
    return (sessionData?.host?._id || sessionData?.host).toString() === userId.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 border-border/60 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Assign Co-Hosts
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Co-Hosts have permission to start/end the live stream, share screen, and present.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email..."
              className="pl-9 text-xs bg-background/60 border-border/50"
            />
          </div>

          {/* USERS LIST */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No users found.
              </p>
            ) : (
              users.map((u) => {
                const host = isUserHost(u._id);
                const coHost = isUserCoHost(u._id);
                const isProcessing = actionLoadingId === u._id;

                return (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-background/40 border border-border/40 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {u.name?.substring(0, 2).toUpperCase() || "TR"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-none flex items-center gap-1.5">
                          {u.name}
                          {host && (
                            <Badge className="bg-primary/20 text-primary text-[9px] px-1.5 py-0 font-bold uppercase">
                              Host
                            </Badge>
                          )}
                          {coHost && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0 font-bold uppercase">
                              Co-Host
                            </Badge>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{u.email}</p>
                      </div>
                    </div>

                    {!host && (
                      <Button
                        size="sm"
                        variant={coHost ? "destructive" : "outline"}
                        disabled={isProcessing}
                        onClick={() => handleToggleCoHost(u._id, coHost)}
                        className="h-7 text-[11px] font-bold px-2.5 rounded-md"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : coHost ? (
                          <>
                            <UserMinus className="w-3 h-3 mr-1" /> Remove
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 mr-1" /> Assign Co-Host
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
