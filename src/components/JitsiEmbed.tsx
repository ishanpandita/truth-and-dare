"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface JitsiEmbedProps {
  roomId: string;
  playerName: string;
  open: boolean;
  onClose: () => void;
}

type JitsiAPI = {
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options?: Record<string, unknown>) => JitsiAPI;
  }
}

export function JitsiEmbed({ roomId, playerName, open, onClose }: JitsiEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiAPI | null>(null);

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

        const ApiCtor = window.JitsiMeetExternalAPI;
        if (ApiCtor) {
          apiRef.current = new ApiCtor(domain, options);
          apiRef.current.addEventListener("participantRoleChanged", () => {
            // no-op: placeholder for potential hooks
          });
        }
      } catch (err) {
        console.error("Jitsi init error", err);
      }
    };

    loadApi();

    return () => {
      try {
        apiRef.current?.dispose();
      } catch (disposeErr) {
        console.debug("Jitsi dispose error", disposeErr);
      }
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
