import { useEffect, useState, useRef } from 'react';
import { getAllMovies } from './movieService';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Crown, Lock, X } from 'lucide-react';

const MovieSection = () => {
  const [data, setData] = useState<any[]>([]);
  const [userIsPremium, setUserIsPremium] = useState<boolean>(false);
  const [selectedLockMovie, setSelectedLockMovie] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMovies()
      .then((res: any) => setData(res))
      .catch((err) => console.error("Error fetching movies:", err));

    // Decode JWT token / user role to check premium status
    const role = Cookies.get('userRole') || localStorage.getItem('userRole');
    const token = Cookies.get('jwtToken');

    if (role === 'ROLE_PREMIUM' || role === 'PREMIUM') {
      setUserIsPremium(true);
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (
          payload.roles?.includes('ROLE_PREMIUM') ||
          payload.role === 'ROLE_PREMIUM' ||
          payload.isPremium
        ) {
          setUserIsPremium(true);
        }
      } catch (e) {
        // Token parse fallback
      }
    }
  }, []);

  const handleMovieClick = (movie: any) => {
    const isMoviePremium = movie.isPremium || movie.premium;
    if (isMoviePremium && !userIsPremium) {
      setSelectedLockMovie(movie);
      return;
    }
    navigate(`/watch/${movie.videoId}`);
  };

  const getByGenre = (genre: string) => data.filter((m) => m.genre?.toLowerCase() === genre.toLowerCase());

  const HorizontalRow = ({ title, items }: { title: string; items: any[] }) => {
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
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-40 h-full w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-4xl hidden md:block rounded-l-md cursor-pointer"
          >
            ‹
          </button>

          <div ref={scrollRef} className="flex overflow-x-auto gap-3 no-scrollbar scroll-smooth py-2">
            {items.map((item: any) => {
              const isItemPremium = item.isPremium || item.premium;
              return (
                <div
                  key={item.id || item.videoId}
                  className="relative min-w-[200px] md:min-w-[300px] aspect-video rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg group/card"
                  onClick={() => handleMovieClick(item)}
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-md bg-gray-900"
                    onError={(e: any) => (e.target.src = "https://via.placeholder.com/300x160?text=No+Poster")}
                  />

                  {/* Premium Badge */}
                  {isItemPremium ? (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1 shadow-xl border border-amber-300 z-10">
                      <Crown size={14} className="fill-black text-black" />
                      <span>PREMIUM</span>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold z-10">
                      FREE
                    </div>
                  )}

                  {/* Title Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-white font-semibold text-sm truncate">{item.title}</span>
                    {isItemPremium && !userIsPremium && (
                      <span className="text-amber-400 text-xs flex items-center gap-1 mt-1 font-medium">
                        <Lock size={12} /> Requires Premium
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-40 h-full w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-4xl hidden md:block rounded-r-md cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#141414] min-h-screen pt-28">
      <HorizontalRow title="Trending Sci-Fi" items={getByGenre("Sci-Fi")} />
      <HorizontalRow title="Crime Thrillers" items={getByGenre("Crime")} />
      <HorizontalRow title="Fantasy Worlds" items={getByGenre("Fantasy")} />
      <HorizontalRow
        title="Everything Else"
        items={data.filter((m) => !["sci-fi", "crime", "fantasy"].includes(m.genre?.toLowerCase()))}
      />

      {/* Subscription Required Modal */}
      {selectedLockMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-amber-500/30 p-6 rounded-2xl max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedLockMovie(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Crown size={28} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Premium Content</h3>
            <p className="text-gray-400 text-sm">
              "<span className="text-white font-semibold">{selectedLockMovie.title}</span>" requires an active Premium subscription. Upgrade your account to watch.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setSelectedLockMovie(null)}
                className="flex-1 py-2 text-sm font-semibold text-gray-300 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-black rounded-lg hover:brightness-110 transition cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSection;