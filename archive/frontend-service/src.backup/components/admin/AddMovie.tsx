import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, ButtonGroup } from "flowbite-react";
interface AddMovieFormProps {
  onClose: () => void;
}

const AddMovieForm: React.FC<AddMovieFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    language: '',
    posterUrl: '',
    videoFile: null as File | null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.videoFile) return alert('Please select a video file.');
    const token = Cookies.get('jwtToken');
    if (!token) return alert('Token not found. Please log in.');

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) =>
      data.append(key, val as string | Blob)
    );

    try {
      await axios.post('http://localhost:8080/api/movies/add', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Movie added successfully!');
      setFormData({ title: '', genre: '', language: '', posterUrl: '', videoFile: null });
    } catch (error: any) {
      alert(`Error adding movie: ${error}`);
    }
  };

  return (
   <>
    <motion.div initial={{ opacity: 0, y: 30 }}  animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}  className="max-w-md mx-auto p-6 rounded-xl shadow-2xl relative mt-6 bg-white/10 backdrop-blur-md border border-white/20 text-white">
      <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-red-500 text-2xl"> <X /> </button>
      <h2 className="text-3xl font-semibold mb-6 text-center">🎬 Add New Movie</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {['title', 'genre', 'language', 'posterUrl'].map((field) => (
          <input key={field} type="text" name={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={(formData as any)[field]} onChange={handleChange} required={field !== 'posterUrl'} className="p-3 px-4 bg-white/10 border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-red-500"/>
        ))}
        <input type="file" name="videoFile" accept="video/*" onChange={handleChange} required className="p-3 px-4 bg-white/10 border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-red-500"/>
        <button type="submit" className="mt-4 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition"> Submit Movie </button>
      </form>
    </motion.div>
   </>
  );
};

export default AddMovieForm;


/*

*/