import React from 'react';
import logo from '../../assets/logo.png'; // Update path as needed
import search_icon from '../../assets/search_icon.svg'
import bell_icon from "../../assets/bell_icon.svg";
import profile_img from "../../assets/profile_img.png";
import carat_icon from "../../assets/caret_icon.svg";

const Navbar = () => {
  return (
    <div className='fle'>
      
      <div className=''>
          <ul>
            <img src={logo} alt="Netflix" />
          <li>Home</li>
          <li>TV Shows</li>
          <li>Movies</li>
          <li>News & Popular</li>
          <li>My List</li>
          <li>Browse by Languages</li>
        </ul>
      </div>
      <div className='navbar-right'>
            <img src={search_icon} alt="search" style={{ width: '24px', height: '24px', backgroundColor: 'black'  }} />
            <img src={bell_icon} alt="bell" style={{ width: '24px', height: '24px', backgroundColor: 'black'  }}  />
            <div className='navbar-profile'>
               <img src={profile_img} alt="search" style={{ width: '24px', height: '24px' }} />
              <img src={carat_icon} alt="carat " />
            </div>
      </div>
    </div>
    //navbar-left
   
  );
};

export default Navbar;
