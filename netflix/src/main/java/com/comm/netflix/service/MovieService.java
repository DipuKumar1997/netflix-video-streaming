package com.comm.netflix.service;

//import com.comm.netflix.entity.Movie;
//import com.comm.netflix.model.Movie;
import com.comm.netflix.repos.MovieRepository;
//import com.comm.netflix.repository.MovieRepository;
import org.example.commonmodel.entity.Movie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepository;
    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
    public List<Movie> searchByTitle(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }
}
