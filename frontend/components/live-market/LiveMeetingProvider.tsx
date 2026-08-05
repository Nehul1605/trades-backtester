"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { Room, RoomEvent, DisconnectReason } from "livekit-client";
import { toast } from "sonner";
import { MiniPlayer } from "./MiniPlayer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

interface LiveMeetingContextType {
  // State
  activeSession: any | null;
  livekitToken: string | null;
  livekitUrl: string;
  isConnected: boolean;
  isHostOrCoHost: boolean;
  isHost: boolean;
  isBroadcaster: boolean;
  room: Room | null;

  // Actions
  joinSession: (session: any) => Promise<void>;
  leaveSession: () => void;
  handleStartStream: () => Promise<void>;
  handleEndStream: () => Promise<void>;
  fetchSessions: () => Promise<any[]>;
  sessions: any[];
  loadingSessions: boolean;
  connectingLivekit: boolean;
}

const LiveMeetingContext = createContext<LiveMeetingContextType | null>(null);

export function useLiveMeeting() {
  const ctx = useContext(LiveMeetingContext);
  if (!ctx) {
    throw new Error("useLiveMeeting must be used inside LiveMeetingProvider");
  }
  return ctx;
}

export function LiveMeetingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status: authStatus, update: updateSession } = useSession();
  const pathname = usePathname();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string>("");
  const [isHostOrCoHost, setIsHostOrCoHost] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [connectingLivekit, setConnectingLivekit] = useState(false);

  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [currentUserStatus, setCurrentUserStatus] = useState<string>("");

  useEffect(() => {
    if (session?.user) {
      setCurrentUserRole((session.user as any).role || "user");
      setCurrentUserStatus((session.user as any).status || "pending");
    }
  }, [session]);

  const roomRef = useRef<Room | null>(null);
  const userToken = (session?.user as any)?.accessToken;
  const isBroadcaster = currentUserRole === "admin" || currentUserRole === "broadcaster";

  // Sync user profile
  const syncUserProfile = useCallback(async () => {
    if (!userToken) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/auth/profile`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.role) {
          setCurrentUserRole(data.role);
          setCurrentUserStatus(data.status);
          
          if (data.role !== (session?.user as any)?.role || data.status !== (session?.user as any)?.status) {
            await updateSession({
              role: data.role,
              status: data.status,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  }, [userToken, session, updateSession]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!userToken) return [];
    syncUserProfile();
    try {
      setLoadingSessions(true);
      const res = await fetch(
        `${BACKEND_URL}/api/live-sessions`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const activeOnly = data.filter((s: any) => s.status !== "ended");
        setSessions(activeOnly);
        return activeOnly;
      }
    } catch (err) {
      console.error("Failed to fetch live sessions:", err);
      toast.error("Failed to load live sessions");
    } finally {
      setLoadingSessions(false);
    }
    return [];
  }, [userToken]);

  useEffect(() => {
    if (authStatus === "authenticated" && userToken) {
      fetchSessions();
    }
  }, [authStatus, userToken]);

  // Leave session helper
  const leaveSession = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setActiveSession(null);
    setLivekitToken(null);
    setIsConnected(false);
    setIsHostOrCoHost(false);
    setIsHost(false);
  }, []);

  // Join session
  const joinSession = useCallback(
    async (sess: any) => {
      if (!userToken || !sess?._id) return;
      setActiveSession(sess);
      setConnectingLivekit(true);
      setLivekitToken(null);
      setIsConnected(false);

      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/live-sessions/${sess._id}/token`,
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
        const lkUrl = data.livekitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://demo.livekit.cloud";

        // Create Room client-side and assign synchronously before setting token
        const room = new Room();
        roomRef.current = room;

        const handleDisconnected = (reason?: DisconnectReason) => {
          if (reason === DisconnectReason.SERVER_SHUTDOWN || reason === DisconnectReason.ROOM_DELETED) {
            toast.info("The host has ended the live session.", { duration: 5000 });
            leaveSession();
            fetchSessions();
          }
        };

        const handleConnected = () => {
          setIsConnected(true);
        };

        const handlePermissionsChanged = (arg1: any, arg2: any) => {
          // Identify participant in arguments safely
          const participant = arg1?.identity ? arg1 : (arg2?.identity ? arg2 : null);
          if (participant && participant.identity === room.localParticipant.identity) {
            const canShareScreen = participant.permissions?.canPublishSources?.includes("screen_share") || false;
            setIsHostOrCoHost(canShareScreen || room.localParticipant.identity === sess.host.toString());
          }
        };

        const handleParticipantConnected = (participant: any) => {
          toast.success(`${participant.name || participant.identity} joined the live stream!`, {
            description: "Say hello in the chat!",
            icon: "👋",
          });
        };

        const handleParticipantDisconnected = (participant: any) => {
          toast.info(`${participant.name || participant.identity} left the live stream.`);
        };

        room.on(RoomEvent.Disconnected, handleDisconnected);
        room.on(RoomEvent.Connected, handleConnected);
        room.on(RoomEvent.ParticipantPermissionsChanged, handlePermissionsChanged);
        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

        setLivekitToken(data.token);
        setIsHostOrCoHost(data.isHostOrCoHost);
        setIsHost(data.isHost);
        setLivekitUrl(lkUrl);

        // Connect room
        room.connect(lkUrl, data.token)
          .then(() => {
            setIsConnected(true);
          })
          .catch((err) => {
            console.error("Failed to connect to LiveKit:", err);
            toast.error("Failed to connect to stream server");
            leaveSession();
          });

      } catch (err: any) {
        console.error("Error joining live stream:", err);
        toast.error(err.message || "Failed to join live stream");
        leaveSession();
      } finally {
        setConnectingLivekit(false);
      }
    },
    [userToken, fetchSessions, leaveSession]
  );

  // Start stream
  const handleStartStream = useCallback(async () => {
    if (!activeSession?._id || !userToken) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/live-sessions/${activeSession._id}/start`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
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
  }, [activeSession, userToken, fetchSessions]);

  // End stream
  const handleEndStream = useCallback(async () => {
    if (!activeSession?._id || !userToken) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/live-sessions/${activeSession._id}/end`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (res.ok) {
        leaveSession();
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
  }, [activeSession, userToken, fetchSessions, leaveSession, joinSession]);

  const isOnMarketPage = pathname === "/market";

  return (
    <LiveMeetingContext.Provider
      value={{
        activeSession,
        livekitToken,
        livekitUrl,
        isConnected,
        isHostOrCoHost,
        isHost,
        isBroadcaster,
        joinSession,
        leaveSession,
        handleStartStream,
        handleEndStream,
        fetchSessions,
        sessions,
        loadingSessions,
        connectingLivekit,
        room: roomRef.current,
      }}
    >
      {children}
      {!isOnMarketPage && isConnected && activeSession && roomRef.current && (
        <LiveKitRoom
          room={roomRef.current}
          data-lk-theme="default"
        >
          <MiniPlayer
            sessionData={activeSession}
            onLeave={leaveSession}
          />
        </LiveKitRoom>
      )}
    </LiveMeetingContext.Provider>
  );
}
