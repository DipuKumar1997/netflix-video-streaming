// import { useEffect, useState } from 'react';
// import { getAllMovies } from './movieService';
// import { useNavigate } from 'react-router-dom';

// const MovieSection = () => {
//   const [movies, setMovies] = useState([]);
//   const [series, setSeries] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     getAllMovies().then((data: any) => {
//       setMovies(data.filter((m: any) => !m.isSeries));
//       setSeries(data.filter((m: any) => m.isSeries));
//     }).catch((err) => {
//       console.error("Error fetching movies:", err);
//     });
//   }, []);

//   const handleCardClick = (videoId: string) => {
//     console.log(videoId);
//     navigate(`/watch/${videoId}`);
//   };

//   const renderSection = (title: string, items: any[]) => (
//     <div className="mb-6">
//       <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
//       <div className="flex overflow-x-scroll gap-4">
//         {items.map((item: any) => (
//           <div
//             key={item.id}
//             className="min-w-[200px] bg-gray-900 rounded-lg shadow-md cursor-pointer hover:scale-105 transition"
//             onClick={() => handleCardClick(item.videoId)}
//           >
//             <img src={item.posterUrl} alt={item.title} className="w-full h-40 object-cover rounded-t-lg" />
//             <div className="p-2 text-white">
//               <h3 className="text-md">{item.title}</h3>
//               <p className="text-xs text-gray-400">{item.genre}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-4 bg-black min-h-screen">
//       {renderSection("Movies", movies)}
//       {renderSection("Web Series", series)}
//     </div>
//   );
// };

// export default MovieSection;


import { useEffect, useState, useRef } from 'react';
import { getAllMovies } from './movieService';
import { useNavigate } from 'react-router-dom';

const MovieSection = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMovies().then((res: any) => setData(res))
      .catch((err) => console.error("Error:", err));
  }, []);

  // Helper to filter data by genre
  const getByGenre = (genre: string) => data.filter(m => m.genre === genre);

  const handleCardClick = (videoId: string) => navigate(`/watch/${videoId}`);

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
      <div className="mb-10 group relative">
        <h2 className="text-2xl font-bold mb-4 text-white px-4 capitalize">{title}</h2>
        
        {/* Left Arrow Button */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-40 h-40 w-12 -translate-y-1/2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white text-3xl hidden md:block"
        >
          ‹
        </button>

        <div 
          ref={scrollRef}
          className="flex overflow-x-scroll gap-2 px-4 no-scrollbar scroll-smooth"
        >
          {items.map((item: any) => (
            <div
              key={item.id}
              className="min-w-[240px] md:min-w-[300px] h-40 relative rounded-md overflow-hidden cursor-pointer hover:scale-110 hover:z-50 transition-all duration-300 shadow-xl"
              onClick={() => handleCardClick(item.videoId)}
            >
              <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-[10px] text-gray-300">{item.genre}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-40 h-40 w-12 -translate-y-1/2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white text-3xl hidden md:block"
        >
          ›
        </button>
      </div>
    );
  };

  return (
    <div className="py-12 bg-[#141414] min-h-screen">
      {/* Dynamic Sections Based on Genre */}
      <HorizontalRow title="Trending Sci-Fi" items={getByGenre("Sci-Fi")} />
      <HorizontalRow title="Crime Thrillers" items={getByGenre("Crime")} />
      <HorizontalRow title="Fantasy Worlds" items={getByGenre("Fantasy")} />
      
      {/* Fallback for anything else */}
      <HorizontalRow title="Everything Else" items={data.filter(m => !["Sci-Fi", "Crime", "Fantasy"].includes(m.genre))} />
    </div>
  );
};

export default MovieSection;