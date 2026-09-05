"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceSignaling } from "./useRoomRealtime";

interface VoiceChatState {
  isMuted: boolean;
  isConnected: boolean;
  micPermission: "granted" | "denied" | "prompt" | "unknown";
  toggleMute: () => void;
  requestMic: () => Promise<void>;
}

export function useVoiceChat(
  roomId: string,
  playerId: string,
  enabled: boolean
): VoiceChatState {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const sendSignalRef = useRef<(type: string, data: unknown, to?: string) => void>(
    () => {}
  );

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existingPeer = peersRef.current.get(peerId);
      if (existingPeer) return existingPeer;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalRef.current("ice-candidate", event.candidate, peerId);
        }
      };

      pc.ontrack = (event) => {
        let audio = audioElementsRef.current.get(peerId);
        if (!audio) {
          audio = document.createElement("audio");
          audio.autoplay = true;
          audioElementsRef.current.set(peerId, audio);
        }
        audio.srcObject = event.streams[0];
        void audio.play().catch(() => undefined);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setIsConnected(true);
        } else if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          peersRef.current.delete(peerId);
          audioElementsRef.current.get(peerId)?.remove();
          audioElementsRef.current.delete(peerId);
          setIsConnected(peersRef.current.size > 0);
        }
      };

      peersRef.current.set(peerId, pc);
      return pc;
    },
    []
  );

  const createOffer = useCallback(
    async (peerId: string) => {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalRef.current("offer", offer, peerId);
    },
    [createPeerConnection]
  );

  const handleSignal = useCallback(
    async (from: string, type: string, payload: unknown) => {
      if (!enabled) return;

      if (type === "join-voice" && from !== playerId) {
        await createOffer(from);
        return;
      }

      let pc = peersRef.current.get(from);

      if (type === "offer") {
        pc = pc ?? createPeerConnection(from);
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload as RTCSessionDescriptionInit)
        );
        const pending = pendingIceRef.current.get(from) ?? [];
        await Promise.all(pending.map((candidate) => pc!.addIceCandidate(new RTCIceCandidate(candidate))));
        pendingIceRef.current.delete(from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignalRef.current("answer", answer, from);
      } else if (type === "answer" && pc) {
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload as RTCSessionDescriptionInit)
        );
      } else if (type === "ice-candidate") {
        const candidate = payload as RTCIceCandidateInit;
        pc = pc ?? createPeerConnection(from);
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          const pending = pendingIceRef.current.get(from) ?? [];
          pending.push(candidate);
          pendingIceRef.current.set(from, pending);
        }
      }

    },
    [enabled, playerId, createOffer, createPeerConnection]
  );

  const { sendSignal } = useVoiceSignaling(roomId, playerId, handleSignal);
  sendSignalRef.current = sendSignal;

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = stream;
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      audioElementsRef.current.forEach((audio) => {
        audio.srcObject = null;
        audio.remove();
      });
      audioElementsRef.current.clear();
      setMicPermission("granted");
      setIsConnected(false);

      sendSignalRef.current("join-voice", null);
    } catch {
      setMicPermission("denied");
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    if (enabled && micPermission === "unknown") {
      navigator.permissions
        ?.query({ name: "microphone" as PermissionName })
        .then((result) => {
          setMicPermission(result.state as "granted" | "denied" | "prompt");
        })
        .catch(() => setMicPermission("prompt"));
    }
  }, [enabled, micPermission]);

  useEffect(() => {
    const stream = localStreamRef.current;
    const peers = peersRef.current;
    const audioElements = audioElementsRef.current;
    const pendingIce = pendingIceRef.current;

    return () => {
      pendingIce.clear();
      stream?.getTracks().forEach((t) => t.stop());
      peers.forEach((pc) => pc.close());
      audioElements.forEach((a) => {
        a.srcObject = null;
      });
    };
  }, []);

  return { isMuted, isConnected, micPermission, toggleMute, requestMic };
}
