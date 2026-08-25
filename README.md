# 🍾 Bakchod Pink Gang — Truth or Dare

A real-time multiplayer Truth or Dare game with spinning bottle, voice chat, and group chat.

**Powered by Ishan Pandita**

## Features

- 🎮 **Host & Join** — Create a room, share the link, friends join instantly
- 🍾 **Spin the Bottle** — Random player selection with animated bottle spin
- 🤔😈 **Truth or Dare** — Random challenges for the selected player
- 🎤 **Voice Chat** — WebRTC peer voice with microphone permission
- 💬 **Group Chat** — Real-time side chat for all players
- 💖 **Pink Gang UI** — Beautiful dark pink themed interface

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **Framer Motion** (animations)
- **Supabase** (realtime database & chat)
- **WebRTC** (voice chat)
- **Vercel** (deployment)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings → API** and copy your Project URL and anon key

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

When prompted, add these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B: GitHub + Vercel Dashboard

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

## How to Play

1. **Host** enters their name and clicks "Host a Game"
2. Share the room link or code with friends
3. Friends open the link, enter their name, and join
4. Enable microphone for voice chat
5. Click **Spin!** when 2+ players are in the room
6. The bottle lands on a random player — they get Truth or Dare!
7. Use the chat box to talk while playing

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing (host/join)
│   ├── room/[roomId]/page.tsx # Game room
│   └── globals.css           # Pink theme styles
├── components/
│   ├── BottleSpin.tsx        # Spinning bottle + player names
│   ├── ChatBox.tsx           # Group chat
│   ├── VoiceControls.tsx     # Mic controls
│   └── RoomPageClient.tsx    # Main game logic
├── hooks/
│   ├── useRoomRealtime.ts    # Supabase realtime subscriptions
│   └── useVoiceChat.ts       # WebRTC voice
└── lib/
    ├── supabase.ts           # Database operations
    └── types.ts              # Types & game data
```

## License

MIT
