"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  useTracks,
  VideoTrack,
  AudioTrack,
  RoomAudioRenderer,
  useLocalParticipant,
  useRemoteParticipants,
  useDataChannel,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorOff,
  Users,
  Shield,
  MessageSquare,
  Square,
  UserCheck,
  Radio,
  Maximize2,
  Minimize2,
  Minus,
  Volume1,
  Volume2,
  VolumeX,
  Loader2,
  LogOut,
  Send,
  Crown,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { streamSFX } from "@/lib/soundEffects";
import { useLiveMeeting } from "./LiveMeetingProvider";


interface LiveMarketStageProps {
  sessionData: any;
  isHostOrCoHost: boolean;
  isHost: boolean;
  onStartStream: () => void;
  onEndStream: () => void;
  onOpenCoHostModal: () => void;
}

export function LiveMarketStage({
  sessionData,
  isHostOrCoHost,
  isHost,
  onStartStream,
  onEndStream,
  onOpenCoHostModal,
}: LiveMarketStageProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { setIsMinimized, leaveSession } = useLiveMeeting();

  // Local state for media toggles
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isMicLoading, setIsMicLoading] = useState(false);
  const [isCamLoading, setIsCamLoading] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  const toggleTab = (tab: "chat" | "participants") => {
    if (activeTab === tab && showSidebar) {
      setShowSidebar(false);
    } else {
      setActiveTab(tab);
      setShowSidebar(true);
    }
  };

  const { data: session } = useSession();
  const userToken = (session?.user as any)?.accessToken;

  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ messageId?: string; sender: string; text: string; time: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  // Per-participant voice volume state (10% to 100% scale)
  const [userVolumes, setUserVolumes] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("live_stream_user_volumes");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch stored chat history from backend on session mount
  useEffect(() => {
    if (!sessionData?._id || !userToken) return;

    const fetchChatHistory = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
        const res = await fetch(`${BACKEND_URL}/api/live-sessions/${sessionData._id}/messages`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const formatted: Array<{ messageId: string; sender: string; text: string; time: string }> = [];
          data.forEach((m: any) => {
            const mId = m.messageId || m._id || `msg_${Math.random()}`;
            seenMessageIdsRef.current.add(mId);
            formatted.push({
              messageId: mId,
              sender: m.sender || "Trader",
              text: m.text,
              time: m.time || new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
          });
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load live chat history:", err);
      }
    };

    fetchChatHistory();
  }, [sessionData?._id, userToken]);

  // Synchronize React states with actual track states of localParticipant on mount / changes
  useEffect(() => {
    if (localParticipant) {
      setIsMicOn(localParticipant.isMicrophoneEnabled);
      setIsCamOn(localParticipant.isCameraEnabled);
      setIsScreenSharing(localParticipant.isScreenShareEnabled);
    }
  }, [localParticipant]);

  useEffect(() => {
    if (!room) return;
    const triggerRefresh = () => {
      setRefreshCounter((prev) => prev + 1);
    };

    room.on("trackMuted", triggerRefresh);
    room.on("trackUnmuted", triggerRefresh);
    room.on("trackSubscribed", triggerRefresh);
    room.on("trackUnsubscribed", triggerRefresh);
    room.on("participantConnected", triggerRefresh);
    room.on("participantDisconnected", triggerRefresh);

    return () => {
      room.off("trackMuted", triggerRefresh);
      room.off("trackUnmuted", triggerRefresh);
      room.off("trackSubscribed", triggerRefresh);
      room.off("trackUnsubscribed", triggerRefresh);
      room.off("participantConnected", triggerRefresh);
      room.off("participantDisconnected", triggerRefresh);
    };
  }, [room]);

  // Synchronize per-participant voice volumes to LiveKit WebRTC Audio Tracks
  useEffect(() => {
    remoteParticipants.forEach((p) => {
      const volPercent = userVolumes[p.identity] ?? 100;
      p.audioTrackPublications.forEach((pub) => {
        if (pub.track) {
          (pub.track as any).setVolume?.(volPercent / 100);
        }
      });
    });
  }, [remoteParticipants, userVolumes, refreshCounter]);

  const handleParticipantVolumeChange = useCallback((identity: string, volPercent: number) => {
    const targetVol = Math.max(10, Math.min(100, volPercent));
    setUserVolumes((prev) => {
      const updated = { ...prev, [identity]: targetVol };
      try {
        localStorage.setItem("live_stream_user_volumes", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const p = remoteParticipants.find((rp) => rp.identity === identity);
    if (p) {
      p.audioTrackPublications.forEach((pub) => {
        if (pub.track) {
          (pub.track as any).setVolume?.(targetVol / 100);
        }
      });
    }
  }, [remoteParticipants]);

  // Stream audio volume for viewers
  const [isMuted, setIsMuted] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Setup Data Channel for Live Chat
  const { send, message } = useDataChannel("chat");

  const handleModerationCommand = useCallback(async (cmd: any) => {
    // Only target local participant
    const target = cmd.targetIdentity;
    if (target === localParticipant.identity || target === "all") {
      // Don't mute the host themselves on "all"
      if (target === "all" && isHost) return;

      try {
        if (cmd.action === "mute") {
          if (!localParticipant.isMicrophoneEnabled) return;
          await localParticipant.setMicrophoneEnabled(false);
          setIsMicOn(false);
          streamSFX.playMuteSound();
          toast.info("The host has muted your microphone.");
        } else if (cmd.action === "unmute") {
          if (localParticipant.isMicrophoneEnabled) return;
          toast("The host requested you to unmute your microphone.", {
            action: {
              label: "Unmute",
              onClick: async () => {
                if (isMicLoading) return;
                setIsMicLoading(true);
                try {
                  await localParticipant.setMicrophoneEnabled(true);
                  setIsMicOn(true);
                  streamSFX.playUnmuteSound();
                  toast.success("Microphone Unmuted");
                } catch (err: any) {
                  toast.error("Failed to unmute: " + (err.message || err));
                } finally {
                  setIsMicLoading(false);
                }
              }
            },
            duration: 10000,
          });
        }
      } catch (err: any) {
        console.error("Failed to run remote moderation command:", err);
      }
    }
  }, [localParticipant, isHost, isMicLoading]);

  const sendModerationCommand = (action: "mute" | "unmute", targetIdentity: string) => {
    if (!isHostOrCoHost) return;

    const packet = {
      type: "moderation",
      action,
      targetIdentity,
      sender: localParticipant?.name || localParticipant?.identity || "Host",
    };

    try {
      const encoded = new TextEncoder().encode(JSON.stringify(packet));
      send(encoded, { reliable: true });
      if (action === "mute") {
        streamSFX.playMuteSound();
      } else {
        streamSFX.playUnmuteSound();
      }
      if (targetIdentity === "all") {
        toast.success(`Requested everyone to ${action}.`);
      } else {
        toast.success(`Requested participant to ${action}.`);
      }
    } catch (err) {
      console.error("Failed to send moderation command:", err);
    }
  };

  // Receive DataChannel messages with strict ID deduplication & proper TextDecoder
  useEffect(() => {
    if (!message) return;
    try {
      let decoded = "";
      const rawPayload = message.payload as any;
      if (typeof rawPayload === "string") {
        decoded = rawPayload;
      } else if (rawPayload instanceof Uint8Array || rawPayload instanceof ArrayBuffer) {
        decoded = new TextDecoder().decode(rawPayload);
      } else {
        decoded = new TextDecoder().decode(new Uint8Array(rawPayload));
      }

      const parsed = JSON.parse(decoded);
      if (parsed.type === "moderation") {
        handleModerationCommand(parsed);
      } else {
        const msgId = parsed.messageId || parsed.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        if (seenMessageIdsRef.current.has(msgId)) {
          return; // Ignore duplicate
        }
        seenMessageIdsRef.current.add(msgId);
        setMessages((prev) => {
          if (prev.some((m: any) => (m.messageId || m.id) === msgId)) {
            return prev;
          }
          return [...prev, { ...parsed, messageId: msgId }];
        });
      }
    } catch (err) {
      console.error("Failed to parse chat message", err);
    }
  }, [message, handleModerationCommand]);

  // Periodic background polling sync every 3 seconds
  // Ensures 100% reliable chat delivery across mobile and desktop even if WebRTC drops or packets jitter
  useEffect(() => {
    if (!sessionData?._id || !userToken) return;

    const syncChatHistory = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
        const res = await fetch(`${BACKEND_URL}/api/live-sessions/${sessionData._id}/messages`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages((prev) => {
              let hasNew = false;
              const next = [...prev];
              data.forEach((m: any) => {
                const mId = m.messageId || m._id?.toString() || `${m.sender}_${m.time}_${m.text}`;
                if (!seenMessageIdsRef.current.has(mId)) {
                  seenMessageIdsRef.current.add(mId);
                  next.push({
                    messageId: mId,
                    sender: m.sender || "Trader",
                    text: m.text,
                    time: m.time || new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  });
                  hasNew = true;
                }
              });
              return hasNew ? next : prev;
            });
          }
        }
      } catch (err) {
        // Soft fail
      }
    };

    const timer = setInterval(syncChatHistory, 3000);
    return () => clearInterval(timer);
  }, [sessionData?._id, userToken]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg = {
      type: "chat",
      messageId: msgId,
      sender: localParticipant?.name || localParticipant?.identity || (session?.user as any)?.name || "Trader",
      text: chatMessage.trim(),
      time: timeStr,
    };

    // 1. Mark as seen & update local state
    seenMessageIdsRef.current.add(msgId);
    setMessages((prev) => [...prev, newMsg]);
    setChatMessage("");

    // 2. Broadcast live via LiveKit DataChannel
    try {
      const encoded = new TextEncoder().encode(JSON.stringify(newMsg));
      send(encoded, { reliable: true });
    } catch (err) {
      console.error("Failed to send LiveKit DataChannel message:", err);
    }

    // 3. Persist message in Mongoose Backend DB
    if (sessionData?._id && userToken) {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
        await fetch(`${BACKEND_URL}/api/live-sessions/${sessionData._id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(newMsg),
        });
      } catch (err) {
        console.error("Failed to save live message to database:", err);
      }
    }
  };


  // Tracks query
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const screenShareTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera);

  // Toggle Microhpone
  const toggleMic = async () => {
    if (isMicLoading) return;
    setIsMicLoading(true);
    try {
      const nextState = !isMicOn;
      await localParticipant.setMicrophoneEnabled(nextState);
      setIsMicOn(nextState);
      if (nextState) {
        streamSFX.playUnmuteSound();
      } else {
        streamSFX.playMuteSound();
      }
      toast.success(nextState ? "Microphone Unmuted" : "Microphone Muted");
    } catch (err: any) {
      toast.error("Failed to toggle microphone: " + (err.message || err));
    } finally {
      setIsMicLoading(false);
    }
  };

  // Toggle Camera
  const toggleCam = async () => {
    if (isCamLoading) return;
    setIsCamLoading(true);
    try {
      const nextState = !isCamOn;
      await localParticipant.setCameraEnabled(nextState);
      setIsCamOn(nextState);
      toast.success(nextState ? "Camera Turned On" : "Camera Turned Off");
    } catch (err: any) {
      toast.error("Failed to toggle camera: " + (err.message || err));
    } finally {
      setIsCamLoading(false);
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!isHostOrCoHost) return;
    try {
      const nextState = !isScreenSharing;
      await localParticipant.setScreenShareEnabled(nextState, {
        audio: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
        systemAudio: "include",
      });
      setIsScreenSharing(nextState);
      if (nextState) {
        streamSFX.playScreenShareStartSound();
      } else {
        streamSFX.playScreenShareStopSound();
      }
      toast.success(nextState ? "Screen Share Started" : "Screen Share Stopped");
    } catch (err: any) {
      toast.error("Failed to toggle screen share: " + (err.message || err));
    }
  };

  const isLive = sessionData?.status === "live";

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await stageRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  // Listen for fullscreen exit via Escape
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  return (
    <div
      ref={stageRef}
      className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 w-full h-[calc(100dvh-70px)] sm:h-[calc(100dvh-80px)] lg:h-[780px] bg-card/60 backdrop-blur-xl border border-border/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 overflow-hidden relative shadow-2xl"
    >
      {/* AUTOMATIC WEBRTC ROOM AUDIO RENDERER (MICROPHONE VOICE + SCREEN SHARE AUDIO) */}
      <RoomAudioRenderer volume={isMuted ? 0 : 1} />

      {/* LEFT / TOP: MAIN STREAMING & VIDEO STAGE */}
      <div className="flex flex-col justify-between h-[210px] xs:h-[240px] sm:h-[300px] md:h-[360px] lg:h-full lg:flex-1 shrink-0 bg-background/90 rounded-xl border border-border/40 overflow-hidden relative shadow-sm">
        {/* TOP BAR OVERLAY */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-b from-background/95 via-background/80 to-transparent z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isLive ? (
              <Badge className="bg-red-500/20 text-red-500 border-red-500/40 px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0">
                <Radio className="w-3 h-3" /> LIVE
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground border-border px-2 py-0.5 text-[10px] sm:text-xs uppercase shrink-0">
                ENDED
              </Badge>
            )}

            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black tracking-tight uppercase text-foreground leading-tight truncate">
                {sessionData?.title || "Live Market Broadcast"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                <span>Host: {sessionData?.host?.name || "Trader"}</span>
                {sessionData?.category && (
                  <span className="hidden sm:inline bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[9px] font-bold">
                    {sessionData.category}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-card/80 border border-border/60 rounded-full px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
              <Users className="w-3 h-3 text-primary" />
              <span className="font-bold text-foreground">
                {(remoteParticipants?.length || 0) + 1}
              </span>
            </div>

            {/* Mobile Audio Mute Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) {
                  streamSFX.playMuteSound();
                } else {
                  streamSFX.playUnmuteSound();
                }
              }}
              className="lg:hidden h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-destructive" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>

            {/* Mobile Fullscreen toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="lg:hidden h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              title="Fullscreen Chart"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>

            {/* Mobile Leave Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                streamSFX.playUserLeaveSound();
                leaveSession();
              }}
              className="lg:hidden h-7 w-7 rounded-full text-destructive/80 hover:text-destructive hover:bg-destructive/10"
              title="Leave Stream"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>

            {sessionData?.coHosts?.length > 0 && (
              <Badge variant="secondary" className="hidden md:flex items-center gap-1 text-[11px]">
                <Shield className="w-3 h-3 text-emerald-400" />
                {sessionData.coHosts.length} Co-Host{sessionData.coHosts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* CENTER VIDEO STAGE */}
        <div className="flex-1 relative flex items-center justify-center p-1 sm:p-3 overflow-hidden bg-black/50">
          {/* SCREEN SHARE PRESENTATION VIEW */}
          {screenShareTrack && screenShareTrack.publication ? (
            <div className="w-full h-full relative rounded-lg overflow-hidden border border-primary/30 flex items-center justify-center bg-black">
              <VideoTrack trackRef={screenShareTrack} className="w-full h-full object-contain" />
              <div className="absolute top-2 left-2 bg-background/85 backdrop-blur-md px-2 py-0.5 rounded border border-border text-[9px] sm:text-xs font-bold text-primary flex items-center gap-1 shadow-md">
                <Monitor className="w-3 h-3 text-primary animate-pulse" />
                <span className="truncate max-w-[120px] sm:max-w-none">{screenShareTrack.participant.name}'s Chart</span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="absolute top-2 right-2 bg-background/85 hover:bg-background backdrop-blur-md px-2 py-0.5 rounded border border-border text-[9px] sm:text-xs font-bold text-foreground flex items-center gap-1 shadow-md transition-all active:scale-95"
                title="Fullscreen Chart"
              >
                <Maximize2 className="w-3 h-3 text-primary" />
                <span className="hidden xs:inline">Fullscreen</span>
              </button>
            </div>
          ) : cameraTracks.length > 0 && cameraTracks.some((t) => t.publication) ? (
            /* CAMERA TRACKS GRID */
            <div
              className={`w-full h-full grid gap-2 sm:gap-4 ${
                cameraTracks.length === 1
                  ? "grid-cols-1"
                  : cameraTracks.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-2 md:grid-cols-3"
              }`}
            >
              {cameraTracks.map((tRef, idx) => (
                <div
                  key={tRef.participant.identity + idx}
                  className="relative w-full h-full bg-card/60 rounded-xl overflow-hidden border border-border/50 flex items-center justify-center group"
                >
                  {tRef.publication ? (
                    <VideoTrack trackRef={tRef} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <Avatar className="h-10 w-10 sm:h-16 sm:w-16 border-2 border-primary">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm sm:text-xl">
                          {tRef.participant.name?.substring(0, 2).toUpperCase() || "TR"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">
                        {tRef.participant.name} (Camera Off)
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white flex items-center gap-1">
                    {tRef.participant.identity === localParticipant.identity ? "You" : tRef.participant.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* OFFLINE / WAITING STAGE DISPLAY (TELEGRAM LIVE STYLE VOICE WAVE) */
            <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3 max-w-md p-3 sm:p-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
                  <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black uppercase tracking-tight text-foreground">
                  Traders Audio Room Active
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-xs">
                  Audio & voice stage is live. Host screen and chart streams appear automatically when shared.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE COMPACT ACTION BAR (TELEGRAM VOICE STYLE) */}
        <div className="lg:hidden px-3 py-2 bg-background/95 border-t border-border/40 flex items-center justify-between gap-2 z-10 shrink-0">
          <div className="flex items-center gap-1.5">
            <Button
              variant={isMicOn ? "default" : "destructive"}
              size="sm"
              onClick={toggleMic}
              disabled={!isLive || isMicLoading}
              className={`rounded-full h-8 px-3 text-[11px] font-black uppercase gap-1.5 transition-all ${
                isMicOn ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50" : ""
              }`}
            >
              {isMicLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isMicOn ? (
                <Mic className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <MicOff className="w-3.5 h-3.5" />
              )}
              <span>{isMicLoading ? "..." : isMicOn ? "Mic On" : "Muted"}</span>
            </Button>

            <Button
              variant={isCamOn ? "default" : "secondary"}
              size="sm"
              onClick={toggleCam}
              disabled={!isLive || isCamLoading}
              className="rounded-full h-8 px-2.5 text-[11px] font-bold gap-1"
            >
              {isCamLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isCamOn ? (
                <VideoIcon className="w-3.5 h-3.5 text-primary" />
              ) : (
                <VideoOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>

            {isHostOrCoHost && (
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                onClick={toggleScreenShare}
                disabled={!isLive}
                className="rounded-full h-8 px-2.5 text-[11px] font-bold gap-1"
                title="Share Screen"
              >
                {isScreenSharing ? <MonitorOff className="w-3.5 h-3.5 text-white" /> : <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
              </Button>
            )}
          </div>

          {/* Segmented Tab Toggles on Mobile */}
          <div className="flex items-center bg-card/60 p-0.5 rounded-full border border-border/50">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                activeTab === "participants"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>{(remoteParticipants?.length || 0) + 1}</span>
            </button>
          </div>
        </div>

        {/* DESKTOP CONTROLS TOOLBAR */}
        <div className="hidden lg:flex px-6 py-4 bg-gradient-to-t from-background to-background/90 border-t border-border/40 flex-wrap items-center justify-between gap-4 z-10 shrink-0">
          {/* LEFT CONTROLS: HOST / COHOST TOOLS */}
          {isHostOrCoHost ? (
            <div className="flex items-center gap-2">
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="sm"
                onClick={toggleMic}
                disabled={!isLive || isMicLoading}
                className="rounded-full px-4 text-xs font-bold gap-2 min-w-[100px]"
              >
                {isMicLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isMicOn ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
                {isMicLoading ? "Muting..." : isMicOn ? "Mic On" : "Muted"}
              </Button>

              <Button
                variant={isCamOn ? "default" : "secondary"}
                size="sm"
                onClick={toggleCam}
                disabled={!isLive || isCamLoading}
                className="rounded-full px-4 text-xs font-bold gap-2 min-w-[110px]"
              >
                {isCamLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCamOn ? (
                  <VideoIcon className="w-4 h-4 text-primary" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
                {isCamLoading ? "Loading..." : isCamOn ? "Camera On" : "Cam Off"}
              </Button>

              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                onClick={toggleScreenShare}
                disabled={!isLive}
                className={`rounded-full px-4 text-xs font-bold gap-2 ${
                  isScreenSharing ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                }`}
              >
                {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4 text-emerald-400" />}
                {isScreenSharing ? "Stop Share" : "Share Screen"}
              </Button>

              {isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenCoHostModal}
                  className="rounded-full px-3 text-xs font-bold gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Assign Co-Host
                </Button>
              )}
            </div>
          ) : (
            /* VIEWERS CONTROLS */
            <div className="flex items-center gap-2">
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="sm"
                onClick={toggleMic}
                disabled={!isLive || isMicLoading}
                className="rounded-full px-4 text-xs font-bold gap-2 min-w-[100px]"
              >
                {isMicLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isMicOn ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
                {isMicLoading ? "Muting..." : isMicOn ? "Mic On" : "Muted"}
              </Button>

              <Button
                variant={isCamOn ? "default" : "secondary"}
                size="sm"
                onClick={toggleCam}
                disabled={!isLive || isCamLoading}
                className="rounded-full px-4 text-xs font-bold gap-2 min-w-[110px]"
              >
                {isCamLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCamOn ? (
                  <VideoIcon className="w-4 h-4 text-primary" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
                {isCamLoading ? "Loading..." : isCamOn ? "Camera On" : "Cam Off"}
              </Button>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium ml-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Audience Mode</span>
              </div>
            </div>
          )}

          {/* RIGHT CONTROLS: SESSION MANAGEMENT */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) {
                  streamSFX.playMuteSound();
                } else {
                  streamSFX.playUnmuteSound();
                }
              }}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-destructive" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              title="Minimize Stage (Floating Mini-Player)"
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTab("participants")}
              title="View Participants"
              className={`rounded-full ${showSidebar && activeTab === "participants" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <Users className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTab("chat")}
              title="Toggle Live Chat"
              className={`rounded-full ${showSidebar && activeTab === "chat" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>

            {isHostOrCoHost && isLive ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    streamSFX.playUserLeaveSound();
                    leaveSession();
                    toast.info("You left the stream room. Broadcast remains live for other participants.");
                  }}
                  className="rounded-full px-3.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 gap-1.5 transition-all"
                  title="Leave this broadcast room without ending session for other participants"
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Room
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onEndStream}
                  className="rounded-full px-4 text-xs font-bold uppercase gap-1.5 shadow-md shadow-destructive/20"
                  title="End broadcast session completely for everyone"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> End Session
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  streamSFX.playUserLeaveSound();
                  leaveSession();
                }}
                className="rounded-full px-3 text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/40 gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT / BOTTOM: TELEGRAM-STYLE LIVE CHAT & AUDIENCE PANEL */}
      {showSidebar && (
        <div className="flex-1 min-h-0 lg:flex-none w-full lg:w-80 xl:w-96 lg:h-full bg-background/90 rounded-xl border border-border/40 flex flex-col justify-between overflow-hidden shadow-lg">
          {/* TABS HEADER (Hidden on mobile because mobile action bar has quick tabs) */}
          <div className="hidden lg:flex border-b border-border/40 bg-card/20 shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "chat"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat ({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "participants"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Traders ({(remoteParticipants?.length || 0) + 1})</span>
            </button>
          </div>

          {/* TAB CONTENT: CHAT (TELEGRAM MOBILE STYLE) */}
          {activeTab === "chat" && (
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              {/* CHAT MESSAGES STREAM */}
              <ScrollArea className="flex-1 min-h-0 p-2 sm:p-3">
                <div className="space-y-2 min-w-0 max-w-full pb-1">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 sm:py-16 text-muted-foreground/60 space-y-1.5">
                      <MessageSquare className="w-7 h-7 stroke-1 text-muted-foreground/45" />
                      <p className="text-xs">No messages yet. Send a greeting to the traders!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMsgHost =
                        msg.sender?.toLowerCase().includes("host") ||
                        (sessionData?.host?.name && msg.sender === sessionData.host.name);
                      return (
                        <div key={msg.messageId || idx} className="flex items-start gap-2 min-w-0 max-w-full">
                          <Avatar className="h-6 w-6 border border-border shrink-0 mt-0.5">
                            <AvatarFallback
                              className={`text-[9px] font-black uppercase ${
                                isMsgHost ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"
                              }`}
                            >
                              {msg.sender?.substring(0, 2).toUpperCase() || "TR"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
                              <span
                                className={`font-black truncate ${isMsgHost ? "text-amber-400" : "text-primary"}`}
                                title={msg.sender}
                              >
                                {msg.sender}
                              </span>
                              {isMsgHost && (
                                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1 py-0 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" /> Host
                                </span>
                              )}
                              <span className="text-muted-foreground/50 text-[9px] ml-auto shrink-0 font-medium">
                                {msg.time}
                              </span>
                            </div>
                            <div className="bg-card/85 border border-border/50 rounded-2xl rounded-tl-sm px-2.5 py-1.5 text-xs text-foreground leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap max-w-full shadow-sm">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* CHAT INPUT BOX (PINNED DOCKED TELEGRAM STYLE) */}
              <form
                onSubmit={handleSendMessage}
                className="p-2 sm:p-3 border-t border-border/40 bg-card/30 flex items-center gap-1.5 sm:gap-2 shrink-0"
              >
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Send message to traders..."
                  maxLength={1000}
                  className="text-xs bg-background/90 border-border/60 focus-visible:ring-primary h-9 rounded-full px-3.5 min-w-0 flex-1 shadow-inner"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!chatMessage.trim()}
                  className="h-9 w-9 rounded-full p-0 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-md flex items-center justify-center transition-all disabled:opacity-40"
                  title="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
          )}

          {/* TAB CONTENT: PARTICIPANTS */}
          {activeTab === "participants" && (
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              {/* MUTE/UNMUTE ALL - ONLY FOR HOST */}
              {isHost && (
                <div className="px-3 py-2 border-b border-border/40 bg-card/10 flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendModerationCommand("mute", "all")}
                    className="flex-1 text-[10px] uppercase font-bold py-1 h-7 border-destructive/30 hover:bg-destructive/10 text-destructive-foreground flex items-center justify-center gap-1"
                  >
                    <MicOff className="w-3 h-3 text-destructive" /> Mute All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendModerationCommand("unmute", "all")}
                    className="flex-1 text-[10px] uppercase font-bold py-1 h-7 border-primary/30 hover:bg-primary/10 text-primary flex items-center justify-center gap-1"
                  >
                    <Mic className="w-3 h-3 text-primary animate-pulse" /> Unmute All
                  </Button>
                </div>
              )}

              {/* PARTICIPANTS LIST */}
              <ScrollArea className="flex-1 min-h-0 p-2 sm:p-3">
                <div className="space-y-2">
                  {[
                    {
                      identity: localParticipant.identity,
                      name: localParticipant.name || "Host",
                      isHost: isHost,
                      isCoHost: isHostOrCoHost && !isHost,
                      isLocal: true,
                      isMicOn: isMicOn,
                    },
                    ...remoteParticipants.map((p) => {
                      const isCo = sessionData?.coHosts?.some(
                        (ch: any) => ch.email === p.identity || ch._id === p.identity
                      );
                      return {
                        identity: p.identity,
                        name: p.name || p.identity,
                        isHost: false,
                        isCoHost: !!isCo,
                        isLocal: false,
                        isMicOn: p.isMicrophoneEnabled,
                      };
                    }),
                  ].map((p, idx) => (
                    <div
                      key={p.identity + idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-card/40 border border-border/40 hover:bg-card/75 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <Avatar className="h-7 w-7 border border-primary/20 shrink-0">
                          <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary uppercase">
                            {p.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="truncate flex flex-col leading-tight min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">{p.name}</span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                            {p.isHost ? "Host" : p.isCoHost ? "Co-Host" : "Trader"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Status Indicator */}
                        {p.isMicOn ? (
                          <span title="Microphone Active">
                            <Mic className="w-3.5 h-3.5 text-primary animate-pulse" />
                          </span>
                        ) : (
                          <span title="Microphone Muted">
                            <MicOff className="w-3.5 h-3.5 text-muted-foreground/60" />
                          </span>
                        )}

                        {/* Telegram style Individual Voice Volume Slider (10% - 100%) */}
                        {!p.isLocal && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] font-bold gap-1 text-muted-foreground hover:text-foreground bg-card/60 border border-border/40 rounded-md shrink-0"
                                title={`Adjust ${p.name}'s voice volume (${userVolumes[p.identity] ?? 100}%)`}
                              >
                                {(userVolumes[p.identity] ?? 100) === 0 ? (
                                  <VolumeX className="w-3 h-3 text-destructive" />
                                ) : (userVolumes[p.identity] ?? 100) < 50 ? (
                                  <Volume1 className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <Volume2 className="w-3 h-3 text-emerald-400" />
                                )}
                                <span>{userVolumes[p.identity] ?? 100}%</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              container={stageRef.current}
                              className="w-56 p-3 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl z-[9999]"
                              align="end"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-foreground truncate max-w-[120px]">
                                    {p.name} Voice
                                  </span>
                                  <span className="font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                                    {userVolumes[p.identity] ?? 100}%
                                  </span>
                                </div>
                                <Slider
                                  min={10}
                                  max={100}
                                  step={5}
                                  value={[userVolumes[p.identity] ?? 100]}
                                  onValueChange={(vals) => handleParticipantVolumeChange(p.identity, vals[0])}
                                  className="w-full cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-muted-foreground font-semibold pt-0.5">
                                  <span>10%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}

                        {/* Remote Mute Action Trigger (Visible to Host on all remote participants) */}
                        {isHost && !p.isLocal && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendModerationCommand(p.isMicOn ? "mute" : "unmute", p.identity)}
                            title={p.isMicOn ? "Mute user microphone" : "Unmute user microphone"}
                            className="h-6 w-6 rounded-full hover:bg-neutral-800/80 text-muted-foreground hover:text-foreground"
                          >
                            {p.isMicOn ? (
                              <MicOff className="w-3 h-3 text-destructive" />
                            ) : (
                              <Mic className="w-3 h-3 text-primary" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
