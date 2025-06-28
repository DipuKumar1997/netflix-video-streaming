import { useState } from 'react';
import GetUsers from '../admin/page';  // Make sure this points to your simplified GetUsers component
import AddMovieForm from '../admin/AddMovie';
import background_banner from "../../assets/background_banner.jpg";

const Admin = () => {
  const [showUsers, setShowUsers] = useState(false);
  const [showAddMovieForm, setShowAddMovieForm] = useState(false);

  const toggleUsers = () => {
    setShowUsers(prev => !prev);
    if (!showUsers) setShowAddMovieForm(false);
  };

  const toggleAddMovie = () => {
    setShowAddMovieForm(prev => !prev);
    if (!showAddMovieForm) setShowUsers(false);
  };

  return (
    <div className="relative flex flex-col min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={background_banner}
          alt="Background"
          className="absolute inset-0 object-cover w-full h-full z-0 opacity-100"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      {/* Buttons */}
      <div className="relative z-10 p-5 flex gap-4">
        <button
          onClick={toggleUsers}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          {showUsers ? 'Close' : 'Get All Users'}
        </button>
        <button
          onClick={toggleAddMovie}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          {showAddMovieForm ? 'Close Add Movie' : 'Add Movie'}
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-10">
        {showUsers && <GetUsers />}
        {showAddMovieForm && <AddMovieForm onClose={toggleAddMovie} />}
      </div>
    </div>
  );
};

export default Admin;