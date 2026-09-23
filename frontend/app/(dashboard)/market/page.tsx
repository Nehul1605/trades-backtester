"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Headphones,
  Play,
  Volume2,
  Maximize2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LiveMarketStage } from "@/components/live-market/LiveMarketStage";
import { CoHostModal } from "@/components/live-market/CoHostModal";
import { CreateSessionModal } from "@/components/live-market/CreateSessionModal";
import { useLiveMeeting } from "@/components/live-market/LiveMeetingProvider";
import { useSession } from "next-auth/react";
import { FeatureLockedOverlay } from "@/components/dashboard/feature-locked-overlay";
import { streamSFX } from "@/lib/soundEffects";

export default function LiveMarketPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = (session?.user as any)?.role;
  const membershipTag = (session?.user as any)?.membershipTag;
  const isHQMember = role === "admin" || membershipTag === "OPERATOR HQ";

  const {
    sessions,
    activeSession,
    livekitToken,
    isConnected,
    isHostOrCoHost,
    isHost,
    isBroadcaster,
    loadingSessions,
    connectingLivekit,
    fetchSessions,
    joinSession,
    handleStartStream,
    handleEndStream,
    isMinimized,
    setIsMinimized,
  } = useLiveMeeting();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCoHostModalOpen, setIsCoHostModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const channelParam = searchParams.get("channel") || "ttp";
  const [activeChannel, setActiveChannel] = useState<"ttp" | "hq">(
    channelParam === "hq" ? "hq" : "ttp"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (channelParam === "hq") {
      setActiveChannel("hq");
    } else {
      setActiveChannel("ttp");
    }
  }, [channelParam]);

  const switchChannel = (ch: "ttp" | "hq") => {
    setActiveChannel(ch);
    router.push(`/market?channel=${ch}`);
  };

  const liveSessions = sessions.filter((s: any) => s.status !== "ended");
  const filteredSessions = liveSessions.filter((s: any) =>
    activeChannel === "hq"
      ? s.targetAudience === "HQ"
      : !s.targetAudience || s.targetAudience === "TTP"
  );
  const primaryLiveSession =
    filteredSessions.find((s: any) => s.status === "live") || filteredSessions[0];

  const handleUserJoin = (sess: any) => {
    streamSFX.playJoinButtonClickSound();
    setIsMinimized(false);
    joinSession(sess);
  };

  // Horizontal scroll ref
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">
              Live <span className="text-primary not-italic">Market Stream</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Ultra-low-latency WebRTC live stream, chart sharing, and real-time audio stage.
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

      {/* CHANNEL SELECTOR TABS */}
      <div className="flex items-center gap-3 p-1.5 bg-card/60 border border-border/50 rounded-2xl w-fit backdrop-blur-md">
        <button
          onClick={() => switchChannel("ttp")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeChannel === "ttp"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          🌐 TTP Community Stream
        </button>

        <button
          onClick={() => switchChannel("hq")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeChannel === "hq"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          🛡️ Operator HQ Stream
          {!isHQMember && (
            <Lock className="w-3 h-3 ml-1 text-muted-foreground/70" />
          )}
        </button>
      </div>

      {/* MINIMIZED NOTIFICATION BANNER IF MINIMIZED ON MARKET PAGE */}
      {isConnected && activeSession && isMinimized && (
        <Card className="p-4 bg-primary/10 border-primary/40 flex items-center justify-between gap-4 rounded-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center animate-pulse">
              <Radio className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-foreground">
                Connected to: {activeSession.title} (Minimized)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Live audio and video are playing in the floating mini player.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsMinimized(false)}
            size="sm"
            className="rounded-full px-4 text-xs font-bold uppercase bg-primary text-primary-foreground gap-1.5 shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Restore Full Stage
          </Button>
        </Card>
      )}

      {/* IF ON HQ CHANNEL AND USER IS NOT AN HQ MEMBER -> SHOW LOCKED OVERLAY */}
      {activeChannel === "hq" && !isHQMember ? (
        <Card className="w-full relative overflow-hidden bg-card/80 border border-amber-500/30 p-8 md:p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <div className="max-w-lg space-y-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs font-black uppercase tracking-wider px-3 py-1">
              Operator HQ Exclusive Channel
            </Badge>
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
              Exclusive for Operator HQ Members
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              This live stream channel is reserved exclusively for traders verified through our partnered broker referral. Paying / standard subscribers can enjoy our main <strong>TTP Community Stream</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => switchChannel("ttp")}
              className="rounded-full px-6 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              Switch to TTP Stream <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/verification")}
              className="rounded-full px-6 text-xs font-bold uppercase tracking-wider border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              Verify Broker for Free HQ Access
            </Button>
          </div>
        </Card>
      ) : activeSession && livekitToken && isConnected && !isMinimized ? (
        /* MAIN CONTENT: ACTIVE STAGE */
        <LiveMarketStage
          sessionData={activeSession}
          isHostOrCoHost={isHostOrCoHost}
          isHost={isHost}
          onStartStream={handleStartStream}
          onEndStream={handleEndStream}
          onOpenCoHostModal={() => setIsCoHostModalOpen(true)}
        />
      ) : connectingLivekit ? (
        <Card className="w-full h-[450px] bg-card/40 border-border/50 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">
              LIVE
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-wider text-foreground">
              Connecting to Live Stream Stage...
            </h3>
            <p className="text-xs text-muted-foreground">
              Negotiating WebRTC audio channels and video tracks...
            </p>
          </div>
        </Card>
      ) : primaryLiveSession ? (
        /* PROMINENT USER JOIN STREAM HERO CARD */
        <Card className={`w-full relative overflow-hidden p-6 md:p-10 rounded-2xl backdrop-blur-xl shadow-2xl border ${
          primaryLiveSession.targetAudience === "HQ"
            ? "bg-gradient-to-br from-card/90 via-card/70 to-amber-500/10 border-amber-500/40 shadow-amber-500/10"
            : "bg-gradient-to-br from-card/90 via-card/70 to-primary/5 border-primary/30 shadow-primary/10"
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5 px-3 py-1">
                <Radio className="w-3.5 h-3.5" /> LIVE NOW
              </Badge>
              <Badge variant="outline" className={`text-xs font-bold uppercase tracking-wider ${
                primaryLiveSession.targetAudience === "HQ"
                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                  : "border-primary/40 text-primary bg-primary/10"
              }`}>
                {primaryLiveSession.targetAudience === "HQ" ? "🛡️ Operator HQ Exclusive" : "🌐 TTP Community"}
              </Badge>
              <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider border-border/50 text-muted-foreground">
                {primaryLiveSession.category || "General Analysis"}
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
                {primaryLiveSession.title}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {primaryLiveSession.description ||
                  "Live trading room session is currently broadcasting. Join the stage to listen to market breakdowns, real-time setups, and collaborative discussions."}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">Host:</span> {primaryLiveSession.host?.name || "Trader"}
              </div>
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Ultra Low Latency Audio</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => handleUserJoin(primaryLiveSession)}
                className={`rounded-full px-8 py-6 text-sm font-black uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all gap-2.5 cursor-pointer ${
                  primaryLiveSession.targetAudience === "HQ"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/25"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
                }`}
              >
                <Headphones className="w-5 h-5" /> Join Live Stream
              </Button>

              {mounted && isBroadcaster && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-full px-6 py-6 text-xs font-bold uppercase tracking-wider border-border/60 hover:border-primary/50"
                >
                  Start New Stream
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="w-full h-[320px] bg-card/40 border-border/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 space-y-4">
          <Tv className="w-12 h-12 text-primary/60" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold uppercase tracking-tight">
              No Active {activeChannel === "hq" ? "Operator HQ" : "TTP"} Stream
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              {mounted && isBroadcaster
                ? `Start a direct live broadcast room on the ${activeChannel === "hq" ? "Operator HQ" : "TTP Community"} channel below.`
                : `No live stream is broadcasting on this channel right now. Check back soon or switch channels.`}
            </p>
          </div>
          {mounted && isBroadcaster && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="rounded-full px-6 font-bold uppercase text-xs"
            >
              Go Live on {activeChannel === "hq" ? "HQ" : "TTP"} Now
            </Button>
          )}
        </Card>
      )}

      {/* HORIZONTAL SESSION STRIP */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Active Broadcasts
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">
              {liveSessions.length} Stream{liveSessions.length !== 1 ? "s" : ""}
            </Badge>
            {liveSessions.length > 3 && (
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
        ) : liveSessions.length === 0 ? (
          <Card className="p-6 text-center bg-card/30 border-border/40 text-muted-foreground text-xs">
            {isBroadcaster
              ? "No active live streams. Be the first to start a live broadcast!"
              : "No live streams available right now. Check back soon!"}
          </Card>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent"
          >
            {liveSessions.map((sess: any) => {
              const isCurrentlyActive = activeSession?._id === sess._id && isConnected;
              const isHQSession = sess.targetAudience === "HQ";
              const canJoinThisSession = !isHQSession || isHQMember;

              return (
                <div
                  key={sess._id}
                  className={`min-w-[260px] max-w-[280px] shrink-0 snap-start p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isCurrentlyActive
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/15 ring-1 ring-primary"
                      : "border-border/50 bg-card/50 hover:border-primary/50"
                  }`}
                >
                  <div>
                    {/* Top: Category + Target Audience + Status */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded truncate ${
                        isHQSession
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {isHQSession ? "🛡️ HQ" : "🌐 TTP"}
                      </span>
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-[9px] font-bold uppercase shrink-0 animate-pulse px-1.5 py-0">
                        LIVE
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xs uppercase tracking-tight text-foreground line-clamp-1 mb-1">
                      {sess.title}
                    </h4>

                    {/* Host */}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3 text-primary" />
                      <span>Host: {sess.host?.name || "Trader"}</span>
                    </p>
                  </div>

                  {/* Action row: Join or Currently Watching */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                    {isCurrentlyActive ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold uppercase gap-1 py-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        Watching Now
                      </Badge>
                    ) : canJoinThisSession ? (
                      <Button
                        size="sm"
                        onClick={() => handleUserJoin(sess)}
                        className={`h-7 px-3 text-[10px] font-bold uppercase rounded-full gap-1 shadow-sm ${
                          isHQSession
                            ? "bg-amber-500 hover:bg-amber-600 text-black font-black"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" /> Join Stream
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/40 gap-1 py-0.5">
                        <Lock className="w-3 h-3" /> HQ Only
                      </Badge>
                    )}
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
          defaultAudience={activeChannel === "hq" ? "HQ" : "TTP"}
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


