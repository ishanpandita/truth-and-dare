"use client";

import { sendMessage } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatBoxProps {
  roomId: string;
  playerId: string;
  playerName: string;
  messages: ChatMessage[];
}

export function ChatBox({ roomId, playerId, playerName, messages }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await sendMessage(roomId, playerId, playerName, trimmed);
      setInput("");
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-full min-h-[400px]">
      <div className="px-4 py-3 border-b border-pink-400/20">
        <h3 className="font-bold text-pink-200 flex items-center gap-2">
          💬 Group Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-center text-pink-300/40 text-sm py-8">
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.player_id === playerId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`chat-bubble ${isOwn ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  isOwn
                    ? "bg-pink-500/30 rounded-br-sm"
                    : "bg-white/10 rounded-bl-sm"
                }`}
              >
                {!isOwn && (
                  <div className="text-xs font-bold text-pink-300 mb-0.5">
                    {msg.player_name}
                  </div>
                )}
                <div className="text-white/90 break-words">{msg.content}</div>
                <div className="text-[10px] text-pink-300/40 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-pink-400/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={300}
            className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-pink-400/20 text-white text-sm placeholder-pink-300/30 focus:outline-none focus:border-pink-400/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
