"use client";

import { useEffect, useRef } from "react";

// ── YouTube IFrame API loader ─────────────────────────────────────────────────
// The API script is loaded once per page. Callbacks are queued until it's ready.

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const ytCallbacks: (() => void)[] = [];
let ytLoading = false;

function onYTReady(cb: () => void) {
  if (typeof window === "undefined") return;
  if (window.YT?.Player) { cb(); return; }
  ytCallbacks.push(cb);
  if (ytLoading) return;
  ytLoading = true;
  window.onYouTubeIframeAPIReady = () => {
    ytCallbacks.forEach((fn) => fn());
    ytCallbacks.length = 0;
  };
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

function toVideoId(url: string): string | null {
  const short = url.match(/youtu\.be\/([\w-]+)/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([\w-]+)/);
  if (watch) return watch[1];
  const embed = url.match(/\/embed\/([\w-]+)/);
  if (embed) return embed[1];
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  mediaType: string | null;
  mediaUrl: string | null;
  onVideoEnded?: () => void;
}

export default function MediaRenderer({ mediaType, mediaUrl, onVideoEnded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (mediaType !== "youtube" || !mediaUrl || !containerRef.current) return;

    const videoId = toVideoId(mediaUrl);
    if (!videoId) return;

    let active = true;

    onYTReady(() => {
      if (!active || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) onVideoEnded?.(); // 0 = YT.PlayerState.ENDED
          },
        },
      });
    });

    return () => {
      active = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mediaType, mediaUrl, onVideoEnded]);

  if (!mediaType || !mediaUrl) return null;

  if (mediaType === "youtube") {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }

  if (mediaType === "image") {
    return (
      <img
        src={mediaUrl}
        alt="Vraag afbeelding"
        className="w-full rounded-xl mb-4 object-contain max-h-64"
      />
    );
  }

  if (mediaType === "audio") {
    return (
      <div className="w-full mb-4">
        <audio controls className="w-full rounded-lg">
          <source src={mediaUrl} />
          Je browser ondersteunt geen audio.
        </audio>
      </div>
    );
  }

  return null;
}
