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
  Volume2,
  VolumeX,
  Radio,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MiniPlayerProps {
  sessionData: any;
  onLeave: () => void;
}

export function MiniPlayer({ sessionData, onLeave }: MiniPlayerProps) {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  if (isMinimized) {
    // Collapsed mini dot
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsMinimized(false)}
          className="relative w-12 h-12 bg-card/90 backdrop-blur-xl border border-primary/40 rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 hover:scale-110 transition-transform"
        >
          <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[320px] rounded-xl overflow-hidden border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40">
      {/* Video / Preview Area */}
      <div className="relative w-full h-[180px] bg-black/90 flex items-center justify-center overflow-hidden">
        {displayTrack?.publication?.track ? (
          <VideoTrack
            trackRef={displayTrack}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <Radio className="w-8 h-8 text-red-500/50 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Audio Only
            </span>
          </div>
        )}

        {/* Live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Minimize button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Controls Bar */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">
            {sessionData?.title || "Live Session"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            Host: {sessionData?.host?.name || "Trader"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mute/Unmute */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </Button>

          {/* Go to Meeting */}
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2.5 text-[10px] font-bold uppercase rounded-full gap-1"
            onClick={() => router.push("/market")}
          >
            Open <ArrowRight className="w-3 h-3" />
          </Button>

          {/* Leave */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-full text-red-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={onLeave}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Audio Renderer (hidden — keeps audio playing) */}
      {!isMuted && <RoomAudioRenderer />}
    </div>
  );
}
