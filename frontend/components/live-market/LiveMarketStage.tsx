"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Play,
  UserCheck,
  Radio,
  Clock,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
const formatIST = (dateVal: any) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return (
      d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST"
    );
  } catch (e) {
    return null;
  }
};

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

  // Local state for media toggles
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  // Stream audio volume for viewers
  const [isMuted, setIsMuted] = useState(false);

  // Setup Data Channel for Live Chat
  const { send, message } = useDataChannel("chat");

  useEffect(() => {
    if (message) {
      try {
        const decoded = new TextDecoder().decode(message.payload);
        const parsed = JSON.parse(decoded);
        setMessages((prev) => [...prev, parsed]);
      } catch (err) {
        console.error("Failed to parse chat message", err);
      }
    }
  }, [message]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: localParticipant?.name || localParticipant?.identity || "Trader",
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const encoded = new TextEncoder().encode(JSON.stringify(newMsg));
    send(encoded, { reliable: true });

    setMessages((prev) => [...prev, newMsg]);
    setChatMessage("");
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
    if (!isHostOrCoHost) return;
    try {
      const nextState = !isMicOn;
      await localParticipant.setMicrophoneEnabled(nextState);
      setIsMicOn(nextState);
      toast.success(nextState ? "Microphone Unmuted" : "Microphone Muted");
    } catch (err: any) {
      toast.error("Failed to toggle microphone: " + (err.message || err));
    }
  };

  // Toggle Camera
  const toggleCam = async () => {
    if (!isHostOrCoHost) return;
    try {
      const nextState = !isCamOn;
      await localParticipant.setCameraEnabled(nextState);
      setIsCamOn(nextState);
      toast.success(nextState ? "Camera Turned On" : "Camera Turned Off");
    } catch (err: any) {
      toast.error("Failed to toggle camera: " + (err.message || err));
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
      toast.success(nextState ? "Screen Share Started" : "Screen Share Stopped");
    } catch (err: any) {
      toast.error("Failed to toggle screen share: " + (err.message || err));
    }
  };

  const isLive = sessionData?.status === "live";

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-[780px] bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
      {/* AUTOMATIC WEBRTC ROOM AUDIO RENDERER (MICROPHONE VOICE + SCREEN SHARE AUDIO) */}
      <RoomAudioRenderer volume={isMuted ? 0 : 1} />

      {/* LEFT: MAIN STREAMING & VIDEO STAGE */}
      <div className="flex-1 flex flex-col justify-between h-full bg-background/80 rounded-xl border border-border/40 overflow-hidden relative">
        {/* TOP BAR OVERLAY */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-background/90 to-transparent z-10">
          <div className="flex items-center gap-3">
            {isLive ? (
              <Badge className="bg-red-500/20 text-red-500 border-red-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> LIVE
              </Badge>
            ) : sessionData?.status === "ended" ? (
              <Badge variant="outline" className="text-muted-foreground border-border px-3 py-1 text-xs uppercase">
                ENDED
              </Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                SCHEDULED
              </Badge>
            )}

            <div>
              <h2 className="text-lg font-black tracking-tight uppercase text-foreground leading-none">
                {sessionData?.title || "Live Market Broadcast"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                <span>Host: {sessionData?.host?.name || "Trader"}</span>
                {sessionData?.category && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                    {sessionData.category}
                  </span>
                )}
                {formatIST(sessionData?.scheduledAt) && (
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {formatIST(sessionData.scheduledAt)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border/60 rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">
                {(remoteParticipants?.length || 0) + 1}
              </span>
              <span className="text-[10px]">watching</span>
            </div>

            {sessionData?.coHosts?.length > 0 && (
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1 text-[11px]">
                <Shield className="w-3 h-3 text-emerald-400" />
                {sessionData.coHosts.length} Co-Host{sessionData.coHosts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* CENTER VIDEO STAGE */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-black/40">
          {/* SCREEN SHARE PRESENTATION VIEW */}
          {screenShareTrack && screenShareTrack.publication ? (
            <div className="w-full h-full relative rounded-lg overflow-hidden border border-primary/30 flex items-center justify-center">
              <VideoTrack trackRef={screenShareTrack} className="w-full h-full object-contain" />
              <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded border border-border text-xs font-bold text-primary flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-primary animate-pulse" />
                {screenShareTrack.participant.name}'s Screen Share
              </div>
            </div>
          ) : cameraTracks.length > 0 && cameraTracks.some((t) => t.publication) ? (
            /* CAMERA TRACKS GRID */
            <div
              className={`w-full h-full grid gap-4 ${
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
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                          {tRef.participant.name?.substring(0, 2).toUpperCase() || "TR"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-muted-foreground">
                        {tRef.participant.name} (Camera Off)
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-white flex items-center gap-1.5">
                    {tRef.participant.identity === localParticipant.identity ? "You" : tRef.participant.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* OFFLINE / WAITING STAGE DISPLAY */
            <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md p-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
                  <Radio className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
                  Pro
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">
                  {isLive ? "Waiting for Host Video / Screen Share" : "Live Market Session Ready"}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {isLive
                    ? "The session is live! Audio and real-time order flow streams will play automatically as hosts begin broadcasting."
                    : "Hosts & Co-Hosts can initiate the session, share charts, or present market breakdown below."}
                </p>
              </div>

              {!isLive && isHostOrCoHost && (
                <Button
                  onClick={onStartStream}
                  size="lg"
                  className="rounded-full px-8 font-bold uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" /> Start Live Meeting
                </Button>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS TOOLBAR */}
        <div className="px-6 py-4 bg-gradient-to-t from-background to-background/90 border-t border-border/40 flex flex-wrap items-center justify-between gap-4 z-10">
          {/* LEFT CONTROLS: HOST / COHOST TOOLS */}
          {isHostOrCoHost ? (
            <div className="flex items-center gap-2">
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="sm"
                onClick={toggleMic}
                disabled={!isLive}
                className="rounded-full px-4 text-xs font-bold gap-2"
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isMicOn ? "Mic On" : "Muted"}
              </Button>

              <Button
                variant={isCamOn ? "default" : "secondary"}
                size="sm"
                onClick={toggleCam}
                disabled={!isLive}
                className="rounded-full px-4 text-xs font-bold gap-2"
              >
                {isCamOn ? <VideoIcon className="w-4 h-4 text-primary" /> : <VideoOff className="w-4 h-4" />}
                {isCamOn ? "Camera On" : "Cam Off"}
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Shield className="w-4 h-4 text-primary" />
              <span>Audience Mode (Viewing & Live Chat enabled)</span>
            </div>
          )}

          {/* RIGHT CONTROLS: SESSION MANAGEMENT & CHAT TOGGLE */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-destructive" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(!showChat)}
              title="Toggle Live Chat"
              className={`rounded-full ${showChat ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>

            {isHostOrCoHost && isLive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onEndStream}
                className="rounded-full px-4 text-xs font-bold uppercase gap-1.5 shadow-md shadow-destructive/20"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> End Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: LIVE CHAT & AUDIENCE PANEL */}
      {showChat && (
        <div className="w-full lg:w-80 h-full bg-background/90 rounded-xl border border-border/40 flex flex-col justify-between overflow-hidden shadow-lg">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-card/40">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Live Market Chat</h4>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {messages.length} messages
            </Badge>
          </div>

          {/* CHAT MESSAGES STREAM */}
          <ScrollArea className="flex-1 p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-muted-foreground/60 space-y-2">
                <MessageSquare className="w-8 h-8 stroke-1" />
                <p className="text-xs">No messages yet. Say hi to the traders!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="mb-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-primary">{msg.sender}</span>
                    <span className="text-muted-foreground/60">{msg.time}</span>
                  </div>
                  <div className="bg-card border border-border/50 rounded-lg p-2.5 text-xs text-foreground leading-relaxed break-words">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {/* CHAT INPUT BOX */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border/40 bg-card/20 flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Send message..."
              className="text-xs bg-background/80 border-border/60 focus-visible:ring-primary h-9 rounded-lg"
            />
            <Button type="submit" size="sm" className="h-9 px-3 text-xs font-bold uppercase bg-primary text-primary-foreground">
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
