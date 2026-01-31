// import { useState, useEffect } from 'react';
// import logo from '../../assets/logo.png';
// import search_icon from '../../assets/search_icon.svg';
// import bell_icon from '../../assets/bell_icon.svg';
// import profile_img from '../../assets/profile_img.png';
// import caret_icon from '../../assets/caret_icon.svg';

// const Navbar = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [showSearchOverlay, setShowSearchOverlay] = useState(false); // Controls the search box
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 0);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <>
//       <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 flex items-center justify-between px-4 md:px-12 py-3 ${isScrolled ? 'bg-black' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'}`}>
        
//         {/* Left Section: Logo & Nav Links */}
//         <div className="flex items-center gap-10">
//           <img src={logo} alt="Netflix" className="w-24 md:w-32 cursor-pointer" />
//           <ul className="hidden lg:flex items-center gap-6 text-sm text-gray-200">
//             <li className="cursor-pointer hover:text-white transition">Home</li>
//             <li className="cursor-pointer hover:text-white transition">TV Shows</li>
//             <li className="cursor-pointer hover:text-white transition font-bold text-white border-b-2 border-red-600">Movies</li>
//             <li className="cursor-pointer hover:text-white transition">New & Popular</li>
//             <li className="cursor-pointer hover:text-white transition">My List</li>
//             <li className="cursor-pointer hover:text-white transition">Browse by Languages</li>
//           </ul>
//         </div>

//         {/* Right Section: Icons */}
//         <div className="flex items-center gap-6">
//           <img 
//             src={search_icon} 
//             alt="Search" 
//             className="w-5 cursor-pointer hover:scale-110 transition" 
//             onClick={() => setShowSearchOverlay(true)} // Open search on click
//           />
//           <img src={bell_icon} alt="Notifications" className="w-5 cursor-pointer hover:scale-110 transition" />
//           <div className="flex items-center gap-2 cursor-pointer group">
//             <img src={profile_img} alt="User" className="w-8 rounded" />
//             <img src={caret_icon} alt="Dropdown" className="w-3 transition-transform group-hover:rotate-180" />
//           </div>
//         </div>
//       </nav>

//       {/* Search Overlay */}
//       {showSearchOverlay && (
//         <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col items-center pt-24 px-4">
//           <div className="w-full max-w-2xl relative">
//             <input
//               autoFocus
//               type="text"
//               placeholder="Titles, people, genres..."
//               className="w-full bg-transparent border-b border-gray-600 text-white text-2xl py-2 focus:outline-none focus:border-white transition"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <button 
//               onClick={() => {setShowSearchOverlay(false); setSearchTerm('');}}
//               className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-3xl"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Navbar;


import { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png';
import search_icon from '../../assets/search_icon.svg';
import bell_icon from '../../assets/bell_icon.svg';
import profile_img from '../../assets/profile_img.png';
import caret_icon from '../../assets/caret_icon.svg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  // Get URL from Env
  const SEARCH_URL = import.meta.env.VITE_SEARCH_SERVICE_URL || 'http://localhost:8086';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.length > 1) {
      try {
        // Dynamic fetch using environment variable
        const response = await fetch(`${SEARCH_URL}/search/autocomplete-n-gram?query=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Search Service Unreachable:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 flex items-center justify-between px-4 md:px-12 py-3 ${isScrolled ? 'bg-black' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'}`}>
        
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-10">
          <img src={logo} alt="Netflix" className="w-24 md:w-32 cursor-pointer" />
          <ul className="hidden lg:flex items-center gap-6 text-[13px] text-gray-200 font-medium">
            <li className="cursor-pointer hover:text-gray-400">Home</li>
            <li className="cursor-pointer hover:text-gray-400">TV Shows</li>
            <li className="cursor-pointer text-white font-bold">Movies</li>
            <li className="cursor-pointer hover:text-gray-400">New & Popular</li>
            <li className="cursor-pointer hover:text-gray-400">My List</li>
            <li className="cursor-pointer hover:text-gray-400">Browse by Languages</li>
          </ul>
        </div>

        {/* Right Section: Icons */}
        <div className="flex items-center gap-6">
          <img 
            src={search_icon} 
            alt="Search" 
            className="w-5 cursor-pointer hover:scale-110 transition" 
            onClick={() => setShowSearchOverlay(true)} 
          />
          <img src={bell_icon} alt="Notifications" className="w-5 cursor-pointer" />
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src={profile_img} alt="User" className="w-8 rounded" />
            <img src={caret_icon} alt="Dropdown" className="w-3 transition-transform group-hover:rotate-180" />
          </div>
        </div>
      </nav>

      {/* Search Overlay Implementation */}
      {showSearchOverlay && (
        <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col items-center pt-24 px-4">
          <div className="w-full max-w-2xl relative">
            <input
              autoFocus
              type="text"
              placeholder="Titles, people, genres..."
              className="w-full bg-transparent border-b border-gray-600 text-white text-3xl py-2 focus:outline-none focus:border-red-600 transition-colors"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button 
              onClick={() => {setShowSearchOverlay(false); setSuggestions([]);}}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-400"
            >
              ✕
            </button>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="mt-4 w-full bg-gray-900/80 rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
                {suggestions.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-4 hover:bg-gray-800 text-white cursor-pointer border-b border-gray-800 last:border-0"
                    onClick={() => { /* Navigate to result */ }}
                  >
                    {s.titleAutocomplete || s.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;