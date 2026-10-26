// import { useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import videojs from "video.js";
// import type { FC } from "react";
// import { ArrowLeft } from "lucide-react";
//
// import "video.js/dist/video-js.css";
// import "./WatchVideo.css";
//
// type VideoPlayer = ReturnType<typeof videojs>;
//
// type QualityLevel = {
//   height?: number;
//   width?: number;
//   bitrate?: number;
//   enabled: boolean;
// };
//
// type QualityLevelList = {
//   length: number;
//   [index: number]: QualityLevel;
//   on: (event: string, callback: () => void) => void;
//   off?: (event: string, callback: () => void) => void;
// };
//
// type QualityPlayer = VideoPlayer & {
//   qualityLevels?: () => QualityLevelList;
// };
//
// const WatchVideo: FC = () => {
//   const { videoId } = useParams<{ videoId: string }>();
//   const navigate = useNavigate();
//
//   const playerRef = useRef<VideoPlayer | null>(null);
//   const hostRef = useRef<HTMLDivElement | null>(null);
//
//   useEffect(() => {
//     const host = hostRef.current;
//
//     if (!host || !videoId) return;
//
//     // Create the Video.js element.
//     const videoElement = document.createElement("video-js");
//     videoElement.className = "video-js vjs-big-play-centered";
//     videoElement.setAttribute("playsinline", "true");
//     host.appendChild(videoElement);
//
//     const player = videojs(videoElement, {
//       autoplay: true,
//       controls: true,
//       preload: "auto",
//       responsive: true,
//       fluid: false,
//       playsinline: true,
//       html5: {
//         vhs: {
//           overrideNative: true,
//         },
//       },
//       sources: [
//         {
//           src: `/stream/${encodeURIComponent(videoId)}/master.m3u8`,
//           type: "application/x-mpegURL",
//         },
//       ],
//     });
//
//     playerRef.current = player;
//
//     let qualityLevels: QualityLevelList | undefined;
//     let qualitySelect: HTMLSelectElement | null = null;
//
//     const refreshOptions = () => {
//       if (!qualityLevels || !qualitySelect) return;
//
//       const previousValue = qualitySelect.value;
//       const heights = new Set<number>();
//
//       for (let i = 0; i < qualityLevels.length; i++) {
//         const height = qualityLevels[i]?.height;
//
//         if (typeof height === "number" && height > 0) {
//           heights.add(height);
//         }
//       }
//
//       const sortedHeights = Array.from(heights).sort((a, b) => b - a);
//
//       qualitySelect.replaceChildren();
//
//       const autoOption = document.createElement("option");
//       autoOption.value = "auto";
//       autoOption.textContent = "Auto";
//       qualitySelect.appendChild(autoOption);
//
//       for (const height of sortedHeights) {
//         const option = document.createElement("option");
//         option.value = String(height);
//         option.textContent = `${height}p`;
//         qualitySelect.appendChild(option);
//       }
//
//       // Keep the current selection if it is still available.
//       const optionExists = Array.from(qualitySelect.options).some(
//         (option) => option.value === previousValue,
//       );
//
//       qualitySelect.value = optionExists ? previousValue : "auto";
//     };
//
//     const applyQuality = (selectedValue: string) => {
//       if (!qualityLevels) return;
//
//       const selectedHeight =
//         selectedValue === "auto" ? null : Number(selectedValue);
//
//       // Only change rendition eligibility.
//       // Do not clear the buffer or force an immediate quality change.
//       for (let i = 0; i < qualityLevels.length; i++) {
//         const level = qualityLevels[i];
//
//         if (!level) continue;
//
//         level.enabled =
//           selectedHeight === null || level.height === selectedHeight;
//       }
//
//       console.info(
//         `[Quality] Selected ${
//           selectedHeight === null ? "Auto" : `${selectedHeight}p`
//         }`,
//       );
//     };
//
//     const onQualityChange = () => {
//       if (qualitySelect) {
//         applyQuality(qualitySelect.value);
//       }
//     };
//
//     const setupQualitySelector = () => {
//         const qualityPlayer = player as QualityPlayer;
//         qualityLevels = qualityPlayer.qualityLevels?.();
//
//         if (!qualityLevels) {
//           console.warn(
//             "[Quality] qualityLevels API is unavailable. Check your Video.js plugin setup.",
//           );
//           return;
//         }
//
//         const playerElement = player.el();
//
//         if (!(playerElement instanceof HTMLElement)) {
//           return;
//         }
//
//         const controlBar = playerElement.querySelector(".vjs-control-bar");
//
//         if (!controlBar) {
//           console.warn("[Quality] Video.js control bar not found.");
//           return;
//         }
//
//         // Remove any existing custom quality selector to avoid duplicates.
//         controlBar
//           .querySelector(".custom-quality-control")
//           ?.remove();
//
//         // Create the dropdown.
//         qualitySelect = document.createElement("select");
//         qualitySelect.className = "custom-quality-selector";
//         qualitySelect.setAttribute("aria-label", "Video quality");
//         qualitySelect.title = "Select video quality";
//
//         Object.assign(qualitySelect.style, {
//           width: "auto",
//           maxWidth: "90px",
//           height: "30px",
//           padding: "0 5px",
//           color: "#ffffff",
//           backgroundColor: "#222222",
//           border: "1px solid #666666",
//           borderRadius: "4px",
//           fontSize: "12px",
//           cursor: "pointer",
//           outline: "none",
//         });
//
//         // Create a Video.js control-bar item.
//         const qualityControl = document.createElement("div");
//         qualityControl.className = "vjs-control custom-quality-control";
//
//         Object.assign(qualityControl.style, {
//           width: "auto",
//           minWidth: "65px",
//           flex: "0 0 auto",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "0 6px",
//         });
//
//         qualityControl.appendChild(qualitySelect);
//         controlBar.appendChild(qualityControl);
//
//         // Populate Auto, 1080p, 720p, and 360p as available.
//         refreshOptions();
//
//         // Apply the selected rendition.
//         qualitySelect.addEventListener("change", onQualityChange);
//
//         // Refresh options when VHS discovers additional renditions.
//         qualityLevels.on("addqualitylevel", refreshOptions);
//
//         // Default to adaptive bitrate selection.
//         qualitySelect.value = "auto";
//         applyQuality("auto");
//
//         console.info("[Quality] Selector added to Video.js control bar.");
//       };
//
//     player.ready(() => {
//       setupQualitySelector();
//     });
//
//     return () => {
//       if (qualitySelect) {
//         qualitySelect.removeEventListener("change", onQualityChange);
//         qualitySelect.remove();
//       }
//
//       qualityLevels?.off?.("addqualitylevel", refreshOptions);
//
//       if (!player.isDisposed()) {
//         player.dispose();
//       }
//
//       playerRef.current = null;
//     };
//   }, [videoId]);
//
//   return (
//     <div className="watch-video-page">
//       <button
//         type="button"
//         className="watch-back-button"
//         onClick={() => navigate(-1)}
//         aria-label="Go back"
//       >
//         <ArrowLeft size={20} />
//         <span>Back</span>
//       </button>
//
//       <div className="watch-player-host" ref={hostRef} />
//     </div>
//   );
// };
//
// export default WatchVideo;

//
// import React, { useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";
//
// if (typeof window !== "undefined") {
//   (window as any).videojs = videojs;
// }
//
// import "videojs-contrib-quality-levels";
// import "videojs-hls-quality-selector";
// import { ArrowLeft, Download } from "lucide-react";
//
// const WatchVideo: React.FC = () => {
//   const { videoId } = useParams<{ videoId: string }>();
//   const navigate = useNavigate();
//   const videoNodeRef = useRef<HTMLDivElement | null>(null);
//   const playerRef = useRef<any>(null);
//
//   const streamUrl = `/stream/${videoId}/master.m3u8`;
//
//   useEffect(() => {
//     const siteHeader = document.querySelector("nav") || document.querySelector("header");
//     if (siteHeader) siteHeader.style.display = "none";
//
//     if (!videoId || !videoNodeRef.current) return;
//
//     if (playerRef.current) {
//       playerRef.current.dispose();
//       playerRef.current = null;
//     }
//
//     videoNodeRef.current.innerHTML = "";
//
//     const videoElement = document.createElement("video-js");
//     videoElement.classList.add("vjs-big-play-centered", "vjs-netflix-theme");
//     videoNodeRef.current.appendChild(videoElement);
//
//     const player = (playerRef.current = videojs(
//       videoElement,
//       {
//         autoplay: true,
//         controls: true,
//         responsive: true,
//         fluid: false,
//         html5: {
//           vhs: {
//             overrideNative: true,
//             GOAL_BUFFER_LENGTH: 15,       // Buffer 15s ahead (1-2 segments max)
//             MAX_GOAL_BUFFER_LENGTH: 30,   // Stop buffering when 30s ahead is reached
//             smoothQualityChange: true,    // Instant YouTube-style quality switching
//           },
//         },
//         sources: [
//           {
//             src: streamUrl,
//             type: "application/x-mpegURL",
//           },
//         ],
//       },
//       function onPlayerReady() {
//         if (typeof (player as any).hlsQualitySelector === "function") {
//           (player as any).hlsQualitySelector({
//             displayCurrentQuality: true,
//           });
//         }
//       }
//     ));
//
//     return () => {
//       if (siteHeader) siteHeader.style.display = "";
//       if (playerRef.current && !playerRef.current.isDisposed()) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [videoId]);
//
//   const handleDownload = () => {
//     const downloadAnchor = document.createElement("a");
//     downloadAnchor.href = streamUrl;
//     downloadAnchor.download = `video-${videoId}.m3u8`;
//     document.body.appendChild(downloadAnchor);
//     downloadAnchor.click();
//     document.body.removeChild(downloadAnchor);
//   };
//
//   return (
//     <div className="fixed inset-0 z-[99999] bg-black w-screen h-screen flex items-center justify-center overflow-hidden">
//       {/* Floating Header Actions */}
//       <div className="fixed top-6 left-6 right-6 z-[100000] flex items-center justify-between pointer-events-none">
//         <button
//           onClick={() => navigate(-1)}
//           className="pointer-events-auto flex items-center gap-2 text-white bg-black/70 hover:bg-red-600 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-2xl border border-white/20 cursor-pointer"
//         >
//           <ArrowLeft size={20} />
//           <span className="font-semibold text-sm">Back</span>
//         </button>
//
//         <button
//           onClick={handleDownload}
//           className="pointer-events-auto flex items-center gap-2 text-white bg-black/70 hover:bg-blue-600 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-2xl border border-white/20 cursor-pointer"
//         >
//           <Download size={20} />
//           <span className="font-semibold text-sm">Download</span>
//         </button>
//       </div>
//
//       <div
//         ref={videoNodeRef}
//         className="w-full h-full [&_.video-js]:w-full [&_.video-js]:h-full [&_.vjs-tech]:object-contain"
//       />
//     </div>
//   );
// };
//
// export default WatchVideo;

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";
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

  const streamUrl = `/stream/${videoId}/master.m3u8`;

  // Synchronously fetch and sync available resolution levels from Video.js
  const syncQualityLevels = () => {
    const p = playerRef.current as any;
    if (!p || typeof p.qualityLevels !== "function") return;

    const qualityLevels = p.qualityLevels();
    const options: QualityOption[] = [];

    for (let i = 0; i < qualityLevels.length; i++) {
      const level = qualityLevels[i];
      const h = level.height || (level.attributes && level.attributes.RESOLUTION ? level.attributes.RESOLUTION.height : 0);
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
    const siteHeader = document.querySelector("nav") || document.querySelector("header");
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

          // 1. Initialize Video.js Bottom Bar Gear Menu
          if (typeof p.hlsQualitySelector === "function") {
            p.hlsQualitySelector({
              displayCurrentQuality: true,
            });
          }

          // 2. Setup Quality Levels Listener & Immediate Sync
          if (typeof p.qualityLevels === "function") {
            const qualityLevels = p.qualityLevels();

            // Sync immediately in case levels were pre-parsed
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = streamUrl;
    link.download = `video-${videoId}.m3u8`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  : qualities.find((q) => q.index === selectedQuality)?.label || "Quality"}
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
                    selectedQuality === -1 ? "text-red-500 font-bold bg-white/10" : "text-white"
                  }`}
                >
                  <span>Auto</span>
                  {selectedQuality === -1 && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                </button>
                {qualities.map((q) => (
                  <button
                    key={q.index}
                    onClick={() => changeQuality(q.index)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition hover:bg-red-600/30 ${
                      selectedQuality === q.index ? "text-red-500 font-bold bg-white/10" : "text-white"
                    }`}
                  >
                    <span>{q.label}</span>
                    {selectedQuality === q.index && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
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
