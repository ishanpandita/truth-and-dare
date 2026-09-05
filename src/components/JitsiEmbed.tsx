"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface JitsiEmbedProps {
  roomId: string;
  playerName: string;
  open: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiEmbed({ roomId, playerName, open, onClose }: JitsiEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;

    const domain = "meet.jit.si";
    const roomName = `${roomId}-bpg`;

    const loadApi = async () => {
      if (!window.JitsiMeetExternalAPI) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://${domain}/external_api.js`;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Jitsi API"));
          document.body.appendChild(script);
        });
      }

      if (!containerRef.current) return;

      try {
        // create the Jitsi meeting inside the container
        const options = {
          roomName,
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: true,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            requireDisplayName: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISABLE_VIDEO_BACKGROUND: true,
          },
          userInfo: {
            displayName: playerName || "Guest",
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Ensure audio is unmuted when user clicks Join (browser may block otherwise)
        apiRef.current.addEventListener("participantRoleChanged", (event: any) => {
          // no-op
        });
      } catch (err) {
        console.error("Jitsi init error", err);
      }
    };

    loadApi();

    return () => {
      try {
        apiRef.current?.dispose();
      } catch (e) {}
      apiRef.current = null;
    };
  }, [open, roomId, playerName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-[90vw] h-[80vh] bg-black rounded-xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-40 p-2 rounded-full bg-white/10 hover:bg-white/20"
          title="Close voice room"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
