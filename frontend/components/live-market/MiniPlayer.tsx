"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  X,
  Maximize2,
  Minimize2,
  Minus,
  Volume2,
  VolumeX,
  Radio,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamSFX } from "@/lib/soundEffects";

interface MiniPlayerProps {
  sessionData: any;
  onLeave: () => void;
  onMaximize?: () => void;
}

export function MiniPlayer({ sessionData, onLeave, onMaximize }: MiniPlayerProps) {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: false },
    ],
    { onlySubscribed: true }
  );

  const screenShareTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare
  );
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera);
  const displayTrack = screenShareTrack || cameraTrack;

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      streamSFX.playMuteSound();
    } else {
      streamSFX.playUnmuteSound();
    }
  };

  const handleOpenStage = () => {
    if (onMaximize) {
      onMaximize();
    } else {
      router.push("/market");
    }
  };

  const handleLeave = () => {
    streamSFX.playUserLeaveSound();
    onLeave();
  };

  if (isCollapsed) {
    // Collapsed floating pill / bubble
    return (
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 group animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          className="relative px-3.5 py-2.5 bg-card/95 backdrop-blur-xl border border-primary/50 hover:border-primary rounded-full flex items-center gap-2.5 shadow-2xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black uppercase text-foreground leading-tight max-w-[120px] truncate">
              {sessionData?.title || "Live Stream"}
            </span>
            <span className="text-[9px] font-bold text-primary leading-none">
              Click to expand
            </span>
          </div>
        </button>
        {/* Hidden Audio keeps playing */}
        {!isMuted && <RoomAudioRenderer />}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[340px] rounded-2xl overflow-hidden border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      {/* Video / Preview Area */}
      <div className="relative w-full h-[190px] bg-black/95 flex items-center justify-center overflow-hidden">
        {displayTrack?.publication?.track ? (
          <VideoTrack
            trackRef={displayTrack}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2.5 text-muted-foreground/60">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
              <Radio className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Live Audio Streaming
            </span>
          </div>
        )}

        {/* Live badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-red-500/90 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md shadow-red-500/30">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Top-Right action buttons: Collapse to bubble & Expand to market */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            onClick={() => setIsCollapsed(true)}
            title="Minimize to floating bubble"
            className="w-6 h-6 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenStage}
            title="Expand to Full Stage"
            className="w-6 h-6 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-3 flex items-center justify-between gap-2.5 bg-card/90 border-t border-border/50">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">
            {sessionData?.title || "Live Market Broadcast"}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1 mt-0.5">
            <span>Host: {sessionData?.host?.name || "Trader"}</span>
            {sessionData?.category && (
              <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[9px] font-bold">
                {sessionData.category}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mute/Unmute */}
          <Button
            variant="ghost"
            size="icon"
            className={`w-7 h-7 rounded-full ${isMuted ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent"}`}
            title={isMuted ? "Unmute stream audio" : "Mute stream audio"}
            onClick={handleToggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-primary" />
            )}
          </Button>

          {/* Go to Stage */}
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2.5 text-[10px] font-black uppercase rounded-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={handleOpenStage}
          >
            Stage <ArrowRight className="w-3 h-3" />
          </Button>

          {/* Leave stream */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Leave Stream"
            onClick={handleLeave}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Audio Renderer (keeps audio playing while minimized) */}
      {!isMuted && <RoomAudioRenderer />}
    </div>
  );
}

