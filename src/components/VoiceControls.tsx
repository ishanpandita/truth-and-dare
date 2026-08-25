"use client";

import { Mic, MicOff, Volume2 } from "lucide-react";

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
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-300">
        <MicOff className="w-5 h-5 shrink-0" />
        <span>Microphone access denied. Enable it in browser settings.</span>
      </div>
    );
  }

  if (micPermission !== "granted") {
    return (
      <button
        onClick={onRequestMic}
        className="glass rounded-xl px-4 py-3 flex items-center gap-3 w-full hover:bg-white/10 transition text-sm"
      >
        <Mic className="w-5 h-5 text-pink-400" />
        <span className="text-pink-200">Enable Microphone to Talk</span>
      </button>
    );
  }

  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Volume2 className={`w-4 h-4 ${isConnected ? "text-green-400" : "text-pink-300/50"}`} />
        <span className="text-pink-200/70">
          {isConnected ? "Voice connected" : "Connecting..."}
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
