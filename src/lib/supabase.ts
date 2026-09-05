import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage, Player, Room } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please set environment variables.");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function createRoom(hostId: string): Promise<Room> {
  const supabase = getSupabase();
  const roomId = generateShortId();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      id: roomId,
      host_id: hostId,
      is_spinning: false,
      spin_result_player_id: null,
      bottle_rotation: 0,
      game_mode: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Room;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) return null;
  return data as Room;
}

export async function joinRoom(
  roomId: string,
  playerId: string,
  name: string,
  isHost: boolean,
  color: string
): Promise<Player> {
  const supabase = getSupabase();

  const room = await getRoom(roomId);
  if (!room) throw new Error("Room not found");

  const { data: existing } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .eq("room_id", roomId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("players")
      .update({ name })
      .eq("id", playerId)
      .select()
      .single();
    if (error) throw error;
    return data as Player;
  }

  const { data, error } = await supabase
    .from("players")
    .insert({
      id: playerId,
      room_id: roomId,
      name,
      is_host: isHost,
      color,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Player;
}

export async function getPlayers(roomId: string): Promise<Player[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Player[];
}

export async function sendMessage(
  roomId: string,
  playerId: string,
  playerName: string,
  content: string
): Promise<ChatMessage> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      player_id: playerId,
      player_name: playerName,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChatMessage;
}

export async function getMessages(roomId: string): Promise<ChatMessage[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function startSpin(
  roomId: string,
  playerIds: string[]
): Promise<{ rotation: number; selectedPlayerId: string }> {
  const supabase = getSupabase();

  // Prevent starting a new spin if one is already active
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("is_spinning")
    .eq("id", roomId)
    .single();

  if (existingRoom?.is_spinning) {
    throw new Error("A spin is already in progress");
  }

  if (playerIds.length === 0) {
    throw new Error("Need at least one player to spin");
  }

  const selectedIndex = Math.floor(Math.random() * playerIds.length);
  const selectedPlayerId = playerIds[selectedIndex];
  const segmentAngle = 360 / playerIds.length;
  const baseRotation = 360 * (5 + Math.floor(Math.random() * 3));
  const targetAngle = selectedIndex * segmentAngle + segmentAngle / 2;
  const rotation = baseRotation + (360 - targetAngle);

  await supabase
    .from("rooms")
    .update({
      is_spinning: true,
      spin_result_player_id: null,
      bottle_rotation: rotation,
      game_mode: null,
    })
    .eq("id", roomId);

  return { rotation, selectedPlayerId };
}

export async function finishSpin(
  roomId: string,
  selectedPlayerId: string,
): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("rooms")
    .update({
      is_spinning: false,
      spin_result_player_id: selectedPlayerId,
      game_mode: null,
      current_question: null,
    })
    .eq("id", roomId);
}

export async function resetSpin(roomId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("rooms")
    .update({
      is_spinning: false,
      spin_result_player_id: null,
      game_mode: null,
      current_question: null,
    })
    .eq("id", roomId);
}

export async function chooseMode(
  roomId: string,
  playerId: string,
  playerName: string,
  mode: "truth" | "dare",
  question: string
): Promise<void> {
  const supabase = getSupabase();
  // Update room with chosen mode and question
  await supabase.from("rooms").update({
    game_mode: mode,
    current_question: question,
  }).eq("id", roomId);

  // Also insert a chat message announcing the chosen question
  await supabase.from("messages").insert({
    room_id: roomId,
    player_id: playerId,
    player_name: playerName,
    content: `${playerName} chose ${mode.toUpperCase()}: ${question}`,
  });
}

function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
