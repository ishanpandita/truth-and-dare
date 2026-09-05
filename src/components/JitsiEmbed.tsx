"use client";

import React from "react";
import { X } from "lucide-react";

interface JitsiEmbedProps {
  roomId: string;
  playerName: string;
  open: boolean;
  onClose: () => void;
}

export function JitsiEmbed({ roomId, playerName, open, onClose }: JitsiEmbedProps) {
  if (!open) return null;

  const roomName = `${roomId}-bpg`;
  const url = `https://meet.jit.si/${encodeURIComponent(
    roomName
  )}#userInfo.displayName=${encodeURIComponent(playerName)}`;

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
        <iframe
          src={url}
          allow="camera; microphone; display-capture; fullscreen"
          style={{ width: "100%", height: "100%", border: 0 }}
          title={`Voice room ${roomName}`}
        />
      </div>
    </div>
  );
}
