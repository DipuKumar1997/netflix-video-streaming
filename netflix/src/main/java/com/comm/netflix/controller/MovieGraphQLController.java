package com.comm.netflix.controller;

import com.comm.netflix.entity.Movie;
//import com.comm.netflix.model.Movie;
import com.comm.netflix.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MovieGraphQLController {

    @Autowired
    private MovieService movieService;

    @QueryMapping
    public List<Movie> allMovies() {
        return movieService.getAllMovies();
    }

    @QueryMapping
    public List<Movie> searchMovies(@Argument String title) {
        return movieService.searchByTitle(title);
    }

    @MutationMapping
    public Movie addMovie(
            @Argument String title,
            @Argument String description,
            @Argument String genre,
            @Argument String language,
            @Argument String releaseDate,
            @Argument String posterUrl,
            @Argument Boolean isSeries
    ) {
        Movie movie = Movie.builder()
                .title(title)
                .description(description)
                .genre(genre)
                .language(language)
                .releaseDate(releaseDate)
                .posterUrl(posterUrl)
                .isSeries(isSeries)
                .build();
        return movieService.addMovie(movie);
    }
}
