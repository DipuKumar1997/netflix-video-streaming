// src/api/movieService.ts
export const getAllMovies = async () => {
  const res = await fetch('http://localhost:8080/api/movies/all'); // Update if needed
  return await res.json();
};
