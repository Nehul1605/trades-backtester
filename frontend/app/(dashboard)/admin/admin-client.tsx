"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  X,
  Search,
  Building,
  Hash,
  Send,
  Loader2,
  ExternalLink,
  Shield,
  ShieldCheck,
  User,
  Users,
  ArrowUpDown,
  Calendar,
  Clock,
  Activity,
} from "lucide-react";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
  searchUsers,
  updateUserRole,
  getAdminUsers,
  updateUserStatus,
  getAdminUserTrades,
  getAdminUserAccounts,
} from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardClientProps {
  initialData: any[];
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { toast } = useToast();
  
  // Navigation / View Modes
  const [activeTab, setActiveTab] = useState<"verifications" | "roles" | "users">("verifications");
  const [mounted, setMounted] = useState(false);

  // Tab 1: Verifications State
  const [requests, setRequests] = useState<any[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectUserDialogId, setRejectUserDialogId] = useState<string | null>(null);
  const [rejectUserRemarks, setRejectUserRemarks] = useState("");

  // Tab 2: User Role Manager State
  const [userQuery, setUserQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Tab 3: Site Users State
  const [siteUsers, setSiteUsers] = useState<any[]>([]);
  const [siteTotalUsers, setSiteTotalUsers] = useState(0);
  const [siteTotalPages, setSiteTotalPages] = useState(1);
  const [siteCurrentPage, setSiteCurrentPage] = useState(1);
  const [siteSearch, setSiteSearch] = useState("");
  const [siteStatus, setSiteStatus] = useState("approved");
  const [siteRole, setSiteRole] = useState("all");
  const [siteSortBy, setSiteSortBy] = useState("createdAt");
  const [siteSortOrder, setSiteSortOrder] = useState("desc");
  const [siteLoading, setSiteLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  // User Details Modal State (stats/trades)
  const [detailsUser, setDetailsUser] = useState<any | null>(null);
  const [detailsTrades, setDetailsTrades] = useState<any[]>([]);
  const [detailsAccounts, setDetailsAccounts] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [modalSelectedAccountId, setModalSelectedAccountId] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
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

  // Trigger search once on mount or when activeTab switches to 'roles'
  useEffect(() => {
    if (activeTab === "roles" && mounted) {
      handleUserSearch();
    }
  }, [activeTab, mounted]);

  const handleUserSearch = async () => {
    setSearching(true);
    try {
      const results = await searchUsers(userQuery);
      setFoundUsers(results);
    } catch (err: any) {
      console.error("Failed to search users:", err);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: err.message || "Could not retrieve user list.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.error) throw new Error(res.error);

      toast({
        title: "Role Updated",
        description: `User role has been updated to "${newRole}".`,
      });

      // Update state locally
      setFoundUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Failed to update role.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const fetchSiteUsers = async () => {
    setSiteLoading(true);
    try {
      const res = await getAdminUsers({
        search: siteSearch,
        status: siteStatus,
        role: siteRole,
        sortBy: siteSortBy,
        sortOrder: siteSortOrder,
        page: siteCurrentPage,
        limit: 10,
      });
      setSiteUsers(res.users);
      setSiteTotalPages(res.totalPages || 1);
      setSiteTotalUsers(res.totalUsers || 0);
    } catch (err: any) {
      console.error("Failed to fetch site users:", err);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: err.message || "Could not retrieve user directory.",
      });
    } finally {
      setSiteLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users" && mounted) {
      fetchSiteUsers();
    }
  }, [activeTab, siteSearch, siteStatus, siteRole, siteSortBy, siteSortOrder, siteCurrentPage, mounted]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (newStatus === "rejected") {
      setRejectUserDialogId(userId);
      setRejectUserRemarks("");
      return;
    }

    setStatusLoadingId(userId);
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.error) throw new Error(res.error);

      toast({
        title: "Status Updated",
        description: `User status has been updated to "${newStatus}".`,
      });

      // Update state locally
      setSiteUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
      
      // If the details modal is open for this user, update its status
      if (detailsUser && detailsUser._id === userId) {
        setDetailsUser((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Failed to update status.",
      });
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleRejectUserSubmit = async () => {
    if (!rejectUserDialogId) return;
    const userId = rejectUserDialogId;
    const reason = rejectUserRemarks.trim();
    if (!reason) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please specify a reason for rejecting the user.",
      });
      return;
    }

    setRejectUserDialogId(null);
    setStatusLoadingId(userId);
    try {
      const res = await updateUserStatus(userId, "rejected", reason);
      if (res.error) throw new Error(res.error);

      toast({
        title: "User Rejected",
        description: `User status has been updated to "rejected" and reason sent.`,
      });

      // Update state locally
      setSiteUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: "rejected", statusRemarks: reason } : u))
      );
      
      // If the details modal is open for this user, update its status
      if (detailsUser && detailsUser._id === userId) {
        setDetailsUser((prev: any) => ({ ...prev, status: "rejected", statusRemarks: reason }));
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: err.message || "Failed to reject user.",
      });
    } finally {
      setStatusLoadingId(null);
      setRejectUserRemarks("");
    }
  };

  const handleViewUserDetail = async (user: any) => {
    setDetailsUser(user);
    setModalSelectedAccountId("all");
    setDetailsLoading(true);
    setDetailsTrades([]);
    setDetailsAccounts([]);
    try {
      const [trades, accounts] = await Promise.all([
        getAdminUserTrades(user._id),
        getAdminUserAccounts(user._id)
      ]);
      setDetailsTrades(trades);
      setDetailsAccounts(accounts);
      if (accounts && accounts.length > 0) {
        setModalSelectedAccountId(accounts[0]._id);
      }
    } catch (err: any) {
      console.error("Failed to load user trades/accounts details:", err);
      toast({
        variant: "destructive",
        title: "Failed to Load Details",
        description: err.message || "Could not load user trade data.",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const result = await approveVerificationRequest(id);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Request Approved",
        description: "User referral status has been verified.",
      });

      setRequests((prev) =>
        prev.map((req) =>
          (req.id || req._id) === id ? { ...req, status: "approved", user: { ...req.user, status: "approved" } } : req
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

      setRequests((prev) =>
        prev.map((req) =>
          (req.id || req._id) === id 
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
    const u = req.user || {};
    const nameMatch = u.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const accountMatch = req.tradingAccountNumber?.includes(searchQuery);
    const telegramMatch = req.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || accountMatch || telegramMatch;

    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStats = (trades: any[]) => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
    const wins = closedTrades.filter((t) => t.pnl > 0);
    const losses = closedTrades.filter((t) => t.pnl < 0);
    
    const total = closedTrades.length;
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    
    const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    
    const grossProfits = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLosses = losses.reduce((acc, t) => acc + Math.abs(t.pnl || 0), 0);
    const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? Infinity : 1;
    
    return {
      total,
      winRate,
      totalPnL,
      winsCount: wins.length,
      lossesCount: losses.length,
      profitFactor,
    };
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Switcher */}
      <div className="flex border-b border-border/30 gap-2">
        <button
          onClick={() => setActiveTab("verifications")}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "verifications"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Referral Operations
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "roles"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Site Users (Approved Only)
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Site Users
        </button>
      </div>

      {/* ─── TAB 1: REFERRAL OPERATIONS ─── */}
      {activeTab === "verifications" && (
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
                    selectedStatus === status
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
                        const u = req.user || {};
                        return (
                          <tr key={req.id || req._id} className="hover:bg-neutral-900/10 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-foreground text-sm">{u.name || "Unknown User"}</span>
                                <span className="text-muted-foreground text-[10px]">{u.email || ""}</span>
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
                                    disabled={actionLoadingId === (req.id || req._id)}
                                    onClick={() => handleApprove(req.id || req._id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase h-7 px-2.5 rounded-lg"
                                  >
                                    {actionLoadingId === (req.id || req._id) ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={actionLoadingId === (req.id || req._id)}
                                    onClick={() => setRejectDialogId(req.id || req._id)}
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
        </div>
      )}

      {/* ─── TAB 2: APPROVED SITE USERS ─── */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          {/* User Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/30 border border-border/40 p-4 rounded-xl backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search approved users by name or email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
                className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
              />
            </div>
            <Button
              size="sm"
              onClick={handleUserSearch}
              className="text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 rounded-lg gap-1.5"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search
            </Button>
          </div>

          {/* User Table List */}
          <Card className="bg-card/30 border-border/50 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-neutral-900/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      <th className="py-4 px-6">Approved User</th>
                      <th className="py-4 px-6">Broker & Account</th>
                      <th className="py-4 px-6">Telegram</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Assign Privileges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-xs">
                    {searching && foundUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-20 text-muted-foreground uppercase font-semibold">
                          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                          Loading approved site users...
                        </td>
                      </tr>
                    ) : foundUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-20 text-muted-foreground uppercase font-semibold">
                          No approved site users found matching query.
                        </td>
                      </tr>
                    ) : (
                      foundUsers.map((u) => {
                        const v = u.verification || {};
                        return (
                          <tr key={u._id} className="hover:bg-neutral-900/10 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-foreground text-sm">{u.name || "N/A"}</span>
                                <span className="text-muted-foreground text-[10px] font-mono">{u.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {v.broker ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold uppercase text-[11px] text-foreground">{v.broker}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">#{v.tradingAccountNumber}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic">Direct Access</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {v.telegramUsername ? (
                                <a
                                  href={`https://t.me/${v.telegramUsername.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline font-semibold text-[11px]"
                                >
                                  <Send className="w-3 h-3 shrink-0" />
                                  <span>{v.telegramUsername}</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <Badge
                                className={`text-[9px] uppercase font-extrabold px-2 py-0.5 border ${
                                  u.role === "admin"
                                    ? "bg-red-500/10 text-red-400 border-red-500/25"
                                    : u.role === "broadcaster"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : u.role === "member"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                    : "bg-neutral-500/10 text-muted-foreground border-border/40"
                                }`}
                              >
                                {u.role || "user"}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-muted-foreground text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {updatingUserId === u._id ? (
                                  <Loader2 className="w-4 h-4 text-primary animate-spin mr-3" />
                                ) : (
                                  <Select
                                    defaultValue={u.role || "user"}
                                    onValueChange={(val) => handleRoleChange(u._id, val)}
                                  >
                                    <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50 border-primary/10">
                                      <SelectValue placeholder="Set Role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card">
                                      <SelectItem value="member" className="text-xs">Member</SelectItem>
                                      <SelectItem value="user" className="text-xs">User (Audience)</SelectItem>
                                      <SelectItem value="broadcaster" className="text-xs">Broadcaster</SelectItem>
                                      <SelectItem value="admin" className="text-xs">Admin (Owner)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
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
        </div>
      )}

      {/* ─── TAB 3: SITE USERS DIRECTORY ─── */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Search, Status and Role Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-card/30 border border-border/40 p-4 rounded-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search by name or email..."
                  value={siteSearch}
                  onChange={(e) => {
                    setSiteSearch(e.target.value);
                    setSiteCurrentPage(1);
                  }}
                  className="pl-9 bg-muted/20 border-primary/10 hover:border-primary/30 transition-all text-xs h-9 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={siteRole}
                  onValueChange={(val) => {
                    setSiteRole(val);
                    setSiteCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px] h-9 text-xs bg-muted/20 border-primary/10">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all" className="text-xs">All Roles</SelectItem>
                    <SelectItem value="user" className="text-xs">User</SelectItem>
                    <SelectItem value="member" className="text-xs">Member</SelectItem>
                    <SelectItem value="broadcaster" className="text-xs">Broadcaster</SelectItem>
                    <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={siteStatus}
                  onValueChange={(val) => {
                    setSiteStatus(val);
                    setSiteCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px] h-9 text-xs bg-muted/20 border-primary/10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="approved" className="text-xs">Approved (Site Access)</SelectItem>
                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="pending" className="text-xs">Waiting (Pending)</SelectItem>
                    <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Sort:</span>
              <Select
                value={siteSortBy}
                onValueChange={(val) => setSiteSortBy(val)}
              >
                <SelectTrigger className="w-[130px] h-9 text-xs bg-muted/20 border-primary/10">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="name" className="text-xs">Name</SelectItem>
                  <SelectItem value="email" className="text-xs">Email</SelectItem>
                  <SelectItem value="status" className="text-xs">Status</SelectItem>
                  <SelectItem value="role" className="text-xs">Role</SelectItem>
                  <SelectItem value="createdAt" className="text-xs">Join Date</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 border-primary/10 bg-muted/20 text-muted-foreground hover:text-foreground"
                onClick={() => setSiteSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* User Data Table */}
          <Card className="bg-card/30 border-border/50 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-neutral-900/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      <th className="py-4 px-6">User Profile</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-xs">
                    {siteLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-muted-foreground uppercase font-semibold">
                          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                          Loading directory...
                        </td>
                      </tr>
                    ) : siteUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-muted-foreground uppercase font-semibold">
                          No site users found matching filters.
                        </td>
                      </tr>
                    ) : (
                      siteUsers.map((u) => (
                        <tr 
                          key={u._id} 
                          className="hover:bg-neutral-900/10 cursor-pointer transition-colors"
                          onClick={() => handleViewUserDetail(u)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-foreground text-sm">{u.name || "N/A"}</span>
                              <span className="text-muted-foreground text-[10px]">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              className={`text-[9px] uppercase font-extrabold px-2 py-0.5 border ${
                                u.role === "admin"
                                  ? "bg-red-500/10 text-red-400 border-red-500/25"
                                  : u.role === "broadcaster"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : u.role === "member"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                  : "bg-neutral-500/10 text-muted-foreground border-border/40"
                              }`}
                            >
                              {u.role || "user"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              className={`text-[9px] uppercase font-extrabold px-2 py-0.5 border ${
                                u.status === "approved"
                                  ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                                  : u.status === "rejected"
                                  ? "bg-red-500/5 text-red-500 border-red-500/20"
                                  : "bg-yellow-500/5 text-yellow-500 border-yellow-500/20"
                              }`}
                            >
                              {u.status === "pending" ? "waiting" : u.status || "waiting"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUserDetail(u)}
                              className="text-[10px] font-bold uppercase h-7 px-2.5 rounded-lg border-primary/20 hover:border-primary/50 text-primary"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {siteTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/40 p-4 bg-neutral-900/10">
                  <span className="text-[11px] text-muted-foreground">
                    Showing page {siteCurrentPage} of {siteTotalPages} ({siteTotalUsers} users total)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={siteCurrentPage === 1 || siteLoading}
                      onClick={() => setSiteCurrentPage((prev) => prev - 1)}
                      className="text-xs border-primary/10"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={siteCurrentPage === siteTotalPages || siteLoading}
                      onClick={() => setSiteCurrentPage((prev) => prev + 1)}
                      className="text-xs border-primary/10"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Details Modal (Stats & Trades) */}
      <Dialog open={!!detailsUser} onOpenChange={(open) => !open && setDetailsUser(null)}>
        <DialogContent className="bg-card border-primary/20 text-foreground sm:max-w-5xl w-full rounded-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
          <DialogHeader className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {detailsUser?.name || "User Details"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono mt-1">
                  ID: {detailsUser?._id} • {detailsUser?.email}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 border ${
                    detailsUser?.role === "admin"
                      ? "bg-red-500/10 text-red-400 border-red-500/25"
                      : detailsUser?.role === "broadcaster"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : detailsUser?.role === "member"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-neutral-500/10 text-muted-foreground border-border/40"
                  }`}
                >
                  {detailsUser?.role || "user"}
                </Badge>
                <Badge
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 border ${
                    detailsUser?.status === "approved"
                      ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                      : detailsUser?.status === "rejected"
                      ? "bg-red-500/5 text-red-500 border-red-500/20"
                      : "bg-yellow-500/5 text-yellow-500 border-yellow-500/20"
                  }`}
                >
                  {detailsUser?.status === "pending" ? "waiting" : detailsUser?.status || "waiting"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {detailsLoading ? (
            <div className="py-20 text-center text-muted-foreground uppercase font-black">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              Retrieving User Trade Data...
            </div>
          ) : (
            (() => {
              const visibleTrades = modalSelectedAccountId === "all"
                ? detailsTrades
                : detailsTrades.filter((t) => String(t.broker_account_id || t.brokerAccountId || "") === String(modalSelectedAccountId));
              const stats = getStats(visibleTrades);
              return (
                <div className="space-y-6">
                  {/* Account Tabs Selector */}
                  {detailsAccounts.length > 0 && (
                    <div className="flex border-b border-border/20 gap-2 overflow-x-auto pb-1">
                      {detailsAccounts.map((acc: any) => (
                        <button
                          key={acc._id}
                          onClick={() => setModalSelectedAccountId(acc._id)}
                          className={`px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 shrink-0 ${
                            modalSelectedAccountId === acc._id
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {acc.brokerType.toUpperCase()} ({acc.accountId})
                        </button>
                      ))}
                      <button
                        onClick={() => setModalSelectedAccountId("all")}
                        className={`px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 shrink-0 ${
                          modalSelectedAccountId === "all"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All Combined
                      </button>
                    </div>
                  )}

                  {/* Account Details Banner */}
                  {(() => {
                    const selectedAccount = detailsAccounts.find((a) => a._id === modalSelectedAccountId);
                    if (!selectedAccount) return null;
                    return (
                      <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Active Broker Account</div>
                          <div className="text-base font-black uppercase text-foreground mt-0.5">{selectedAccount.brokerType}</div>
                          <div className="text-xs font-mono font-bold text-muted-foreground mt-0.5">Account ID: {selectedAccount.accountId}</div>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-muted-foreground">Balance</span>
                            <span className="text-base font-black font-mono text-primary">${selectedAccount.balance?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-muted-foreground">Equity</span>
                            <span className="text-base font-black font-mono text-foreground">${selectedAccount.equity?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-muted-foreground">Status</span>
                            <Badge className="text-[8px] uppercase font-bold py-0 px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                              {selectedAccount.status || "connected"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Performance Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card/20 border-border/40">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                          Win Rate
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className="text-2xl font-black text-primary font-mono">
                          {stats.winRate.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {stats.winsCount} Wins / {stats.lossesCount} Losses
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/20 border-border/40">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                          Net P&L
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className={`text-2xl font-black font-mono ${stats.totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {modalSelectedAccountId === "all" ? "Across all accounts" : "Selected account"}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/20 border-border/40">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                          Profit Factor
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className="text-2xl font-black font-mono text-foreground">
                          {stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Gross Win / Gross Loss
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/20 border-border/40">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                          Total Trades
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className="text-2xl font-black font-mono text-foreground">
                          {visibleTrades.length}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {stats.total} closed / {visibleTrades.length - stats.total} open
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Accounts Section (Only visible when All Combined is active) */}
                  {modalSelectedAccountId === "all" && (
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-primary" />
                        Broker Accounts ({detailsAccounts.length})
                      </h4>
                      {detailsAccounts.length === 0 ? (
                        <div className="p-4 border border-dashed border-border/40 rounded-xl text-center text-xs text-muted-foreground">
                          No linked broker accounts found for this user.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {detailsAccounts.map((acc: any) => (
                            <div key={acc._id} className="p-3 border border-border/30 bg-muted/10 rounded-xl flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="font-extrabold uppercase text-[11px]">{acc.brokerType}</span>
                                  <Badge className="text-[8px] uppercase font-bold py-0 px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {acc.status || "connected"}
                                  </Badge>
                                </div>
                                <div className="text-xs font-mono font-bold text-muted-foreground">
                                  ID: {acc.accountId}
                                </div>
                              </div>
                              <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Balance</span>
                                  <span className="text-xs font-bold font-mono text-foreground">${acc.balance?.toFixed(2) || "0.00"}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Equity</span>
                                  <span className="text-xs font-bold font-mono text-foreground">${acc.equity?.toFixed(2) || "0.00"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trade History Section */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Trade History ({visibleTrades.length})
                    </h4>
                    {visibleTrades.length === 0 ? (
                      <div className="p-6 border border-dashed border-border/40 rounded-xl text-center text-xs text-muted-foreground">
                        No trades registered in journal.
                      </div>
                    ) : (
                      <div className="border border-border/40 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border/45 bg-neutral-900/40 text-[9px] uppercase font-black tracking-widest text-muted-foreground sticky top-0 backdrop-blur-md">
                              <th className="py-2.5 px-4">Date</th>
                              <th className="py-2.5 px-4">Asset</th>
                              <th className="py-2.5 px-4">Type</th>
                              <th className="py-2.5 px-4">Entry</th>
                              <th className="py-2.5 px-4">Exit</th>
                              <th className="py-2.5 px-4">P&L ($)</th>
                              <th className="py-2.5 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20 text-[11px]">
                            {visibleTrades.map((t: any) => {
                              const isWin = t.pnl > 0;
                              const isLoss = t.pnl < 0;
                              return (
                                <tr key={t.id} className="hover:bg-neutral-900/10 transition-colors">
                                  <td className="py-2 px-4 text-muted-foreground font-mono">{t.entry_date}</td>
                                  <td className="py-2 px-4 font-bold uppercase text-foreground">{t.symbol}</td>
                                  <td className="py-2 px-4">
                                    <span className={`uppercase font-bold text-[9px] px-1 py-0.5 rounded ${
                                      t.trade_type === "long" ? "text-blue-400 bg-blue-500/10" : "text-amber-500 bg-amber-500/10"
                                    }`}>
                                      {t.trade_type}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 font-mono">${t.entry_price?.toFixed(2)}</td>
                                  <td className="py-2 px-4 font-mono">{t.exit_price ? `$${t.exit_price.toFixed(2)}` : "—"}</td>
                                  <td className="py-2 px-4 font-mono font-bold">
                                    {t.pnl !== null ? (
                                      <span className={isWin ? "text-emerald-500" : isLoss ? "text-red-500" : "text-muted-foreground"}>
                                        {isWin ? "+" : ""}{t.pnl.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-4">
                                    <Badge className={`text-[8px] uppercase font-bold px-1.5 py-0 border ${
                                      t.status === "closed"
                                        ? "bg-neutral-500/5 text-muted-foreground border-border/40"
                                        : "bg-blue-500/5 text-blue-400 border-blue-500/20"
                                    }`}>
                                      {t.status}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}

          <DialogFooter className="pt-4 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailsUser(null)}
              className="text-xs uppercase font-bold border-primary/10"
            >
              Close Panel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Remarks Dialog */}
      <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
        <DialogContent className="bg-card border-primary/20 text-foreground sm:max-w-sm w-full rounded-2xl relative overflow-hidden">
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

      {/* Reject User Remarks Dialog */}
      <Dialog open={!!rejectUserDialogId} onOpenChange={() => setRejectUserDialogId(null)}>
        <DialogContent className="bg-card border-primary/20 text-foreground sm:max-w-sm w-full rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-destructive" />
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Reject User Access</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a reason for rejecting this user (this will be emailed to the user).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="userRemarks" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rejection Reason
              </Label>
              <Input
                id="userRemarks"
                placeholder="e.g. Account details mismatched with verification system."
                value={rejectUserRemarks}
                onChange={(e) => setRejectUserRemarks(e.target.value)}
                className="bg-muted/30 border-primary/20 hover:border-primary/45 transition-all text-xs rounded-lg h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejectUserDialogId(null)}
              className="text-xs uppercase font-bold text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectUserSubmit}
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
