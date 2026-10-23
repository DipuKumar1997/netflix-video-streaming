import { useEffect, useState, useRef } from 'react';
import { getAllMovies } from './movieService';
import { useNavigate } from 'react-router-dom';

const MovieSection = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMovies().then((res: any) => setData(res))
      .catch((err) => console.error("Error fetching movies:", err));
  }, []);

  const getByGenre = (genre: string) => data.filter(m => m.genre?.toLowerCase() === genre.toLowerCase());

  const HorizontalRow = ({ title, items }: { title: string, items: any[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    if (items.length === 0) return null;

    return (
      <div className="mb-12 group relative px-4 md:px-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">{title}</h2>
        <div className="relative flex items-center">
          {/* Custom Navigation Arrow */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 z-40 h-full w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-4xl hidden md:block"
          >
            ‹
          </button>


          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-2 no-scrollbar scroll-smooth"
          >
            {items.map((item: any) => (
              <div
                key={item.id}
                className="relative min-w-[200px] md:min-w-[300px] aspect-video rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg"
                onClick={() => navigate(`/watch/${item.videoId}`)}
              >
                <img 
                  src={item.posterUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover rounded-md bg-gray-900" 
                  onError={(e: any) => e.target.src = "https://via.placeholder.com/300x160?text=No+Poster"}
                />
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 z-40 h-full w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-4xl hidden md:block"
          >
            ›
          </button>

        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#141414] min-h-screen pt-28"> {/* pt-28 ensures content is below navbar */}
      <HorizontalRow title="Trending Sci-Fi" items={getByGenre("Sci-Fi")} />
      <HorizontalRow title="Crime Thrillers" items={getByGenre("Crime")} />
      <HorizontalRow title="Fantasy Worlds" items={getByGenre("Fantasy")} />
      <HorizontalRow title="Everything Else" items={data.filter(m => !["sci-fi", "crime", "fantasy"].includes(m.genre?.toLowerCase()))} />
    </div>
  );
};

export default MovieSection;