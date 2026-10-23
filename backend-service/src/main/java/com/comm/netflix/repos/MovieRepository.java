package com.comm.netflix.repos;

//import com.comm.netflix.entity.Movie;
//import com.comm.netflix.model.Movie;
import org.example.commonmodel.entity.Movie;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MovieRepository extends MongoRepository<Movie, String> {
    List<Movie> findByTitleContainingIgnoreCase(String title);
    List<Movie> findByGenre(String genre);
}
