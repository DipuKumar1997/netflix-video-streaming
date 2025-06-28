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
