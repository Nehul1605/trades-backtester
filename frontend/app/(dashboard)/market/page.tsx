"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { LiveKitRoom } from "@livekit/components-react";
import {
  Radio,
  Plus,
  Tv,
  Calendar,
  Users,
  Shield,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LiveMarketStage } from "@/components/live-market/LiveMarketStage";
import { CoHostModal } from "@/components/live-market/CoHostModal";
import { CreateSessionModal } from "@/components/live-market/CreateSessionModal";

export default function LiveMarketPage() {
  const { data: session, status: authStatus } = useSession();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [isHostOrCoHost, setIsHostOrCoHost] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [livekitUrl, setLivekitUrl] = useState<string>("");

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [connectingLivekit, setConnectingLivekit] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCoHostModalOpen, setIsCoHostModalOpen] = useState(false);

  const userToken = (session?.user as any)?.accessToken;

  // Fetch all sessions from Express backend (filters out ended sessions)
  const fetchSessions = useCallback(async () => {
    if (!userToken) return [];
    try {
      setLoadingSessions(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const activeOnly = data.filter((s: any) => s.status !== "ended");
        setSessions(activeOnly);

        // Auto-select the first live session if none selected
        if (activeOnly.length === 0) {
          setActiveSession(null);
          setLivekitToken(null);
        } else if (!activeSession) {
          const live = activeOnly.find((s: any) => s.status === "live") || activeOnly[0];
          setActiveSession(live);
        }
        return activeOnly;
      }
    } catch (err) {
      console.error("Failed to fetch live market sessions:", err);
      toast.error("Failed to load live sessions");
    } finally {
      setLoadingSessions(false);
    }
    return [];
  }, [userToken, activeSession]);

  useEffect(() => {
    if (authStatus === "authenticated" && userToken) {
      fetchSessions();
    }
  }, [authStatus, userToken]);

  // Connect to LiveKit when active session is selected
  const joinSession = async (sess: any) => {
    if (!userToken || !sess?._id) return;
    setActiveSession(sess);
    setConnectingLivekit(true);
    setLivekitToken(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions/${sess._id}/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch stream token");
      }

      const data = await res.json();
      setLivekitToken(data.token);
      setIsHostOrCoHost(data.isHostOrCoHost);
      setIsHost(data.isHost);
      setLivekitUrl(
        data.livekitUrl ||
          process.env.NEXT_PUBLIC_LIVEKIT_URL ||
          "wss://demo.livekit.cloud"
      );
    } catch (err: any) {
      console.error("Error joining live stream:", err);
      toast.error(err.message || "Failed to join live stream");
    } finally {
      setConnectingLivekit(false);
    }
  };

  useEffect(() => {
    if (activeSession && userToken && !livekitToken && !connectingLivekit) {
      joinSession(activeSession);
    }
  }, [activeSession, userToken]);

  // Start Stream API
  const handleStartStream = async () => {
    if (!activeSession?._id || !userToken) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions/${activeSession._id}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setActiveSession(updated);
        toast.success("Stream Started! You are live.");
        fetchSessions();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to start stream");
      }
    } catch (err) {
      toast.error("Failed to start live stream");
    }
  };

  // End Stream API
  const handleEndStream = async () => {
    if (!activeSession?._id || !userToken) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/live-sessions/${activeSession._id}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (res.ok) {
        setActiveSession(null);
        setLivekitToken(null);
        toast.info("Session Ended");
        const remaining = await fetchSessions();
        if (remaining && remaining.length > 0) {
          joinSession(remaining[0]);
        }
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to end stream");
      }
    } catch (err) {
      toast.error("Failed to end live stream");
    }
  };


  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">
              Live <span className="text-primary not-italic">Market</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Ultra-low-latency WebRTC live stream, chart sharing, and order flow breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            className="rounded-full text-xs font-bold gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="rounded-full px-5 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
          >
            <Plus className="w-4 h-4" /> Go Live / Schedule
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT: ACTIVE STAGE OR LOADING STATE */}
      {activeSession && livekitToken ? (
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={livekitToken}
          connect={true}
          video={false} // Managed interactively by host inside controls toolbar
          audio={false}
          data-lk-theme="default"
          className="w-full"
        >
          <LiveMarketStage
            sessionData={activeSession}
            isHostOrCoHost={isHostOrCoHost}
            isHost={isHost}
            onStartStream={handleStartStream}
            onEndStream={handleEndStream}
            onOpenCoHostModal={() => setIsCoHostModalOpen(true)}
          />
        </LiveKitRoom>
      ) : connectingLivekit ? (
        <Card className="w-full h-[500px] bg-card/40 border-border/50 flex flex-col items-center justify-center text-center p-8 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Connecting to LiveKit WebRTC Server...
          </p>
        </Card>
      ) : (
        /* NO SESSION SELECTED / SETUP PROMPT */
        <Card className="w-full h-[350px] bg-card/40 border-border/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 space-y-4">
          <Tv className="w-12 h-12 text-primary/60" />
          <h3 className="text-xl font-bold uppercase tracking-tight">
            No Active Stream Selected
          </h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Select a live market stream from the directory below or create your own room to start broadcasting.
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="rounded-full px-6 font-bold uppercase text-xs"
          >
            Create First Session
          </Button>
        </Card>
      )}

      {/* SESSIONS DIRECTORY & UPCOMING ROOMS */}
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Active & Scheduled Sessions
          </h3>
          <Badge variant="outline" className="text-[11px]">
            {sessions.length} Session{sessions.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {loadingSessions ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : sessions.filter((s) => s.status !== "ended").length === 0 ? (
          <Card className="p-8 text-center bg-card/30 border-border/40 text-muted-foreground text-xs">
            No market sessions scheduled. Be the first to start a live stream!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions
              .filter((sess) => sess.status !== "ended")
              .map((sess) => {
                const isSelected = activeSession?._id === sess._id;
                const isLive = sess.status === "live";

                return (
                  <Card
                    key={sess._id}
                    onClick={() => joinSession(sess)}
                    className={`p-5 bg-card/50 border transition-all cursor-pointer group hover:border-primary/50 relative overflow-hidden ${
                      isSelected ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                          {sess.category || "Market Analysis"}
                        </span>
                        <h4 className="font-bold text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {sess.title}
                        </h4>
                      </div>

                      {isLive ? (
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-[10px] font-bold uppercase animate-pulse shrink-0">
                          LIVE
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/40 text-[10px] font-bold uppercase shrink-0">
                          SCHEDULED
                        </Badge>
                      )}
                    </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                    {sess.description || "Live market session for chart analysis and strategy."}
                  </p>

                  {sess.scheduledAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(sess.scheduledAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                        IST
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/30 pt-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Host: {sess.host?.name || "Trader"}</span>
                    </div>

                    {sess.coHosts?.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <Shield className="w-3 h-3" /> {sess.coHosts.length} Co-Host
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={(newSess) => {
          fetchSessions();
          joinSession(newSess);
        }}
      />

      <CoHostModal
        isOpen={isCoHostModalOpen}
        onClose={() => setIsCoHostModalOpen(false)}
        sessionData={activeSession}
        onCoHostUpdated={() => {
          if (activeSession) joinSession(activeSession);
        }}
      />
    </div>
  );
}
