"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/types";

interface BottleSpinProps {
  players: Player[];
  rotation: number;
  isSpinning: boolean;
  selectedPlayerId: string | null;
  onSpin: () => void;
  canSpin: boolean;
}

export function BottleSpin({
  players,
  rotation,
  isSpinning,
  selectedPlayerId,
  onSpin,
  canSpin,
}: BottleSpinProps) {
  const count = Math.max(players.length, 1);
  const radius = 160;

  return (
    <div className="relative flex items-center justify-center w-full max-w-[420px] aspect-square mx-auto">
      {/* Player names around the bottle */}
      {players.map((player, index) => {
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isSelected = player.id === selectedPlayerId;

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="absolute z-10"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-500 ${
                isSelected
                  ? "scale-125 ring-2 ring-white shadow-lg"
                  : "opacity-80"
              }`}
              style={{
                backgroundColor: player.color,
                color: "#1a0a14",
                boxShadow: isSelected
                  ? `0 0 20px ${player.color}`
                  : `0 0 8px ${player.color}40`,
              }}
            >
              {player.name}
              {player.is_host && " 👑"}
            </div>
          </motion.div>
        );
      })}

      {/* Circle track */}
      <div
        className="absolute rounded-full border-2 border-dashed border-pink-400/20"
        style={{ width: radius * 2 + 60, height: radius * 2 + 60 }}
      />

      {/* Bottle */}
      <div className="relative z-20">
        <motion.div
          animate={{ rotate: rotation }}
          transition={
            isSpinning
              ? { duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }
              : { duration: 0 }
          }
          className="relative cursor-pointer"
          onClick={canSpin && !isSpinning ? onSpin : undefined}
          style={{ transformOrigin: "center center" }}
        >
          <svg
            width="80"
            height="200"
            viewBox="0 0 80 200"
            className="drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2d5016" />
                <stop offset="30%" stopColor="#4a7c23" />
                <stop offset="70%" stopColor="#3d6b1e" />
                <stop offset="100%" stopColor="#2d5016" />
              </linearGradient>
              <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff2d95" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff1493" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Bottle neck */}
            <rect x="32" y="0" width="16" height="40" rx="4" fill="url(#bottleGrad)" />
            {/* Cork */}
            <rect x="30" y="-8" width="20" height="12" rx="3" fill="#8B4513" />
            {/* Bottle body */}
            <path
              d="M 20 40 Q 15 60 15 100 Q 15 180 40 195 Q 65 180 65 100 Q 65 60 60 40 Z"
              fill="url(#bottleGrad)"
              stroke="#1a3010"
              strokeWidth="1"
            />
            {/* Liquid */}
            <path
              d="M 22 80 Q 18 100 18 130 Q 18 170 40 182 Q 62 170 62 130 Q 62 100 58 80 Z"
              fill="url(#liquidGrad)"
            />
            {/* Shine */}
            <ellipse cx="28" cy="110" rx="4" ry="20" fill="white" opacity="0.15" />
            {/* Pointer arrow at bottom */}
            <polygon
              points="40,195 34,210 46,210"
              fill="#ff2d95"
              stroke="#ff1493"
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      </div>

      {/* Spin button */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={onSpin}
          disabled={!canSpin || isSpinning || players.length < 2}
          className="btn-primary px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider disabled:opacity-40"
        >
          {isSpinning ? "Spinning..." : players.length < 2 ? "Need 2+ Players" : "🍾 Spin!"}
        </button>
      </div>
    </div>
  );
}
