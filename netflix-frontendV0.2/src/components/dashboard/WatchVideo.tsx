// src/components/WatchVideo.jsx
import { useParams } from "react-router-dom";

const WatchVideo = () => {
  const { videoId } = useParams();

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <video
        src={`http://localhost:8080/stream/range/${videoId}`}
        controls
        autoPlay
        style={{ width: "80%", borderRadius: "12px" }}
      />
    </div>
  );
};

export default WatchVideo;