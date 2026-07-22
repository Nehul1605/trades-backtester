"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Plus,
  Tv,
  Users,
  Shield,
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LiveMarketStage } from "@/components/live-market/LiveMarketStage";
import { CoHostModal } from "@/components/live-market/CoHostModal";
import { CreateSessionModal } from "@/components/live-market/CreateSessionModal";
import { LiveMeetingWrapper } from "@/components/live-market/LiveMeetingWrapper";
import { useLiveMeeting } from "@/components/live-market/LiveMeetingProvider";
import { LiveKitRoom } from "@livekit/components-react";

export default function LiveMarketPage() {
  const {
    sessions,
    activeSession,
    livekitToken,
    isHostOrCoHost,
    isHost,
    isBroadcaster,
    loadingSessions,
    connectingLivekit,
    fetchSessions,
    joinSession,
    handleStartStream,
    handleEndStream,
    room,
  } = useLiveMeeting();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCoHostModalOpen, setIsCoHostModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select session on load if none active
  useEffect(() => {
    if (!mounted) return;
    if (!activeSession && sessions.length > 0) {
      const live =
        sessions.find((s: any) => s.status === "live") || sessions[0];
      joinSession(live);
    }
  }, [sessions, mounted]);

  // Horizontal scroll ref
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">
              Live <span className="text-primary not-italic">Market</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Ultra-low-latency WebRTC live stream, chart sharing, and order flow
            breakdown.
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

          {/* Only broadcasters / admins see the Go Live button */}
          {mounted && isBroadcaster && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="rounded-full px-5 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
            >
              <Plus className="w-4 h-4" /> Go Live
            </Button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT: ACTIVE STAGE */}
      {activeSession && livekitToken && room ? (
        <LiveKitRoom room={room} data-lk-theme="default">
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
        <Card className="w-full h-[350px] bg-card/40 border-border/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 space-y-4">
          <Tv className="w-12 h-12 text-primary/60" />
          <h3 className="text-xl font-bold uppercase tracking-tight">
            No Active Stream
          </h3>
          <p className="text-xs text-muted-foreground max-w-md">
            {mounted && isBroadcaster
              ? "Start a direct live stream room below to begin broadcasting."
              : "Waiting for the host to start a live session. Choose an active stream below to join."}
          </p>
          {mounted && isBroadcaster && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="rounded-full px-6 font-bold uppercase text-xs"
            >
              Go Live Now
            </Button>
          )}
        </Card>
      )}

      {/* HORIZONTAL SESSION STRIP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Active Streams
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">
              {sessions.length} Stream{sessions.length !== 1 ? "s" : ""}
            </Badge>
            {sessions.length > 3 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  onClick={scrollRight}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {loadingSessions ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : sessions.filter((s: any) => s.status !== "ended").length === 0 ? (
          <Card className="p-6 text-center bg-card/30 border-border/40 text-muted-foreground text-xs">
            {isBroadcaster
              ? "No active live streams. Be the first to start a live stream!"
              : "No live streams available right now. Check back soon!"}
          </Card>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent"
          >
            {sessions
              .filter((sess: any) => sess.status !== "ended")
              .map((sess: any) => {
                const isSelected = activeSession?._id === sess._id;

                return (
                  <div
                    key={sess._id}
                    onClick={() => joinSession(sess)}
                    className={`min-w-[240px] max-w-[260px] shrink-0 snap-start p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 group ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-card/50"
                    }`}
                  >
                    {/* Top: Category + Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded truncate">
                        {sess.category || "Analysis"}
                      </span>
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-[9px] font-bold uppercase shrink-0 animate-pulse px-1.5 py-0">
                        LIVE
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xs uppercase tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
                      {sess.title}
                    </h4>

                    {/* Meta row */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-primary" />
                        {sess.host?.name || "Trader"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* MODALS — Only rendered for broadcasters */}
      {isBroadcaster && (
        <CreateSessionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSessionCreated={(newSess: any) => {
            fetchSessions();
            joinSession(newSess);
          }}
        />
      )}

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
