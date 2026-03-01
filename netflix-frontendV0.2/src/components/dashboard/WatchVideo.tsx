// import { useParams } from "react-router-dom";
//
// const WatchVideo = () => {
//   const { videoId } = useParams();
//
//   return (
//     <div className="bg-black min-h-screen flex items-center justify-center">
//       <video
//         src={`http://localhost:8080/stream/range/${videoId}`}
//         controls
//         autoPlay
//         style={{ width: "80%", borderRadius: "12px" }}
//       />
//     </div>
//   );
// };
//
// export default WatchVideo;

// import React, { useEffect } from 'react';
// import { useParams } from "react-router-dom";
// import Hls from 'hls.js';
//
// const WatchVideo = () => {
//     const { videoId } = useParams();
//     const videoRef = React.useRef(null);
//
//     useEffect(() => {
//         if (Hls.isSupported() && videoRef.current) {
//             const hls = new Hls({
//                 debug: true
//             });
//             hls.loadSource(`http://localhost:8080/stream/${videoId}/master.m3u8`);
//             hls.attachMedia(videoRef.current);
//             hls.on(Hls.Events.MANIFEST_PARSED, function () {
//                 console.log("Manifest loaded");
//                 videoRef.current.play();
//             });
//             hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
//                 console.log("Quality switched to level:", data.level);
//             });
//             hls.on(Hls.Events.ERROR, function (event, data) {
//                 console.error("HLS error:", data);
//             });
//             return () => {
//                 hls.destroy();
//             };
//         }
//     }, [videoId]);

//     return (
//         <div className="bg-black min-h-screen flex items-center justify-center">
//             <video
//                 ref={videoRef}
//                 autoPlay
//                 controls
//                 style={{ width: "80%", borderRadius: "12px" }}
//                 crossOrigin="anonymous"
//             />
//         </div>
//     );
// };
//
// import videojs from "video.js";
// import "video.js/dist/video-js.css";
// import "videojs-hls-quality-selector";
// import { useParams } from "react-router-dom";
//
// import { useEffect, useRef } from "react";
//
// const WatchVideo = ({ videoId }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);
//
//   useEffect(() => {
//     if (!playerRef.current) {
//       const videoElement = videoRef.current;
//         const { videoId } = useParams();
//         console.log("videoId param:", videoId);
//          if (!videoId) return;
//       playerRef.current = videojs(videoElement, {
//         controls: true,
//         fluid: true,
//         sources: [
//           {
//             src: `http://localhost:8080/stream/${videoId}/master.m3u8`,
//             type: "application/x-mpegURL"
//           }
//         ]
//       }, function () {
//         this.hlsQualitySelector({ displayCurrentQuality: true });
//       });
//     }
//
//     return () => {
//       if (playerRef.current) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [videoId]);
//
//   return (
//     <div>
//       <video
//         ref={videoRef}
//         className="video-js vjs-big-play-centered"
//       />
//     </div>
//   );
// };
//
// export default WatchVideo;

import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";

const WatchVideo = () => {
  const { videoId } = useParams();   
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;  // guard

    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();

      hls.loadSource(
        `http://localhost:8080/stream/${videoId}/master.m3u8`
      );

      hls.attachMedia(videoRef.current);

      return () => {
        hls.destroy();
      };
    }
  }, [videoId]);

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ width: "80%", borderRadius: "12px" }}
      />
    </div>
  );
};

export default WatchVideo;