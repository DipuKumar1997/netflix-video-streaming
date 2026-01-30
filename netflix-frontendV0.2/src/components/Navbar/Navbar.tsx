// import { useState } from 'react';
// import logo from '../../assets/logo.png';
// import search_icon from '../../assets/search_icon.svg';
// import bell_icon from '../../assets/bell_icon.svg';
// import profile_img from '../../assets/profile_img.png';
// import caret_icon from '../../assets/caret_icon.svg';

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   return (
//     <nav className="bg-black text-white px-6 py-4">
//       <div className="flex items-center justify-between">
//         {/* Left side: logo and hamburger */}
//         <div className="flex items-center gap-8">
//           <img src={logo} alt="Netflix" width={100} height={30} />
//           {/* Hamburger button visible on small screens */}
//           <button
//             className="md:hidden focus:outline-none"
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle menu"
//           >
//             <svg
//               className="w-6 h-6 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               {menuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           {/* Menu - hidden on small screens, flex on md+ */}
//           <ul
//             className={`flex-col md:flex-row md:flex items-center gap-6 text-sm absolute md:static bg-black md:bg-transparent left-0 md:left-auto top-16 md:top-auto w-full md:w-auto transition-transform duration-300 ease-in-out ${
//               menuOpen ? 'flex translate-y-0' : 'hidden -translate-y-full'
//             }`}
//           >
//             <li className="cursor-pointer hover:text-gray-300">Home</li>
//             <li className="cursor-pointer hover:text-gray-300">TV Shows</li>
//             <li className="cursor-pointer hover:text-gray-300">Movies</li>
//             <li className="cursor-pointer hover:text-gray-300">News & Popular</li>
//             <li className="cursor-pointer hover:text-gray-300">My List</li>
//             <li className="cursor-pointer hover:text-gray-300">Browse by Languages</li>
//           </ul>
//         </div>

//         {/* Right side icons */}
//         <div className="hidden md:flex items-center gap-4">
//           <img src={search_icon} alt="search" width={24} height={24} />
//           <img src={bell_icon} alt="bell" width={24} height={24} />
//           <div className="flex items-center gap-2">
//             <img src={profile_img} alt="profile" width={32} height={32} className="rounded" />
//             <img src={caret_icon} alt="caret" width={16} height={16} />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;




// import { useState, useEffect, useRef } from 'react';
// import logo from '../../assets/logo.png';
// import search_icon from '../../assets/search_icon.svg';
// import bell_icon from '../../assets/bell_icon.svg';
// import profile_img from '../../assets/profile_img.png';
// import caret_icon from '../../assets/caret_icon.svg';

// const Navbar = () => {
//   // Explicitly type useState hooks
//   const [menuOpen, setMenuOpen] = useState<boolean>(false);
//   const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [suggestions, setSuggestions] = useState<string[]>([]); // Array of strings for suggestions

//   // Explicitly type useRef hooks
//   const searchInputRef = useRef<HTMLInputElement>(null); // Ref for an HTML input element
//   const overlayRef = useRef<HTMLDivElement>(null); // Ref for an HTML div element

//   // Function to toggle the search overlay
//   const toggleSearchOverlay = () => {
//     setShowSearchOverlay(prev => !prev);
//     // Focus the input field when the overlay opens
//     if (!showSearchOverlay) {
//       setTimeout(() => {
//         // Use optional chaining (?) and check if current exists and has a focus method
//         searchInputRef.current?.focus();
//       }, 100);
//     } else {
//       setSearchTerm(''); // Clear search term when closing
//       setSuggestions([]); // Clear suggestions when closing
//     }
//   };

//   // Function to handle search input changes and fetch suggestions
//   // e: React.ChangeEvent<HTMLInputElement> for input change events
//   const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchTerm(query);

//     if (query.length > 1) {
//       try {
//         // IMPORTANT: Replace with your actual backend URL
//         const response = await fetch(`http://localhost:8086/search/autocomplete-n-gram?query=${query}`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data: string[] = await response.json(); // Explicitly type the expected response
//         setSuggestions(data);
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//         setSuggestions([]);
//       }
//     } else {
//       setSuggestions([]);
//     }
//   };

//   // Function to handle actual search when Enter is pressed or button is clicked
//   // queryToSearch: string for the search term
//   const handlePerformSearch = (queryToSearch: string) => {
//     console.log("Performing search for:", queryToSearch);
//     // Example: In a real app, you would navigate to a search results page
//     // window.location.href = `/search-results?q=${queryToSearch}`;

//     // For now, let's just close the overlay after "searching"
//     toggleSearchOverlay();
//   };

//   // Handle Enter key press in search input
//   // e: React.KeyboardEvent<HTMLInputElement> for keyboard events on an input
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handlePerformSearch(searchTerm);
//     }
//   };

//   // Close overlay if clicked outside
//   useEffect(() => {
//     // event: MouseEvent for mouse events
//     const handleClickOutside = (event: MouseEvent) => {
//       // Check if overlayRef.current exists and if the event target is not part of the overlay
//       // Use as Node to satisfy contains method's parameter type
//       if (overlayRef.current && !overlayRef.current.contains(event.target as Node) && showSearchOverlay) {
//         // Make sure the click wasn't on the search icon itself
//         if (event.target !== document.getElementById('search-icon')) {
//           toggleSearchOverlay();
//         }
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showSearchOverlay]);


//   return (
//     <nav className="bg-black text-white px-6 py-4 relative z-50">
//       <div className="flex items-center justify-between">
//         {/* Left side: logo and hamburger */}
//         <div className="flex items-center gap-8">
//           <img src={logo} alt="Netflix" width={100} height={30} />
//           {/* Hamburger button visible on small screens */}
//           <button
//             className="md:hidden focus:outline-none"
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle menu"
//           >
//             <svg
//               className="w-6 h-6 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               {menuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           {/* Menu - hidden on small screens, flex on md+ */}
//           <ul
//             className={`flex-col md:flex-row md:flex items-center gap-6 text-sm absolute md:static bg-black md:bg-transparent left-0 md:left-auto top-16 md:top-auto w-full md:w-auto transition-transform duration-300 ease-in-out ${
//               menuOpen ? 'flex translate-y-0' : 'hidden -translate-y-full'
//             }`}
//           >
//             <li className="cursor-pointer hover:text-gray-300">Home</li>
//             <li className="cursor-pointer hover:text-gray-300">TV Shows</li>
//             <li className="cursor-pointer hover:text-gray-300">Movies</li>
//             <li className="cursor-pointer hover:text-gray-300">News & Popular</li>
//             <li className="cursor-pointer hover:text-gray-300">My List</li>
//             <li className="cursor-pointer hover:text-gray-300">Browse by Languages</li>
//           </ul>
//         </div>

//         {/* Right side icons */}
//         <div className="hidden md:flex items-center gap-4">
//           {/* Search Icon - NOW WITH ONCLICK HANDLER */}
//           <img
//             id="search-icon"
//             src={search_icon}
//             alt="search"
//             width={24}
//             height={24}
//             className="cursor-pointer"
//             onClick={toggleSearchOverlay}
//           />
//           <img src={bell_icon} alt="bell" width={24} height={24} />
//           <div className="flex items-center gap-2">
//             <img src={profile_img} alt="profile" width={32} height={32} className="rounded" />
//             <img src={caret_icon} alt="caret" width={16} height={16} />
//           </div>
//         </div>
//       </div>

//       {/* --- Search Overlay/Modal Implementation --- */}
//       {showSearchOverlay && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4" ref={overlayRef}>
//           <div className="relative w-full max-w-lg bg-gray-900 rounded-lg p-6 shadow-lg">
//             {/* Close button */}
//             <button
//               className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl leading-none"
//               onClick={toggleSearchOverlay}
//             >
//               &times;
//             </button>

//             <div className="flex items-center border border-gray-700 rounded-md overflow-hidden bg-gray-800">
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 placeholder="Search for movies, TV shows..."
//                 className="flex-grow p-3 bg-transparent text-white focus:outline-none"
//                 value={searchTerm}
//                 onChange={handleSearchInputChange}
//                 onKeyDown={handleKeyDown}
//               />
//               <button
//                 className="p-3 bg-red-600 hover:bg-red-700 text-white font-semibold"
//                 onClick={() => handlePerformSearch(searchTerm)}
//               >
//                 Search
//               </button>
//             </div>

//             {/* Display Suggestions */}
//             {suggestions.length > 0 && searchTerm.length > 1 && (
//               <ul className="mt-4 bg-gray-800 rounded-md max-h-60 overflow-y-auto">
//                 {suggestions.map((suggestion, index) => (
//                   <li
//                     key={index}
//                     className="p-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
//                     onClick={() => {
//                       setSearchTerm(suggestion);
//                       handlePerformSearch(suggestion);
//                     }}
//                   >
//                     {suggestion}
//                   </li>
//                 ))}
//               </ul>
//             )}
//             {searchTerm.length > 1 && suggestions.length === 0 && (
//                 <p className="mt-4 text-gray-400 text-center">No suggestions found.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;















// import { useState, useEffect, useRef } from 'react';
// import logo from '../../assets/logo.png';
// import search_icon from '../../assets/search_icon.svg';
// import bell_icon from '../../assets/bell_icon.svg';
// import profile_img from '../../assets/profile_img.png';
// import caret_icon from '../../assets/caret_icon.svg';

// // Define an interface for the structure of your suggestion object from the backend
// interface MovieSuggestion {
//   id: string;
//   title: string;
//   description: string;
//   titleAutocomplete: string; // The field your backend sends for suggestions
// }

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState<boolean>(false);
//   const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   // Correctly type suggestions as an array of MovieSuggestion objects
//   const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);

//   const searchInputRef = useRef<HTMLInputElement>(null);
//   const overlayRef = useRef<HTMLDivElement>(null);

//   const toggleSearchOverlay = () => {
//     setShowSearchOverlay(prev => !prev);
//     if (!showSearchOverlay) {
//       setTimeout(() => {
//         searchInputRef.current?.focus();
//       }, 100);
//     } else {
//       setSearchTerm('');
//       setSuggestions([]);
//     }
//   };

//   const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchTerm(query);

//     if (query.length > 1) {
//       try {
//         const response = await fetch(`http://localhost:8086/search/autocomplete-n-gram?query=${query}`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         // Explicitly type the data received from the backend
//         const data: MovieSuggestion[] = await response.json();
//         setSuggestions(data); // Store the array of objects
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//         setSuggestions([]);
//       }
//     } else {
//       setSuggestions([]);
//     }
//   };

//   const handlePerformSearch = (queryToSearch: string) => {
//     console.log("Performing search for:", queryToSearch);
//     // In a real app, you would typically navigate or update parent state
//     toggleSearchOverlay();
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handlePerformSearch(searchTerm);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (overlayRef.current && !overlayRef.current.contains(event.target as Node) && showSearchOverlay) {
//         if (event.target !== document.getElementById('search-icon')) {
//           toggleSearchOverlay();
//         }
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showSearchOverlay]);


//   return (
//     <nav className="bg-black text-white px-6 py-4 relative z-50">
//       <div className="flex items-center justify-between">
//         {/* ... (existing left side code - no changes here) ... */}
//         <div className="flex items-center gap-8">
//           <img src={logo} alt="Netflix" width={100} height={30} />
//           <button
//             className="md:hidden focus:outline-none"
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle menu"
//           >
//             <svg
//               className="w-6 h-6 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               {menuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           <ul
//             className={`flex-col md:flex-row md:flex items-center gap-6 text-sm absolute md:static bg-black md:bg-transparent left-0 md:left-auto top-16 md:top-auto w-full md:w-auto transition-transform duration-300 ease-in-out ${
//               menuOpen ? 'flex translate-y-0' : 'hidden -translate-y-full'
//             }`}
//           >
//             <li className="cursor-pointer hover:text-gray-300">Home</li>
//             <li className="cursor-pointer hover:text-gray-300">TV Shows</li>
//             <li className="cursor-pointer hover:text-gray-300">Movies</li>
//             <li className="cursor-pointer hover:text-gray-300">News & Popular</li>
//             <li className="cursor-pointer hover:text-gray-300">My List</li>
//             <li className="cursor-pointer hover:text-gray-300">Browse by Languages</li>
//           </ul>
//         </div>

//         {/* ... (existing right side icons code - no changes here) ... */}
//         <div className="hidden md:flex items-center gap-4">
//           <img
//             id="search-icon"
//             src={search_icon}
//             alt="search"
//             width={24}
//             height={24}
//             className="cursor-pointer"
//             onClick={toggleSearchOverlay}
//           />
//           <img src={bell_icon} alt="bell" width={24} height={24} />
//           <div className="flex items-center gap-2">
//             <img src={profile_img} alt="profile" width={32} height={32} className="rounded" />
//             <img src={caret_icon} alt="caret" width={16} height={16} />
//           </div>
//         </div>
//       </div>

//       {/* --- Search Overlay/Modal Implementation --- */}
//       {showSearchOverlay && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4" ref={overlayRef}>
//           <div className="relative w-full max-w-lg bg-gray-900 rounded-lg p-6 shadow-lg">
//             {/* Close button */}
//             <button
//               className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl leading-none"
//               onClick={toggleSearchOverlay}
//             >
//               &times;
//             </button>

//             <div className="flex items-center border border-gray-700 rounded-md overflow-hidden bg-gray-800">
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 placeholder="Search for movies, TV shows..."
//                 className="flex-grow p-3 bg-transparent text-white focus:outline-none"
//                 value={searchTerm}
//                 onChange={handleSearchInputChange}
//                 onKeyDown={handleKeyDown}
//               />
//               <button
//                 className="p-3 bg-red-600 hover:bg-red-700 text-white font-semibold"
//                 onClick={() => handlePerformSearch(searchTerm)}
//               >
//                 Search
//               </button>
//             </div>

//             {/* Display Suggestions - IMPORTANT CHANGES HERE */}
//             {suggestions.length > 0 && searchTerm.length > 1 && (
//               <ul className="mt-4 bg-gray-800 rounded-md max-h-60 overflow-y-auto">
//                 {suggestions.map((suggestion) => ( // Removed index, using suggestion.id for key
//                   <li
//                     key={suggestion.id} // Use the unique ID from the suggestion object as the key
//                     className="p-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
//                     onClick={() => {
//                       // Use the 'title' or 'titleAutocomplete' from the object for the search term
//                       setSearchTerm(suggestion.titleAutocomplete || suggestion.title);
//                       handlePerformSearch(suggestion.titleAutocomplete || suggestion.title);
//                     }}
//                   >
//                     {/* Render the 'title' or 'titleAutocomplete' property of the object */}
//                     {suggestion.titleAutocomplete || suggestion.title}
//                   </li>
//                 ))}
//               </ul>
//             )}
//             {searchTerm.length > 1 && suggestions.length === 0 && (
//                 <p className="mt-4 text-gray-400 text-center">No suggestions found.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;












import { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png';
import search_icon from '../../assets/search_icon.svg';
import bell_icon from '../../assets/bell_icon.svg';
import profile_img from '../../assets/profile_img.png';
import caret_icon from '../../assets/caret_icon.svg';

// Define an interface for the structure of your suggestion object from the backend
interface MovieSuggestion {
  id: string;
  title: string;
  description: string;
  titleAutocomplete: string; // The field your backend sends for suggestions
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const toggleSearchOverlay = () => {
    setShowSearchOverlay(prev => !prev);
    if (!showSearchOverlay) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 1) { // Fetch suggestions only if query is at least 2 characters
      try {
        // IMPORTANT: Replace with your actual backend URL
        const response = await fetch(`http://localhost:8086/search/autocomplete-n-gram?query=${query}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MovieSuggestion[] = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handlePerformSearch = (queryToSearch: string) => {
    console.log("Performing search for:", queryToSearch);
    // In a real application, you would typically:
    // 1. Redirect to a search results page: window.location.href = `/search-results?q=${queryToSearch}`;
    // 2. Or, if search results are displayed in the overlay/modal, fetch them here.
    // For now, we'll just close the overlay.
    toggleSearchOverlay();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePerformSearch(searchTerm);
    }
  };

  // Effect to handle closing overlay on Escape key press and click outside
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSearchOverlay) {
        toggleSearchOverlay();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node) && showSearchOverlay) {
        // Check if the click wasn't on the search icon itself or its parent container
        const searchIconElement = document.getElementById('search-icon');
        if (!searchIconElement || !searchIconElement.contains(event.target as Node)) {
          toggleSearchOverlay();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchOverlay]);


  return (
    <nav className="bg-black text-white px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Left side: logo and hamburger */}
        <div className="flex items-center gap-8">
          <img src={logo} alt="Netflix" width={100} height={30} />
          {/* Hamburger button visible on small screens */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Menu - hidden on small screens, flex on md+ */}
          <ul
            className={`flex-col md:flex-row md:flex items-center gap-6 text-sm absolute md:static bg-black md:bg-transparent left-0 md:left-auto top-16 md:top-auto w-full md:w-auto transition-transform duration-300 ease-in-out ${
              menuOpen ? 'flex translate-y-0' : 'hidden -translate-y-full'
            }`}
          >
            <li className="cursor-pointer hover:text-gray-300">Home</li>
            <li className="cursor-pointer hover:text-gray-300">TV Shows</li>
            <li className="cursor-pointer hover:text-gray-300">Movies</li>
            <li className="cursor-pointer hover:text-gray-300">News & Popular</li>
            <li className="cursor-pointer hover:text-gray-300">My List</li>
            <li className="cursor-pointer hover:text-gray-300">Browse by Languages</li>
          </ul>
        </div>

        {/* Right side icons */}
        <div className="hidden md:flex items-center gap-4">
          <img
            id="search-icon"
            src={search_icon}
            alt="search"
            width={24}
            height={24}
            className="cursor-pointer"
            onClick={toggleSearchOverlay}
          />
          <img src={bell_icon} alt="bell" width={24} height={24} />
          <div className="flex items-center gap-2">
            <img src={profile_img} alt="profile" width={32} height={32} className="rounded" />
            <img src={caret_icon} alt="caret" width={16} height={16} />
          </div>
        </div>
      </div>

      {/* --- Search Overlay/Modal Implementation --- */}
      {showSearchOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-start pt-20 z-50 px-4" ref={overlayRef}> {/* Adjusted justify-content and added padding-top */}
          <div className="relative w-full max-w-lg bg-gray-900 rounded-lg p-3 shadow-lg"> {/* Reduced padding */}
            <div className="flex items-center border border-gray-700 rounded-md overflow-hidden bg-gray-800">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for movies, TV shows..."
                className="flex-grow p-3 bg-transparent text-white focus:outline-none"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
              />
              {/* Removed the 'Search' button here */}
            </div>

            {/* Close button - Styled like a proper icon */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200"
              onClick={toggleSearchOverlay}
              aria-label="Close search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Display Suggestions */}
            {searchTerm.length > 1 && ( // Only show suggestions if searchTerm is long enough
                suggestions.length > 0 ? (
                    <ul className="mt-4 bg-gray-800 rounded-md max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.id}
                                className="p-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                                onClick={() => {
                                    setSearchTerm(suggestion.titleAutocomplete || suggestion.title);
                                    handlePerformSearch(suggestion.titleAutocomplete || suggestion.title);
                                }}
                            >
                                {suggestion.titleAutocomplete || suggestion.title}
                            </li>
                        ))}
                    </ul>
                ) : (
                    // Show "No suggestions found" only if search term is long enough and no suggestions
                    <p className="mt-4 text-gray-400 text-center">No suggestions found.</p>
                )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;






















// import { useState, useEffect, useRef } from 'react';
// import logo from '../../assets/logo.png';
// import search_icon from '../../assets/search_icon.svg';
// import bell_icon from '../../assets/bell_icon.svg';
// import profile_img from '../../assets/profile_img.png';
// import caret_icon from '../../assets/caret_icon.svg';

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [query, setQuery] = useState('');
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Close search box when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setSearchOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const fetchSuggestions = async (q: string) => {
//     try {
//       const res = await fetch(`/search/autocomplete?query=${q}`);
//       const data = await res.json();
//       setSuggestions(data);
//     } catch (err) {
//       console.error('Autocomplete failed', err);
//     }
//   };

//   useEffect(() => {
//     if (query.length >= 2) {
//       const timeout = setTimeout(() => {
//         fetchSuggestions(query);
//       }, 300); // debounce
//       return () => clearTimeout(timeout);
//     }
//     setSuggestions([]);
//   }, [query]);

//   return (
//     <nav className="bg-black text-white px-6 py-4 relative">
//       <div className="flex items-center justify-between">
//         {/* Logo & Hamburger */}
//         <div className="flex items-center gap-8">
//           <img src={logo} alt="Netflix" width={100} height={30} />

//           {/* Hamburger */}
//           <button
//             className="md:hidden focus:outline-none"
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle menu"
//           >
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               {menuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           {/* Navigation Links */}
//           <ul className={`flex-col md:flex-row md:flex items-center gap-6 text-sm absolute md:static bg-black md:bg-transparent left-0 md:left-auto top-16 md:top-auto w-full md:w-auto transition-transform duration-300 ease-in-out ${menuOpen ? 'flex translate-y-0' : 'hidden -translate-y-full'}`}>
//             <li className="cursor-pointer hover:text-gray-300">Home</li>
//             <li className="cursor-pointer hover:text-gray-300">TV Shows</li>
//             <li className="cursor-pointer hover:text-gray-300">Movies</li>
//             <li className="cursor-pointer hover:text-gray-300">News & Popular</li>
//             <li className="cursor-pointer hover:text-gray-300">My List</li>
//             <li className="cursor-pointer hover:text-gray-300">Browse by Languages</li>
//           </ul>
//         </div>

//         {/* Right side icons */}
//         <div className="hidden md:flex items-center gap-4 relative">
//           <img
//             src={search_icon}
//             alt="search"
//             width={24}
//             height={24}
//             className="cursor-pointer"
//             onClick={() => setSearchOpen(!searchOpen)}
//           />

//           <img src={bell_icon} alt="bell" width={24} height={24} />
//           <div className="flex items-center gap-2">
//             <img src={profile_img} alt="profile" width={32} height={32} className="rounded" />
//             <img src={caret_icon} alt="caret" width={16} height={16} />
//           </div>

//           {/* Search Dropdown */}
//           {searchOpen && (
//             <div className="absolute top-10 right-0 bg-white text-black rounded shadow-md w-64 p-3 z-50" ref={inputRef}>
//               <input
//                 type="text"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search movies..."
//                 className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               {suggestions.length > 0 && (
//                 <ul className="mt-2 max-h-40 overflow-y-auto">
//                   {suggestions.map((s, index) => (
//                     <li
//                       key={index}
//                       className="p-2 hover:bg-gray-200 cursor-pointer rounded"
//                       onClick={() => {
//                         setQuery(s);
//                         setSearchOpen(false);
//                       }}
//                     >
//                       {s}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;












































































// import { useState, useEffect } from 'react';
// import logo from '../../assets/logo.png';
// import search_icon from '../../assets/search_icon.svg';
// import bell_icon from '../../assets/bell_icon.svg';
// import profile_img from '../../assets/profile_img.png';
// import caret_icon from '../../assets/caret_icon.svg';

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showNavbar, setShowNavbar] = useState(true); // State for scroll hide/show
//   // Using a ref to store the last scroll position so it's stable across renders
//   const lastScrollY = useState(0)[0]; // Initialize with 0

//   // Handle scroll to hide/show navbar
//   useEffect(() => {
//     const handleScroll = () => {
//       // Get current scroll position
//       const currentScrollY = window.scrollY;

//       // Determine scroll direction
//       if (currentScrollY > lastScrollY) {
//         // Scrolling down
//         setShowNavbar(false);
//       } else {
//         // Scrolling up
//         setShowNavbar(true);
//       }
//       // Update last scroll position (using a ref or a non-state variable here might be better)
//       // For simplicity in this example, we'll let it re-render or you can use a ref:
//       // lastScrollY.current = currentScrollY;
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []); // Empty dependency array means this effect runs once on mount

//   // Class for the navbar based on scroll state
//   const navbarClasses = `
//     fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out
//     ${showNavbar ? 'translate-y-0' : '-translate-y-full'}
//     bg-gradient-to-b from-black via-black/80 to-transparent
//     py-3 px-6 md:px-12 lg:px-20 // Reduced vertical padding
//   `;

//   return (
//     <nav className={navbarClasses}>
//       <div className="container mx-auto flex items-center justify-between h-full">
//         {/* Left side: logo and navigation links */}
//         <div className="flex items-center gap-6 md:gap-8"> {/* Reduced gap */}
//           <img src={logo} alt="Netflix" className="w-20 md:w-24 h-auto cursor-pointer" /> {/* Reduced logo size */}

//           {/* Hamburger button visible on small screens */}
//           <button
//             className="md:hidden focus:outline-none z-50"
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle menu"
//           >
//             <svg
//               className="w-6 h-6 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               {menuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           {/* Menu links - desktop (flex) and mobile (absolute overlay) */}
//           <ul
//             className={`
//               flex-col md:flex-row items-center gap-4 md:gap-6 text-sm font-normal // Adjusted font size and weight
//               absolute md:static z-40
//               bg-black md:bg-transparent
//               left-0 w-full px-6 md:px-0 py-4 md:py-0
//               transition-transform duration-300 ease-in-out
//               // Mobile specific display & transform
//               ${menuOpen ? 'flex translate-y-0 opacity-100 top-full' : 'hidden -translate-y-full opacity-0 top-16'}
//               // Desktop: Always flex, no transform/opacity
//               md:flex md:translate-y-0 md:opacity-100
//             `}
//           >
//             <li className="cursor-pointer hover:text-gray-300 py-2 md:py-0">Home</li>
//             <li className="cursor-pointer hover:text-gray-300 py-2 md:py-0">TV Shows</li>
//             <li className="cursor-pointer hover:text-gray-300 py-2 md:py-0">Movies</li>
//             <li className="cursor-pointer hover:text-gray-300 py-2 md:py-0">News & Popular</li>
//             <li className="cursor-pointer hover:text-gray-300 py-2 md:py-0">My List</li>
//             <li className="cursor-pointer hover:text-gray-300 py-2 md:py-0">Browse by Languages</li>
//           </ul>
//         </div>

//         {/* Right side icons - hidden on small screens, flex on md+ */}
//         <div className="hidden md:flex items-center gap-4"> {/* Reduced gap */}
//           <img src={search_icon} alt="search" className="w-5 h-5 cursor-pointer" /> {/* Slightly smaller icons */}
//           <img src={bell_icon} alt="bell" className="w-5 h-5 cursor-pointer" />
//           <div className="flex items-center gap-2 cursor-pointer">
//             <img src={profile_img} alt="profile" className="w-7 h-7 rounded-sm" /> {/* Reduced profile img size */}
//             <img src={caret_icon} alt="caret" className="w-3 h-3" /> {/* Reduced caret size */}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;