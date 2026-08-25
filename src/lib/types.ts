export interface Player {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  color: string;
  joined_at: string;
}

export interface Room {
  id: string;
  host_id: string;
  is_spinning: boolean;
  spin_result_player_id: string | null;
  bottle_rotation: number;
  game_mode: "truth" | "dare" | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  content: string;
  created_at: string;
}

export interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "join-voice";
  from: string;
  to?: string;
  payload: unknown;
}

export const PLAYER_COLORS = [
  "#FF2D95",
  "#FF6EB4",
  "#FFB6D9",
  "#C850C0",
  "#FF1493",
  "#FF69B4",
  "#DA70D6",
  "#EE82EE",
  "#FF85C1",
  "#F472B6",
];

export const TRUTH_QUESTIONS = [
  "What's your most embarrassing moment?",
  "Who was your first crush?",
  "What's a secret you've never told anyone?",
  "What's the wildest thing you've done?",
  "Have you ever lied to get out of trouble?",
  "What's your biggest fear?",
  "Who in this room would you trust with a secret?",
  "What's the most childish thing you still do?",
  "What's your guilty pleasure song?",
  "Have you ever had a crush on a friend's partner?",
];

export const DARE_CHALLENGES = [
  "Do your best dance move for 30 seconds!",
  "Speak in an accent for the next 2 rounds!",
  "Send a funny selfie to the group chat!",
  "Do 10 push-ups right now!",
  "Sing the chorus of your favorite song!",
  "Impersonate another player until someone guesses who!",
  "Tell a joke — if no one laughs, take another dare!",
  "Do your best animal impression!",
  "Text your crush something funny (or pretend)!",
  "Hold a plank for 30 seconds!",
];

export function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function getPlayerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

export function getRandomQuestion(mode: "truth" | "dare"): string {
  const list = mode === "truth" ? TRUTH_QUESTIONS : DARE_CHALLENGES;
  return list[Math.floor(Math.random() * list.length)];
}

export function getStoredPlayerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bpg_player_id");
}

export function setStoredPlayerId(id: string): void {
  localStorage.setItem("bpg_player_id", id);
}

export function getStoredPlayerName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bpg_player_name");
}

export function setStoredPlayerName(name: string): void {
  localStorage.setItem("bpg_player_name", name);
}
