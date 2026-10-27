import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddMovieFormProps {
  onClose: () => void;
}

const AddMovieForm: React.FC<AddMovieFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    language: '',
    posterUrl: '',
    isPremium: false,
    videoFile: null as File | null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.videoFile) return alert('Please select a video file.');
    const token = Cookies.get('jwtToken');
    if (!token) return alert('Token not found. Please log in.');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('genre', formData.genre);
    data.append('language', formData.language);
    data.append('posterUrl', formData.posterUrl);
    data.append('isPremium', String(formData.isPremium));
    data.append('videoFile', formData.videoFile);

    try {
      await axios.post('/api/movies/add', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Movie added successfully!');
      setFormData({ title: '', genre: '', language: '', posterUrl: '', isPremium: false, videoFile: null });
      onClose();
    } catch (error: any) {
      alert(`Error adding movie: ${error?.response?.data || error.message || error}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto p-6 rounded-xl shadow-2xl relative mt-6 bg-white/10 backdrop-blur-md border border-white/20 text-white"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-red-500 text-2xl cursor-pointer">
        <X />
      </button>
      <h2 className="text-3xl font-semibold mb-6 text-center">🎬 Add New Movie</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {['title', 'genre', 'language', 'posterUrl'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={(formData as any)[field]}
            onChange={handleChange}
            required={field !== 'posterUrl'}
            className="p-3 px-4 bg-white/10 border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
          />
        ))}

        {/* Premium Selection Checkbox */}
        <label className="flex items-center gap-3 p-3 bg-white/10 border border-white/30 rounded cursor-pointer hover:bg-white/20 transition select-none">
          <input
            type="checkbox"
            name="isPremium"
            checked={formData.isPremium}
            onChange={handleChange}
            className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <Crown size={18} className={formData.isPremium ? "text-amber-400" : "text-gray-400"} />
            <span className={formData.isPremium ? "text-amber-400 font-bold text-sm" : "text-gray-300 text-sm"}>
              {formData.isPremium ? "Premium Video (Requires Subscription)" : "Free Video"}
            </span>
          </div>
        </label>

        <input
          type="file"
          name="videoFile"
          accept="video/*"
          onChange={handleChange}
          required
          className="p-3 px-4 bg-white/10 border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
        />
        <button
          type="submit"
          className="mt-4 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition cursor-pointer"
        >
          Submit Movie
        </button>
      </form>
    </motion.div>
  );
};

export default AddMovieForm;