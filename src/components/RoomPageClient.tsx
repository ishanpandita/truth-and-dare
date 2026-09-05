"use client";

import { BottleSpin } from "@/components/BottleSpin";
import { ChatBox } from "@/components/ChatBox";
import { Footer } from "@/components/Footer";
import { VoiceControls } from "@/components/VoiceControls";
import { useRoomRealtime } from "@/hooks/useRoomRealtime";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { finishSpin, getRoom, joinRoom, resetSpin, startSpin, chooseMode } from "@/lib/supabase";
import {
  getPlayerColor,
  getRandomQuestion,
  getStoredPlayerId,
  getStoredPlayerName,
  setStoredPlayerId,
  setStoredPlayerName,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface RoomPageProps {
  roomId: string;
  isHost: boolean;
}

export function RoomPageClient({ roomId, isHost: initialIsHost }: RoomPageProps) {
  const [playerId] = useState(() => getStoredPlayerId() ?? uuidv4());
  const [playerName, setPlayerName] = useState(getStoredPlayerName() ?? "");
  const [joined, setJoined] = useState(false);
  const [joinName, setJoinName] = useState(getStoredPlayerName() ?? "");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const { room, players, messages } = useRoomRealtime(roomId);
  const [copied, setCopied] = useState(false);
  const [localSpinning, setLocalSpinning] = useState(false);

  const voice = useVoiceChat(roomId, playerId, joined);

  useEffect(() => {
    if (!playerId) return;
    setStoredPlayerId(playerId);
  }, [playerId]);

  useEffect(() => {
    const inRoom = players.some((p) => p.id === playerId);
    if (inRoom) {
      setJoined(true);
      const me = players.find((p) => p.id === playerId);
      if (me) setPlayerName(me.name);
    }
  }, [players, playerId]);

  const handleJoinFromLink = async () => {
    if (!joinName.trim()) {
      setJoinError("Please enter your name");
      return;
    }

    setJoinLoading(true);
    setJoinError("");

    try {
      const existingRoom = await getRoom(roomId);
      if (!existingRoom) {
        setJoinError("Room not found or expired.");
        return;
      }

      setStoredPlayerName(joinName.trim());
      setPlayerName(joinName.trim());

      const colorIndex = players.length;
      await joinRoom(
        roomId,
        playerId,
        joinName.trim(),
        initialIsHost && players.length === 0,
        getPlayerColor(colorIndex)
      );
      setJoined(true);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoinLoading(false);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : `/room/${roomId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpin = useCallback(async () => {
    if (localSpinning || !room || players.length < 2) return;

    setLocalSpinning(true);
    const playerIds = players.map((p) => p.id);

    try {
      const { selectedPlayerId } = await startSpin(roomId, playerIds);

      setTimeout(async () => {
        await finishSpin(roomId, selectedPlayerId);
        setLocalSpinning(false);
      }, 4200);
    } catch {
      setLocalSpinning(false);
    }
  }, [localSpinning, room, players, roomId]);

  const handleNextRound = async () => {
    await resetSpin(roomId);
  };

  const selectedPlayer = players.find((p) => p.id === room?.spin_result_player_id);
  const isSpinning = localSpinning || (room?.is_spinning ?? false);
  const currentQuestion = room?.current_question ?? null;

  if (!joined) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="glass rounded-3xl p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-black glow-text mb-2">Join the Party!</h2>
            <p className="text-pink-200/60 text-sm mb-6">
              Room <span className="font-mono font-bold text-pink-300">{roomId}</span>
            </p>
            <input
              type="text"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-pink-400/30 text-white placeholder-pink-300/40 focus:outline-none focus:border-pink-400 mb-4"
            />
            {joinError && (
              <p className="text-red-300 text-sm mb-4">{joinError}</p>
            )}
            <button
              onClick={handleJoinFromLink}
              disabled={joinLoading}
              className="btn-primary w-full py-3 rounded-xl font-bold"
            >
              {joinLoading ? "Joining..." : "Join Game 🎉"}
            </button>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-pink-300/50 hover:text-pink-300"
            >
              ← Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="glass border-b border-pink-400/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-pink-300/60 hover:text-pink-300 transition flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave
          </Link>

          <div className="text-center">
            <h1 className="font-black text-lg glow-text bg-gradient-to-r from-pink-300 to-fuchsia-400 bg-clip-text text-transparent">
              Bakchod Pink Gang
            </h1>
            <div className="text-xs text-pink-300/50">
              Room: <span className="font-mono font-bold text-pink-300">{roomId}</span>
            </div>
          </div>

          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 transition text-pink-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Share
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-full">
          {/* Game area */}
          <div className="flex flex-col gap-4">
            {/* Players bar */}
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
              <Users className="w-5 h-5 text-pink-400 shrink-0" />
              <span className="text-sm text-pink-200/60">
                {players.length} player{players.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2 flex-wrap">
                {players.map((p) => (
                  <span
                    key={p.id}
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${p.color}30`,
                      color: p.color,
                      border: `1px solid ${p.color}50`,
                    }}
                  >
                    {p.name}
                    {p.id === playerId && " (you)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottle */}
            <div className="glass rounded-2xl p-6 pb-16 flex-1 flex flex-col items-center justify-center min-h-[480px]">
              <BottleSpin
                players={players}
                rotation={room?.bottle_rotation ?? 0}
                isSpinning={isSpinning}
                selectedPlayerId={room?.spin_result_player_id ?? null}
                onSpin={handleSpin}
                canSpin={players.length >= 2 && !isSpinning}
              />

              {/* Result card */}
              <AnimatePresence>
                {selectedPlayer && currentQuestion && !isSpinning && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-8 w-full max-w-md"
                  >
                    <div
                      className="rounded-2xl p-6 text-center border-2"
                      style={{
                        borderColor: selectedPlayer.color,
                        background: `linear-gradient(135deg, ${selectedPlayer.color}15, ${selectedPlayer.color}05)`,
                      }}
                    >
                      <div className="text-sm text-pink-300/60 mb-1">
                        {room?.game_mode === "truth" ? "🤔 TRUTH" : "😈 DARE"}
                      </div>
                      <div
                        className="text-2xl font-black mb-3"
                        style={{ color: selectedPlayer.color }}
                      >
                        {selectedPlayer.name}
                      </div>
                      <p className="text-white/90 text-lg leading-relaxed">
                        {currentQuestion}
                      </p>
                      <button
                        onClick={handleNextRound}
                        className="btn-primary mt-5 px-6 py-2.5 rounded-xl font-bold text-sm"
                      >
                        Next Round →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* If the selected player is the current user and question isn't set yet, prompt choice */}
              {!isSpinning && selectedPlayer?.id === playerId && !room?.game_mode && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={async () => {
                      const q = getRandomQuestion("truth");
                      await chooseMode(roomId, playerId, playerName, "truth", q);
                    }}
                    className="btn-primary px-4 py-2 rounded-xl"
                  >
                    Choose TRUTH
                  </button>
                  <button
                    onClick={async () => {
                      const q = getRandomQuestion("dare");
                      await chooseMode(roomId, playerId, playerName, "dare", q);
                    }}
                    className="btn-primary px-4 py-2 rounded-xl"
                  >
                    Choose DARE
                  </button>
                </div>
              )}
            </div>

            {/* Voice controls */}
            <VoiceControls
              micPermission={voice.micPermission}
              isMuted={voice.isMuted}
              isConnected={voice.isConnected}
              onRequestMic={voice.requestMic}
              onToggleMute={voice.toggleMute}
            />
          </div>

          {/* Chat sidebar */}
          <div className="lg:sticky lg:top-4 lg:self-start h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)]">
            <ChatBox
              roomId={roomId}
              playerId={playerId}
              playerName={playerName}
              messages={messages}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
