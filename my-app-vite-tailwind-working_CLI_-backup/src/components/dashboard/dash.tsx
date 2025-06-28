import { useEffect, useState } from 'react';
import { getAllMovies } from './movieService';
import { useNavigate } from 'react-router-dom';

const MovieSection = () => {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMovies().then((data: any) => {
      setMovies(data.filter((m: any) => !m.isSeries));
      setSeries(data.filter((m: any) => m.isSeries));
    }).catch((err) => {
      console.error("Error fetching movies:", err);
    });
  }, []);

  const handleCardClick = (videoId: string) => {
    console.log(videoId);
    navigate(`/watch/${videoId}`);
  };

  const renderSection = (title: string, items: any[]) => (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
      <div className="flex overflow-x-scroll gap-4">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="min-w-[200px] bg-gray-900 rounded-lg shadow-md cursor-pointer hover:scale-105 transition"
            onClick={() => handleCardClick(item.videoId)}
          >
            <img src={item.posterUrl} alt={item.title} className="w-full h-40 object-cover rounded-t-lg" />
            <div className="p-2 text-white">
              <h3 className="text-md">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-black min-h-screen">
      {renderSection("Movies", movies)}
      {renderSection("Web Series", series)}
    </div>
  );
};

export default MovieSection;
