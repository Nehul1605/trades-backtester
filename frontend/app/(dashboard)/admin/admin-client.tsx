"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  X,
  Search,
  Building,
  Hash,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  ShieldCheck,
} from "lucide-react";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
} from "@/lib/appwrite/actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardClientProps {
  initialData: any[];
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  React.useEffect(() => {
    // If they switch to User mode while on this page, redirect to dashboard
    const handleViewModeChange = () => {
      const mode = localStorage.getItem("adminViewMode");
      if (mode === "user") {
        window.location.href = "/dashboard";
      }
    };

    window.addEventListener("admin-view-mode-change", handleViewModeChange);
    
    // Check initial mode on mount
    const initialMode = localStorage.getItem("adminViewMode");
    if (initialMode === "user") {
      window.location.href = "/dashboard";
    }

    return () => {
      window.removeEventListener("admin-view-mode-change", handleViewModeChange);
    };
  }, []);

  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const result = await approveVerificationRequest(id);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Request Approved",
        description: "User referral status has been verified.",
      });

      // Update state locally
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved", user: { ...req.user, status: "approved" } } : req
        )
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to approve request.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialogId) return;
    
    const id = rejectDialogId;
    setActionLoadingId(id);
    setRejectDialogId(null);
    
    try {
      const result = await rejectVerificationRequest(id, rejectRemarks);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Request Rejected",
        description: "Rejection status sent to user.",
      });

      // Update state locally
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id 
            ? { ...req, status: "rejected", remarks: rejectRemarks, user: { ...req.user, status: "rejected" } } 
            : req
        )
      );
      setRejectRemarks("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "Failed to reject request.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter requests based on search query and status filter
  const filteredRequests = requests.filter((req) => {
    const user = req.user || {};
    const nameMatch = user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const accountMatch = req.tradingAccountNumber?.includes(searchQuery);
    const telegramMatch = req.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || accountMatch || telegramMatch;

    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/30 border border-border/40 p-4 rounded-xl backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search by name, email, account ID, or telegram username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className={`text-[10px] font-bold uppercase tracking-wider h-8 px-3 rounded-lg ${
                selectedStatus === status && status === "all"
                  ? "bg-primary text-background"
                  : selectedStatus === status
                  ? "bg-primary text-background"
                  : "border-primary/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Table view */}
      <Card className="bg-card/30 border-border/50 backdrop-blur-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-neutral-900/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  <th className="py-4 px-6">User Profile</th>
                  <th className="py-4 px-6">Broker</th>
                  <th className="py-4 px-6">Trading Account</th>
                  <th className="py-4 px-6">Telegram</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-xs">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-muted-foreground uppercase font-semibold">
                      No verification requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const user = req.user || {};
                    return (
                      <tr key={req.id} className="hover:bg-neutral-900/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-foreground text-sm">{user.name || "Unknown User"}</span>
                            <span className="text-muted-foreground text-[10px]">{user.email || ""}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Building className="w-3.5 h-3.5 text-primary/60" />
                            <span className="uppercase text-[11px]">{req.broker}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Hash className="w-3.5 h-3.5 text-primary/60" />
                            <span>{req.tradingAccountNumber}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <a
                            href={`https://t.me/${req.telegramUsername.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
                          >
                            <Send className="w-3.5 h-3.5 shrink-0" />
                            <span>{req.telegramUsername}</span>
                            <ExternalLink className="w-3 h-3 text-primary/50" />
                          </a>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className={`text-[9px] uppercase font-extrabold px-2 py-0.5 border ${
                              req.status === "approved"
                                ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                                : req.status === "rejected"
                                ? "bg-red-500/5 text-red-500 border-red-500/20"
                                : "bg-yellow-500/5 text-yellow-500 border-yellow-500/20 animate-pulse"
                            }`}
                          >
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleApprove(req.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase h-7 px-2.5 rounded-lg"
                              >
                                {actionLoadingId === req.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actionLoadingId === req.id}
                                onClick={() => setRejectDialogId(req.id)}
                                className="font-bold text-[10px] uppercase h-7 px-2.5 rounded-lg"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Remarks Dialog */}
      <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
        <DialogContent className="bg-card border-primary/20 text-foreground max-w-sm rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-destructive" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Reject Referral Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a reason for rejection (this will be displayed to the user).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="remarks" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rejection Remarks
              </Label>
              <Input
                id="remarks"
                placeholder="e.g. Account not found under our referral link."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                className="bg-muted/30 border-primary/20 hover:border-primary/45 transition-all text-xs rounded-lg h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejectDialogId(null)}
              className="text-xs uppercase font-bold text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs uppercase px-5 rounded-lg"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
