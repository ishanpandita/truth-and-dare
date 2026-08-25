"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ChatMessage, Player, Room } from "@/lib/types";

export function useRoomRealtime(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const refreshPlayers = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    if (data) setPlayers(data as Player[]);
  }, [roomId]);

  const refreshRoom = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (data) setRoom(data as Room);
  }, [roomId]);

  const refreshMessages = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data as ChatMessage[]);
  }, [roomId]);

  useEffect(() => {
    refreshRoom();
    refreshPlayers();
    refreshMessages();

    const supabase = getSupabase();
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.new) setRoom(payload.new as Room);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        () => refreshPlayers()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refreshPlayers, refreshRoom, refreshMessages]);

  return { room, players, messages, setRoom, setPlayers, setMessages };
}

export function useVoiceSignaling(
  roomId: string,
  playerId: string,
  onSignal: (from: string, type: string, payload: unknown) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel(`voice-${roomId}`)
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        const { from, type, data, to } = payload as {
          from: string;
          type: string;
          data: unknown;
          to?: string;
        };
        if (from === playerId) return;
        if (to && to !== playerId) return;
        onSignal(from, type, data);
      })
      .subscribe();

    channelRef.current = channel;

    const announceJoin = setTimeout(() => {
      channel.send({
        type: "broadcast",
        event: "signal",
        payload: { from: playerId, type: "join-voice", data: null },
      });
    }, 1000);

    return () => {
      clearTimeout(announceJoin);
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, onSignal]);

  const sendSignal = useCallback(
    (type: string, data: unknown, to?: string) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "signal",
        payload: { from: playerId, type, data, to },
      });
    },
    [playerId]
  );

  return { sendSignal };
}
