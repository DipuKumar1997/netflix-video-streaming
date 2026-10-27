import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Cookies from "js-cookie";
import { ArrowLeft, Download, Settings } from "lucide-react";

interface QualityOption {
  index: number;
  label: string;
  height: number;
}

const WatchVideo: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const videoNodeRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  // Target streaming endpoint matching VideoController
  // const streamUrl = `/api/videos/${videoId}/master.m3u8`;
  const streamUrl =`/stream/${videoId}/master.m3u8`;

  // Synchronously fetch and sync available resolution levels from Video.js
  const syncQualityLevels = () => {
    const p = playerRef.current as any;
    if (!p || typeof p.qualityLevels !== "function") return;

    const qualityLevels = p.qualityLevels();
    const options: QualityOption[] = [];

    for (let i = 0; i < qualityLevels.length; i++) {
      const level = qualityLevels[i];
      const h =
        level.height ||
        (level.attributes && level.attributes.RESOLUTION
          ? level.attributes.RESOLUTION.height
          : 0);
      options.push({
        index: i,
        label: h ? `${h}p` : `Rendition ${i + 1}`,
        height: h,
      });
    }

    // Sort descending (1080p -> 720p -> 360p)
    options.sort((a, b) => b.height - a.height);
    setQualities(options);
  };

  useEffect(() => {
    const siteHeader =
      document.querySelector("nav") || document.querySelector("header");
    if (siteHeader) siteHeader.style.display = "none";

    if (!videoId || !videoNodeRef.current) return;

    if (typeof window !== "undefined") {
      (window as any).videojs = videojs;
    }

    Promise.all([
      import("videojs-contrib-quality-levels"),
      import("videojs-hls-quality-selector"),
    ]).then(() => {
      if (!videoNodeRef.current) return;

      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      videoNodeRef.current.innerHTML = "";

      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered", "vjs-netflix-theme");
      videoNodeRef.current.appendChild(videoElement);

      const token =
          Cookies.get("jwtToken") ||
          Cookies.get("token") ||
          localStorage.getItem("jwtToken") ||
          localStorage.getItem("token");

      const player = (playerRef.current = videojs(
        videoElement,
        {
          autoplay: true,
          controls: true,
          responsive: true,
          fluid: false,
          html5: {
            vhs: {
              overrideNative: true,
              withCredentials: false,
              // Inject JWT token into Video.js XHR requests for HLS gating
              beforeRequest: (options: any) => {
                if (token) {
                  options.headers = options.headers || {};
                  options.headers["Authorization"] = `Bearer ${token}`;
                }
                return options;
              },
              GOAL_BUFFER_LENGTH: 15,
              MAX_GOAL_BUFFER_LENGTH: 30,
              smoothQualityChange: true,
            },
          },
          sources: [
            {
              src: streamUrl,
              type: "application/x-mpegURL",
            },
          ],
        },
        function onPlayerReady() {
          const p = player as any;

          // 1. Handle 403 Forbidden / Premium Gating Errors
          p.on("error", () => {
            const error = p.error();
            if (error && (error.code === 4 || error.status === 403)) {
              alert("Premium subscription required to stream this content!");
              navigate("/subscription");
            }
          });

          // 2. Initialize Video.js Bottom Bar Gear Menu
          if (typeof p.hlsQualitySelector === "function") {
            p.hlsQualitySelector({
              displayCurrentQuality: true,
            });
          }

          // 3. Setup Quality Levels Listener & Immediate Sync
          if (typeof p.qualityLevels === "function") {
            const qualityLevels = p.qualityLevels();
            syncQualityLevels();
            qualityLevels.on("addqualitylevel", syncQualityLevels);
            qualityLevels.on("change", syncQualityLevels);
          }
        }
      ));
    });

    return () => {
      if (siteHeader) siteHeader.style.display = "";
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Open menu and force refresh quality options
  const toggleQualityMenu = () => {
    syncQualityLevels();
    setShowQualityMenu((prev) => !prev);
  };

  // Switch playback resolution instantly at current timestamp
  const changeQuality = (qualityIndex: number) => {
    setSelectedQuality(qualityIndex);
    setShowQualityMenu(false);

    const p = playerRef.current as any;
    if (p && typeof p.qualityLevels === "function") {
      const qualityLevels = p.qualityLevels();
      for (let i = 0; i < qualityLevels.length; i++) {
        if (qualityIndex === -1) {
          qualityLevels[i].enabled = true; // Auto mode
        } else {
          qualityLevels[i].enabled = i === qualityIndex; // Single resolution target
        }
      }
    }
  };

  const handleDownload = async () => {
    try {
      const token = Cookies.get("jwtToken");
      const res = await fetch(streamUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        alert("Upgrade to Premium to download this video.");
        return navigate("/subscription");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `video-${videoId}.m3u8`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Download failed: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black w-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="fixed top-6 left-6 right-6 z-[100000] flex items-center justify-between pointer-events-none">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex items-center gap-2 text-white bg-black/70 hover:bg-red-600 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-2xl border border-white/20 cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold text-sm">Back</span>
        </button>

        {/* Action Buttons: Quality Dropdown & Download */}
        <div className="pointer-events-auto flex items-center gap-3 relative">
          {/* Quality Selector Dropdown Button */}
          <div className="relative">
            <button
              onClick={toggleQualityMenu}
              className="flex items-center gap-2 text-white bg-black/70 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-2xl border border-white/20 cursor-pointer text-sm font-semibold"
            >
              <Settings size={18} />
              <span>
                {selectedQuality === -1
                  ? "Auto Quality"
                  : qualities.find((q) => q.index === selectedQuality)?.label ||
                    "Quality"}
              </span>
            </button>

            {/* Dropdown Options List */}
            {showQualityMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl py-2 z-[100001] backdrop-blur-lg">
                <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                  Video Quality
                </div>
                <button
                  onClick={() => changeQuality(-1)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition hover:bg-red-600/30 ${
                    selectedQuality === -1
                      ? "text-red-500 font-bold bg-white/10"
                      : "text-white"
                  }`}
                >
                  <span>Auto</span>
                  {selectedQuality === -1 && (
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                {qualities.map((q) => (
                  <button
                    key={q.index}
                    onClick={() => changeQuality(q.index)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition hover:bg-red-600/30 ${
                      selectedQuality === q.index
                        ? "text-red-500 font-bold bg-white/10"
                        : "text-white"
                    }`}
                  >
                    <span>{q.label}</span>
                    {selectedQuality === q.index && (
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-white bg-black/70 hover:bg-blue-600 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-2xl border border-white/20 cursor-pointer text-sm font-semibold"
          >
            <Download size={18} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Video.js Container */}
      <div
        ref={videoNodeRef}
        className="w-full h-full [&_.video-js]:!w-full [&_.video-js]:!h-full [&_.vjs-tech]:!object-contain"
      />
    </div>
  );
};

export default WatchVideo;