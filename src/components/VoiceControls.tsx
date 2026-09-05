"use client";

import { Mic, MicOff, Radio } from "lucide-react";

interface VoiceControlsProps {
  micPermission: "granted" | "denied" | "prompt" | "unknown";
  isMuted: boolean;
  isConnected: boolean;
  onRequestMic: () => void;
  onToggleMute: () => void;
}

export function VoiceControls({
  micPermission,
  isMuted,
  isConnected,
  onRequestMic,
  onToggleMute,
}: VoiceControlsProps) {
  if (micPermission === "denied") {
    return (
      <div className="glass voice-panel rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-red-300">
        <MicOff className="w-5 h-5 shrink-0" />
        <span><strong>Mic blocked.</strong> Enable it in browser settings, then reload the room.</span>
      </div>
    );
  }

  if (micPermission !== "granted") {
    return (
      <button
        onClick={onRequestMic}
        className="glass voice-panel rounded-2xl px-4 py-3 flex items-center gap-3 w-full hover:bg-white/10 transition text-sm"
      >
        <Mic className="w-5 h-5 text-[#9de3d0]" />
        <span className="text-pink-200"><strong className="text-white">Join voice chat</strong><span className="block text-xs text-white/45">Your mic stays off until you press this button.</span></span>
      </button>
    );
  }

  return (
    <div className="glass voice-panel rounded-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Radio className={`w-4 h-4 ${isConnected ? "text-[#9de3d0]" : "text-[#ffb36b]"}`} />
        <span className="text-pink-200/70">
          {isConnected ? "Voice connected" : "Finding your party..."}
        </span>
      </div>
      <button
        onClick={onToggleMute}
        className={`p-2.5 rounded-xl transition ${
          isMuted
            ? "bg-red-500/30 text-red-300"
            : "bg-pink-500/30 text-pink-200 hover:bg-pink-500/40"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
}
