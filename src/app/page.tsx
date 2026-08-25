"use client";

import { Footer } from "@/components/Footer";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getStoredPlayerId,
  getStoredPlayerName,
  setStoredPlayerId,
  setStoredPlayerName,
} from "@/lib/types";
import { motion } from "framer-motion";
import { Link2, Sparkles, Users, Wine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState(getStoredPlayerName() ?? "");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Check README for setup.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const playerId = getStoredPlayerId() ?? uuidv4();
      setStoredPlayerId(playerId);
      setStoredPlayerName(name.trim());

      const { createRoom, joinRoom } = await import("@/lib/supabase");
      const room = await createRoom(playerId);
      await joinRoom(room.id, playerId, name.trim(), true, "#FF2D95");

      router.push(`/room/${room.id}?host=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Check README for setup.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const playerId = getStoredPlayerId() ?? uuidv4();
      setStoredPlayerId(playerId);
      setStoredPlayerName(name.trim());

      const { getRoom, joinRoom, getPlayers } = await import("@/lib/supabase");
      const room = await getRoom(roomCode.trim().toLowerCase());
      if (!room) {
        setError("Room not found. Check the code and try again.");
        return;
      }

      const existingPlayers = await getPlayers(room.id);
      const colorIndex = existingPlayers.length;
      const { getPlayerColor } = await import("@/lib/types");
      await joinRoom(
        room.id,
        playerId,
        name.trim(),
        false,
        getPlayerColor(colorIndex)
      );

      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Wine className="w-10 h-10 text-pink-400" style={{ animation: "float 3s ease-in-out infinite" }} />
              <h1 className="text-4xl md:text-5xl font-black glow-text bg-gradient-to-r from-pink-300 via-pink-500 to-fuchsia-400 bg-clip-text text-transparent">
                Bakchod Pink Gang
              </h1>
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
            <p className="text-pink-200/70 text-lg">
              Truth or Dare — Spin the bottle with your squad!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-8 shadow-2xl"
            style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-pink-400/30 text-white placeholder-pink-300/40 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 rounded-xl bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 text-sm">
                ⚠️ Add Supabase env variables to enable multiplayer. See README.
              </div>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl font-bold text-lg mb-4 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              {loading ? "Creating..." : "Host a Game"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-pink-400/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-pink-300/60 bg-transparent">
                  or join with code
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                placeholder="Room code..."
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-pink-400/30 text-white placeholder-pink-300/40 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition uppercase tracking-widest"
              />
              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <Link2 className="w-5 h-5" />
                Join
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-4 text-center"
          >
            {[
              { icon: "🍾", label: "Spin Bottle" },
              { icon: "🎤", label: "Voice Chat" },
              { icon: "💬", label: "Live Chat" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-4">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-pink-200/60">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
