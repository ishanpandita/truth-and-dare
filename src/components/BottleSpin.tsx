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
  const radius = 148;

  return (
    <div className="relative flex items-center justify-center w-full max-w-[460px] aspect-square mx-auto bottle-stage rounded-full">
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
          <svg width="112" height="252" viewBox="0 0 112 252" className="drop-shadow-2xl">
            <defs>
              <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#143d3c" />
                <stop offset="42%" stopColor="#2b7770" />
                <stop offset="72%" stopColor="#164f51" />
                <stop offset="100%" stopColor="#0d2a35" />
              </linearGradient>
              <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffb36b" />
                <stop offset="100%" stopColor="#ee5961" />
              </linearGradient>
              <linearGradient id="labelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe7b5" />
                <stop offset="100%" stopColor="#f4b978" />
              </linearGradient>
            </defs>
            <path d="M40 8h32v38c0 8 18 17 23 37v105c0 32-18 51-55 51s-55-19-55-51V83c5-20 23-29 23-37V8Z" fill="url(#bottleGrad)" stroke="#8fe0c8" strokeOpacity=".35" strokeWidth="2" />
            <rect x="36" y="0" width="40" height="13" rx="5" fill="#e8a45e" />
            <path d="M42 16h28v28H42z" fill="#246864" opacity=".9" />
            <path
              d="M20 115c18-8 54-8 72 0v60c0 18-16 28-36 28s-36-10-36-28Z"
              fill="url(#liquidGrad)"
            />
            <rect x="18" y="124" width="76" height="53" rx="8" fill="url(#labelGrad)" stroke="#fff0c9" strokeWidth="2" />
            <text x="56" y="147" textAnchor="middle" fill="#3e2630" fontSize="16" fontWeight="800" letterSpacing="2">BPG</text>
            <text x="56" y="163" textAnchor="middle" fill="#6d3b42" fontSize="7" fontWeight="700" letterSpacing="1">PARTY TONIC</text>
            <path d="M27 62c-8 19-11 54-7 78" fill="none" stroke="#d9fff1" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round" />
            <path d="M29 203c7 10 18 16 27 17" fill="none" stroke="#f7c99b" strokeOpacity=".4" strokeWidth="3" />
            <path d="M39 232h34" stroke="#ff725e" strokeWidth="5" strokeLinecap="round" />
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
