// src/api/movieService.ts
export const getAllMovies = async () => {
  const res = await fetch('/api/movies/all'); // Update if needed
  return await res.json();
};
