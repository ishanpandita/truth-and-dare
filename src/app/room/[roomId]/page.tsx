import { RoomPageClient } from "@/components/RoomPageClient";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ host?: string }>;
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { roomId } = await params;
  const { host } = await searchParams;

  return <RoomPageClient roomId={roomId} isHost={host === "true"} />;
}
