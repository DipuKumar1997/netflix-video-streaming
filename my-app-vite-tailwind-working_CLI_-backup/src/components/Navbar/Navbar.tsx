import { useState } from 'react';
import logo from '../../assets/logo.png';
import search_icon from '../../assets/search_icon.svg';
import bell_icon from '../../assets/bell_icon.svg';
import profile_img from '../../assets/profile_img.png';
import caret_icon from '../../assets/caret_icon.svg';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="bg-black text-white px-6 py-4">
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
          <img src={search_icon} alt="search" width={24} height={24} />
          <img src={bell_icon} alt="bell" width={24} height={24} />
          <div className="flex items-center gap-2">
            <img src={profile_img} alt="profile" width={32} height={32} className="rounded" />
            <img src={caret_icon} alt="caret" width={16} height={16} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

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