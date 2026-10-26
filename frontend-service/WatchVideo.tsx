import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import { ArrowLeft } from "lucide-react";

import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

const WatchVideo: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const videoNodeRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    const container = videoNodeRef.current;
    if (!videoId || !container) return;

    const siteHeader =
      document.querySelector("nav") ?? document.querySelector("header");
    const previousHeaderDisplay =
      siteHeader instanceof HTMLElement ? siteHeader.style.display : "";

    if (siteHeader instanceof HTMLElement) {
      siteHeader.style.display = "none";
    }

    // Dispose of any previous player before initializing a new one.
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
    }
    playerRef.current = null;
    container.replaceChildren();

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-netflix-theme");
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";
    container.appendChild(videoElement);

    const player = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: false,
      preload: "auto",
      html5: {
        vhs: {
          overrideNative: true,
        },
      },
      sources: [
        {
          src: `/stream/${encodeURIComponent(videoId)}/master.m3u8`,
          type: "application/x-mpegURL",
        },
      ],
    });

    playerRef.current = player;

    player.on("loadstart", () => {
      console.info("[Video] Loading source:", player.currentSrc());
    });

    player.on("loadedmetadata", () => {
      console.info("[Video] Playlist metadata loaded");
    });

    player.on("waiting", () => {
      console.warn("[Video] Waiting for media data");
    });

    player.on("stalled", () => {
      console.warn("[Video] Media download stalled");
    });

    player.on("playing", () => {
      console.info("[Video] Playback started");
    });

    player.on("error", () => {
      const error = player.error();
      console.error("[Video.js] Playback error:", {
        code: error?.code,
        message: error?.message,
        source: player.currentSrc(),
      });
    });

    player.ready(() => {
      // Plugin methods are added to Video.js at runtime, so their types
      // are not necessarily included in the base Player type.
      const qualityPlayer = player as Player & {
        qualityLevels?: () => {
          length: number;
          [index: number]: {
            height?: number;
            width?: number;
            bitrate?: number;
            enabled?: boolean;
          };
          on: (event: string, callback: () => void) => void;
        };
        hlsQualitySelector?: (options: {
          displayCurrentQuality: boolean;
        }) => void;
      };

      if (typeof qualityPlayer.qualityLevels !== "function") {
        console.error(
          "[Quality] Quality-level plugin is not registered. Check plugin imports and versions."
        );
        return;
      }

      const levels = qualityPlayer.qualityLevels();
      const logQualities = () => {
        const availableLevels = Array.from({ length: levels.length }, (_, index) => {
          const level = levels[index];
          return {
            height: level.height,
            width: level.width,
            bitrate: level.bitrate,
            enabled: level.enabled,
          };
        });

        console.info("[Quality] Available HLS levels:", availableLevels);
      };

      logQualities();
      levels.on("addqualitylevel", logQualities);

      if (typeof qualityPlayer.hlsQualitySelector !== "function") {
        console.error(
          "[Quality] HLS quality-selector plugin is not registered. Check plugin imports and versions."
        );
        return;
      }

      qualityPlayer.hlsQualitySelector({ displayCurrentQuality: true });
    });

    return () => {
      if (playerRef.current === player) {
        playerRef.current = null;
      }

      if (!player.isDisposed()) {
        player.dispose();
      }

      if (siteHeader instanceof HTMLElement) {
        siteHeader.style.display = previousHeaderDisplay;
      }
    };
  }, [videoId]);

  return (
    <div className="watch-player-container">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="fixed left-6 top-6 z-[100000] flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-colors hover:bg-red-600"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <div ref={videoNodeRef} className="watch-player-host" />
    </div>
  );
};

export default WatchVideo;
