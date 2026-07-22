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
  UserCheck,
  Radio,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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
  const [showChat, setShowChat] = useState(true); // Default to chat open!
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  // Stream audio volume for viewers
  const [isMuted, setIsMuted] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Setup Data Channel for Live Chat
  const { send, message } = useDataChannel("chat");

  const handleModerationCommand = async (cmd: any) => {
    // Only target local participant
    const target = cmd.targetIdentity;
    if (target === localParticipant.identity || target === "all") {
      // Don't mute the host themselves on "all"
      if (target === "all" && isHost) return;

      try {
        if (cmd.action === "mute") {
          await localParticipant.setMicrophoneEnabled(false);
          setIsMicOn(false);
          toast.info("The host has muted your microphone.");
        } else if (cmd.action === "unmute") {
          await localParticipant.setMicrophoneEnabled(true);
          setIsMicOn(true);
          toast.success("The host has unmuted your microphone.");
        }
      } catch (err: any) {
        console.error("Failed to run remote moderation command:", err);
      }
    }
  };

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
      if (targetIdentity === "all") {
        toast.success(`Requested everyone to ${action}.`);
      } else {
        toast.success(`Requested participant to ${action}.`);
      }
    } catch (err) {
      console.error("Failed to send moderation command:", err);
    }
  };

  useEffect(() => {
    if (message) {
      try {
        const decoded = new TextDecoder().decode(message.payload);
        const parsed = JSON.parse(decoded);
        if (parsed.type === "moderation") {
          handleModerationCommand(parsed);
        } else {
          setMessages((prev) => [...prev, parsed]);
        }
      } catch (err) {
        console.error("Failed to parse message", err);
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
    if (!isHostOrCoHost && !isMicOn) return;
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
    <div ref={stageRef} className="flex flex-col lg:flex-row gap-4 w-full h-[780px] bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
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
            ) : (
              <Badge variant="outline" className="text-muted-foreground border-border px-3 py-1 text-xs uppercase">
                ENDED
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
                  Waiting for Host Video / Screen Share
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  The session is live! Audio and real-time order flow streams will play automatically as hosts begin broadcasting.
                </p>
              </div>
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
          ) : isMicOn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={toggleMic}
                disabled={!isLive}
                className="rounded-full px-4 text-xs font-bold gap-2 animate-pulse bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Mic className="w-4 h-4" />
                Mic Active (Click to Mute)
              </Button>
            </div>
          ) : (
            /* VIEWERS CONTROLS */
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Shield className="w-4 h-4 text-primary" />
              <span>Audience Mode (Viewing & Live Chat enabled)</span>
            </div>
          )}

          {/* RIGHT CONTROLS: SESSION MANAGEMENT */}
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
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowParticipants(!showParticipants);
                setShowChat(false);
              }}
              title="View Participants"
              className={`rounded-full ${showParticipants ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <Users className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowChat(!showChat);
                setShowParticipants(false);
              }}
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

      {/* RIGHT: PARTICIPANTS & MODERATION PANEL */}
      {showParticipants && (
        <div className="w-full lg:w-80 h-full bg-background/90 rounded-xl border border-border/40 flex flex-col justify-between overflow-hidden shadow-lg">
          <div className="px-4 py-3 border-b border-border/40 bg-card/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Room Participants</h4>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                {remoteParticipants.length + 1} online
              </Badge>
            </div>

            {/* MUTE/UNMUTE ALL - ONLY FOR HOST */}
            {isHost && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => sendModerationCommand("mute", "all")}
                  className="text-[10px] uppercase font-bold py-1 h-7 border-destructive/30 hover:bg-destructive/10 text-destructive-foreground flex items-center justify-center gap-1"
                >
                  <MicOff className="w-3 h-3 text-destructive" /> Mute All
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => sendModerationCommand("unmute", "all")}
                  className="text-[10px] uppercase font-bold py-1 h-7 border-primary/30 hover:bg-primary/10 text-primary flex items-center justify-center gap-1"
                >
                  <Mic className="w-3 h-3 text-primary animate-pulse" /> Unmute All
                </Button>
              </div>
            )}
          </div>

          {/* PARTICIPANTS LIST */}
          <ScrollArea className="flex-1 p-4 space-y-3">
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
                className="flex items-center justify-between p-2.5 rounded-lg bg-card/40 border border-border/40 hover:bg-card/75 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar className="h-7 w-7 border border-primary/20 shrink-0">
                    <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary uppercase">
                      {p.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate flex flex-col leading-tight">
                    <span className="text-xs font-bold text-foreground truncate">{p.name}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                      {p.isHost ? "Host" : p.isCoHost ? "Co-Host" : "Viewer"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Status Indicator */}
                  {p.isMicOn ? (
                    <Mic className="w-3.5 h-3.5 text-primary animate-pulse" title="Microphone Active" />
                  ) : (
                    <MicOff className="w-3.5 h-3.5 text-muted-foreground/60" title="Microphone Muted" />
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
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
